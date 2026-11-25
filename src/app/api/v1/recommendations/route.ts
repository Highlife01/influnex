import { NextResponse } from "next/server";
import { recommendCreatorsFromNaturalLanguage } from "@/lib/ai/recommendationEngine";
import { AiRecommendationQuerySchema } from "@/lib/validators/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = AiRecommendationQuerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "INVALID_QUERY",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const response = recommendCreatorsFromNaturalLanguage(
      parsed.data.query,
      parsed.data.maxResults
    );
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "RECOMMENDATION_ERROR" },
      { status: 500 }
    );
  }
}
