import { NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/data/marketplaceStore";
import { INFLUNEX_TENANT_ID } from "@/lib/firebase/isolation";
import {
  appendApiMutationAuditLog,
  verifyApiMutationRequest,
} from "@/lib/security/apiGuard";
import { ProposalCreateInputSchema } from "@/lib/validators/schemas";

export async function POST(req: Request) {
  const guard = await verifyApiMutationRequest(req, {
    endpoint: "/api/v1/proposals",
    action: "SUBMIT_PROPOSAL",
    allowedRoles: ["CREATOR", "ADMIN"],
    maxRequestsPerMinute: 20,
  });

  if (!guard.allowed) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const body = await req.json();
    const parsed = ProposalCreateInputSchema.safeParse({
      ...body,
      creatorId: guard.actorUid,
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

    const campaign = marketplaceStore.getCampaignById(parsed.data.campaignId);
    if (!campaign) {
      return NextResponse.json({ error: "CAMPAIGN_NOT_FOUND" }, { status: 404 });
    }

    const proposal = marketplaceStore.submitProposal({
      id: `prp_${Date.now()}`,
      tenantId: INFLUNEX_TENANT_ID,
      campaignId: campaign.id,
      advertiserId: campaign.advertiserId,
      creatorId: guard.actorUid,
      creatorUsername: parsed.data.creatorUsername,
      creatorDisplayName: parsed.data.creatorDisplayName,
      priceMinorUnits: parsed.data.priceMinorUnits,
      currency: "TRY",
      deliveryDays: parsed.data.deliveryDays,
      pitchMessage: parsed.data.pitchMessage,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    });

    appendApiMutationAuditLog({
      endpoint: "/api/v1/proposals",
      actorUid: guard.actorUid,
      actorRole: guard.actorRole,
      action: "SUBMIT_PROPOSAL",
      metadata: {
        proposalId: proposal.id,
        campaignId: campaign.id,
        priceMinorUnits: proposal.priceMinorUnits,
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "PROPOSAL_ERROR" },
      { status: 400 }
    );
  }
}
