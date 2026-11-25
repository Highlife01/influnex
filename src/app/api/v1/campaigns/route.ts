import { NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/data/marketplaceStore";
import { INFLUNEX_TENANT_ID } from "@/lib/firebase/isolation";
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
  try {
    const body = await req.json();
    const parsed = CampaignCreateInputSchema.safeParse(body);
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

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
