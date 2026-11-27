import { NextResponse } from "next/server";
import { z } from "zod";
import { isSuperAdminEmail } from "@/lib/auth/roles";
import {
  FirebaseAdminConfigurationError,
  getInfluNexAdminServices,
} from "@/lib/firebase/admin";
import { INFLUNEX_TENANT_ID } from "@/lib/firebase/isolation";
import {
  appendApiMutationAuditLog,
  verifyApiMutationRequest,
} from "@/lib/security/apiGuard";

export const runtime = "nodejs";

const OrderMutationSchema = z.object({
  action: z.enum(["UPSERT_ORDER", "DELETE_ORDER"]),
  order: z
    .object({
      orderCode: z.string().min(4).max(60),
      brandName: z.string().min(1).max(120),
      creatorName: z.string().min(1).max(120),
      serviceTitle: z.string().min(1).max(200),
      grossTl: z.number().positive(),
      bankTransactionRef: z.string().min(2).max(120),
      state: z.enum([
        "PAYMENT_REVIEW",
        "PAID",
        "COMPLETED",
        "PAYOUT_COMPLETED",
      ]),
      adDisclosureVerified: z.boolean(),
      publishUrl: z.string().max(500).optional(),
      createdAt: z.string().max(80),
    })
    .optional(),
  orderCode: z.string().min(4).max(60).optional(),
});

async function requireSuperAdminReader(req: Request) {
  const authorization = req.headers.get("authorization") || "";
  const idToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
  if (!idToken) {
    return { ok: false as const, status: 401, error: "AUTHENTICATION_REQUIRED" };
  }

  let services;
  try {
    services = getInfluNexAdminServices();
  } catch (err) {
    if (err instanceof FirebaseAdminConfigurationError) {
      return {
        ok: false as const,
        status: 503,
        error: "AUTHENTICATION_SERVICE_UNAVAILABLE",
      };
    }
    return { ok: false as const, status: 500, error: "INTERNAL_ERROR" };
  }

  try {
    const decoded = await services.auth.verifyIdToken(idToken, true);
    const isAdmin =
      isSuperAdminEmail(decoded.email) || decoded.role === "ADMIN";
    if (!isAdmin) {
      return { ok: false as const, status: 403, error: "RBAC_FORBIDDEN" };
    }
    return { ok: true as const, services, uid: decoded.uid };
  } catch {
    return {
      ok: false as const,
      status: 401,
      error: "INVALID_AUTHENTICATION_TOKEN",
    };
  }
}

export async function GET(req: Request) {
  const auth = await requireSuperAdminReader(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const db = auth.services.firestore;
    const [ordersSnap, campaignsSnap, creatorsSnap, servicesSnap] =
      await Promise.all([
        db.collection("influnex_orders").get(),
        db.collection("influnex_campaigns").get(),
        db.collection("influnex_publicCreatorProfiles").get(),
        db.collection("influnex_services").get(),
      ]);

    return NextResponse.json({
      tenantId: INFLUNEX_TENANT_ID,
      orders: ordersSnap.docs.map((d) => d.data()),
      campaigns: campaignsSnap.docs.map((d) => d.data()),
      creators: creatorsSnap.docs.map((d) => d.data()),
      services: servicesSnap.docs.map((d) => d.data()),
    });
  } catch (error) {
    console.error("[ADMIN_WORKSPACE_GET_FAILED]", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const guard = await verifyApiMutationRequest(req, {
    endpoint: "/api/v1/admin/workspace",
    action: "ADMIN_WORKSPACE_MUTATION",
    allowedRoles: ["ADMIN"],
    maxRequestsPerMinute: 60,
  });

  if (!guard.allowed) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const parsed = OrderMutationSchema.safeParse(
    await req.json().catch(() => null)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const db = getInfluNexAdminServices().firestore;
    const { action, order, orderCode } = parsed.data;

    if (action === "UPSERT_ORDER" && order) {
      await db
        .collection("influnex_orders")
        .doc(order.orderCode)
        .set(
          {
            ...order,
            tenantId: INFLUNEX_TENANT_ID,
            updatedBy: guard.actorUid,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

      appendApiMutationAuditLog({
        endpoint: "/api/v1/admin/workspace",
        actorUid: guard.actorUid,
        actorRole: guard.actorRole,
        action: "UPSERT_ORDER",
        metadata: {
          orderCode: order.orderCode,
          state: order.state,
          grossTl: order.grossTl,
        },
      });

      return NextResponse.json({ ok: true, orderCode: order.orderCode });
    }

    if (action === "DELETE_ORDER" && orderCode) {
      await db.collection("influnex_orders").doc(orderCode).delete();
      appendApiMutationAuditLog({
        endpoint: "/api/v1/admin/workspace",
        actorUid: guard.actorUid,
        actorRole: guard.actorRole,
        action: "DELETE_ORDER",
        metadata: { orderCode },
      });
      return NextResponse.json({ ok: true, deletedOrderCode: orderCode });
    }

    return NextResponse.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
  } catch (error) {
    console.error("[ADMIN_WORKSPACE_POST_FAILED]", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
