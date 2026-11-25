import { NextResponse } from "next/server";
import { generateAiCampaignDraft } from "@/lib/ai/recommendationEngine";
import { AiCampaignDraftInputSchema } from "@/lib/validators/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = AiCampaignDraftInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "INVALID_CAMPAIGN_DRAFT_INPUT",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const draft = generateAiCampaignDraft(parsed.data);
    return NextResponse.json(draft, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI_DRAFT_ERROR";
    const status = message.includes("SSRF") ? 422 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
