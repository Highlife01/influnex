import { NextResponse } from "next/server";
import { INITIAL_CATEGORIES } from "@/lib/data/catalog";

export async function GET() {
  return NextResponse.json({
    tenantId: "influnex",
    total: INITIAL_CATEGORIES.length,
    items: INITIAL_CATEGORIES,
  });
}
