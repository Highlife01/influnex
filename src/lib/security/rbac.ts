/**
 * RBAC (Role-Based Access Control), Resource Ownership & PII Log Redaction
 */

import type { OrderRecord, UserRole } from "../types/domain";

export interface AuthenticatedActor {
  uid: string;
  role: UserRole;
  emailVerified: boolean;
  mfaVerified?: boolean;
}

export function assertAdminRole(
  actor: AuthenticatedActor,
  requireMfaForFinancialAction = false
): void {
  if (actor.role !== "ADMIN") {
    throw new Error("[RBAC_FORBIDDEN] Admin role required for this action.");
  }
  if (requireMfaForFinancialAction && !actor.mfaVerified) {
    throw new Error(
      "[RBAC_MFA_REQUIRED] Admin MFA verification is required for financial approval or payout actions."
    );
  }
}

export function assertOrderAccess(
  actor: AuthenticatedActor,
  order: Pick<OrderRecord, "advertiserId" | "creatorId">
): void {
  if (actor.role === "ADMIN") return;
  if (
    actor.uid !== order.advertiserId &&
    actor.uid !== order.creatorId
  ) {
    throw new Error(
      "[IDOR_BLOCKED] Unauthorized attempt to access an order belonging to another user."
    );
  }
}

export function assertPrivateProfileAccess(
  actor: AuthenticatedActor,
  targetCreatorId: string
): void {
  if (actor.role === "ADMIN") return;
  if (actor.uid !== targetCreatorId) {
    throw new Error(
      "[IDOR_BLOCKED] Unauthorized attempt to access private creator profile or banking data."
    );
  }
}

export function maskIban(iban: string): string {
  const cleaned = iban.replace(/\s+/g, "").toUpperCase();
  if (cleaned.length < 10) return "TR** ****";
  return `${cleaned.slice(0, 4)} **** **** **** **** ${cleaned.slice(-4)}`;
}

export function redactSensitiveLogData<T extends Record<string, unknown>>(
  payload: T
): Record<string, unknown> {
  const sensitiveKeys = new Set([
    "iban",
    "nationalId",
    "taxNumber",
    "privateKey",
    "apiKey",
    "password",
    "phone",
    "privateEmail",
  ]);

  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (sensitiveKeys.has(key)) {
      output[key] = "[REDACTED]";
    } else {
      output[key] = value;
    }
  }
  return output;
}
