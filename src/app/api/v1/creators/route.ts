import { NextResponse } from "next/server";
import {
  type CreatorSortOption,
  marketplaceStore,
} from "@/lib/data/marketplaceStore";
import type { SupportedPlatform } from "@/lib/types/domain";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const citySlug = searchParams.get("city") || undefined;
  const categorySlug = searchParams.get("category") || undefined;
  const platform =
    (searchParams.get("platform")?.toUpperCase() as SupportedPlatform) ||
    undefined;
  const ugcOnly = searchParams.get("ugc") === "true";
  const verifiedOnly = searchParams.get("verified") === "true";
  const minPrice = searchParams.get("minPriceMinorUnits")
    ? Number(searchParams.get("minPriceMinorUnits"))
    : undefined;
  const maxPrice = searchParams.get("maxPriceMinorUnits")
    ? Number(searchParams.get("maxPriceMinorUnits"))
    : undefined;
  const sortBy =
    (searchParams.get("sortBy") as CreatorSortOption) || "RECOMMENDED";

  const result = marketplaceStore.searchCreators({
    citySlug,
    categorySlug,
    platform,
    ugcOnly,
    verifiedOnly,
    minPriceMinorUnits: minPrice,
    maxPriceMinorUnits: maxPrice,
    sortBy,
  });

  return NextResponse.json({
    tenantId: "influnex",
    total: result.total,
    items: result.items,
  });
}
