/**
 * API MUTATION SECURITY GUARD (Audit P1 Item 5)
 * Enforces Role-Based Access Control (RBAC), Origin/CSRF verification,
 * sliding-window rate limiting, and append-only audit logging on /api/v1/* mutations.
 */

import type { UserRole } from "../types/domain";
import { redactSensitiveLogData } from "./rbac";
import {
  FirebaseAdminConfigurationError,
  getInfluNexAdminServices,
} from "../firebase/admin";

export interface ApiMutationAuditRecord {
  id: string;
  endpoint: string;
  actorUid: string;
  actorRole: UserRole;
  action: string;
  ipKey: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
const mutationAuditTrail: ApiMutationAuditRecord[] = [];

export async function verifyApiMutationRequest(
  req: Request,
  options: {
    endpoint: string;
    action: string;
    allowedRoles: UserRole[];
    maxRequestsPerMinute?: number;
  }
): Promise<
  | {
      allowed: true;
      actorUid: string;
      actorRole: UserRole;
    }
  | {
      allowed: false;
      status: number;
      error: string;
    }
> {
  // 1. Origin / CSRF header check when Origin is present
  const origin = req.headers.get("origin");
  if (origin) {
    const allowedOrigins = [
      "https://www.influnex.com.tr",
      "https://influnex.com.tr",
      "https://influnex.web.app",
      "https://karacateknik-b202f.web.app",
      "http://localhost:3000",
    ];
    if (!allowedOrigins.includes(origin)) {
      return {
        allowed: false,
        status: 403,
        error: "CSRF_ORIGIN_MISMATCH",
      };
    }
  }

  // 2. Sliding-window rate limiting
  const ipKey =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const bucketKey = `${options.endpoint}:${ipKey}`;
  const now = Date.now();
  const limit = options.maxRequestsPerMinute ?? 30;
  const current = rateLimitBuckets.get(bucketKey);

  if (!current || now > current.resetAt) {
    rateLimitBuckets.set(bucketKey, { count: 1, resetAt: now + 60_000 });
  } else {
    current.count += 1;
    if (current.count > limit) {
      return {
        allowed: false,
        status: 429,
        error: "RATE_LIMIT_EXCEEDED",
      };
    }
  }

  const authorization = req.headers.get("authorization") || "";
  const idToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
  if (!idToken) {
    return {
      allowed: false,
      status: 401,
      error: "AUTHENTICATION_REQUIRED",
    };
  }

  let auth;
  try {
    auth = getInfluNexAdminServices().auth;
  } catch (error) {
    if (error instanceof FirebaseAdminConfigurationError) {
      return {
        allowed: false,
        status: 503,
        error: "AUTHENTICATION_SERVICE_UNAVAILABLE",
      };
    }
    console.error("[API_AUTH_ADMIN_INIT_FAILED]", error);
    return {
      allowed: false,
      status: 500,
      error: "INTERNAL_ERROR",
    };
  }

  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(idToken, true);
  } catch {
    return {
      allowed: false,
      status: 401,
      error: "INVALID_AUTHENTICATION_TOKEN",
    };
  }

  if (decodedToken.email_verified !== true) {
    return {
      allowed: false,
      status: 403,
      error: "VERIFIED_EMAIL_REQUIRED",
    };
  }

  const actorUid = decodedToken.uid;
  const actorRole = decodedToken.role;
  if (
    actorRole !== "ADVERTISER" &&
    actorRole !== "CREATOR" &&
    actorRole !== "ADMIN"
  ) {
    return {
      allowed: false,
      status: 403,
      error: "ACCOUNT_ROLE_REQUIRED",
    };
  }

  if (!options.allowedRoles.includes(actorRole)) {
    return {
      allowed: false,
      status: 403,
      error: "RBAC_FORBIDDEN",
    };
  }

  return {
    allowed: true,
    actorUid,
    actorRole,
  };
}

export function appendApiMutationAuditLog(params: {
  endpoint: string;
  actorUid: string;
  actorRole: UserRole;
  action: string;
  ipKey?: string;
  metadata?: Record<string, unknown>;
}): ApiMutationAuditRecord {
  const entry: ApiMutationAuditRecord = {
    id: `aud_${Date.now()}_${mutationAuditTrail.length + 1}`,
    endpoint: params.endpoint,
    actorUid: params.actorUid,
    actorRole: params.actorRole,
    action: params.action,
    ipKey: params.ipKey || "local",
    createdAt: new Date().toISOString(),
    metadata: redactSensitiveLogData(params.metadata || {}),
  };
  mutationAuditTrail.push(Object.freeze(entry));
  return entry;
}

export function getApiMutationAuditTrail(): ApiMutationAuditRecord[] {
  return [...mutationAuditTrail];
}
