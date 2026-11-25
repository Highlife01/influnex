import { NextResponse } from "next/server";
import { recommendCreatorsFromNaturalLanguage } from "@/lib/ai/recommendationEngine";

/**
 * FIRMANEX PARTNER INTEGRATION ENDPOINT (Section 33)
 * - Operates independently with zero shared database coupling.
 * - Requires explicit user consent (`userConsentConfirmed === true`) before linking a Firmanex company profile or recommending creators.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.userConsentConfirmed !== true) {
      return NextResponse.json(
        {
          error:
            "FIRMANEX_USER_CONSENT_REQUIRED: Açık kullanıcı onayı olmadan Firmanex firma verileri InfluNex'e aktarılamaz.",
        },
        { status: 403 }
      );
    }

    const companySector = String(body.sector || "e-ticaret");
    const companyCity = String(body.city || "istanbul");
    const recommendations = recommendCreatorsFromNaturalLanguage(
      `${companyCity} ${companySector} influencer`,
      4
    );

    return NextResponse.json({
      status: "FIRMANEX_LINK_READY",
      isolatedTenantId: "influnex",
      firmanexCompanyId: String(body.firmanexCompanyId || ""),
      suggestedCreators: recommendations.recommendations,
    });
  } catch {
    return NextResponse.json(
      { error: "FIRMANEX_INTEGRATION_ERROR" },
      { status: 400 }
    );
  }
}
