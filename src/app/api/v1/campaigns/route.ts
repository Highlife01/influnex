import { NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/data/marketplaceStore";
import { INFLUNEX_TENANT_ID } from "@/lib/firebase/isolation";
import {
  appendApiMutationAuditLog,
  verifyApiMutationRequest,
} from "@/lib/security/apiGuard";
import { CampaignCreateInputSchema } from "@/lib/validators/schemas";

export async function GET() {
  const campaigns = marketplaceStore.getOpenCampaigns();
  return NextResponse.json({
    tenantId: INFLUNEX_TENANT_ID,
    total: campaigns.length,
    items: campaigns,
  });
}

export async function POST(req: Request) {
  const guard = await verifyApiMutationRequest(req, {
    endpoint: "/api/v1/campaigns",
    action: "CREATE_CAMPAIGN",
    allowedRoles: ["ADVERTISER", "ADMIN"],
    maxRequestsPerMinute: 15,
  });

  if (!guard.allowed) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const body = await req.json();
    const parsed = CampaignCreateInputSchema.safeParse({
      ...body,
      advertiserId: guard.actorUid,
    });
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const created = marketplaceStore.createCampaign({
      id: `cmp_${Date.now()}`,
      tenantId: INFLUNEX_TENANT_ID,
      ...parsed.data,
      status: "OPEN",
      proposalsCount: 0,
      createdAt: new Date().toISOString(),
    });

    appendApiMutationAuditLog({
      endpoint: "/api/v1/campaigns",
      actorUid: guard.actorUid,
      actorRole: guard.actorRole,
      action: "CREATE_CAMPAIGN",
      metadata: {
        campaignId: created.id,
        budgetMinorUnits: created.budgetMinorUnits,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
