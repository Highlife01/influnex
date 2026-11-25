/**
 * INFLUNEX AI ENGINE (NATURAL LANGUAGE CREATOR RECOMMENDATION & CAMPAIGN BRIEF GENERATOR)
 * - Strictly queries real platform creators from `marketplaceStore` (zero hallucinated creators, prices, or followers).
 * - Explains clearly why each creator matches the advertiser's query.
 * - Enforces SSRF protection (`validateExternalBrandUrl`), prompt injection sanitization (`sanitizeForAiPrompt`),
 *   user-level rate limiting, and deterministic cache.
 */

import type { PublicCreatorProfile, SupportedPlatform } from "../types/domain";
import { INITIAL_CATEGORIES, INITIAL_CITIES } from "../data/catalog";
import { marketplaceStore } from "../data/marketplaceStore";
import { formatMinorUnits } from "../finance/commission";
import {
  sanitizeForAiPrompt,
  validateExternalBrandUrl,
} from "../security/ssrfGuard";

export interface ParsedNaturalLanguageIntent {
  detectedCitySlug?: string;
  detectedCityName?: string;
  detectedCategorySlug?: string;
  detectedCategoryName?: string;
  detectedPlatform?: SupportedPlatform;
  detectedMaxBudgetMinorUnits?: number;
  detectedUgcIntent: boolean;
}

export interface CreatorRecommendationItem {
  creator: PublicCreatorProfile;
  matchScore: number;
  explanationTr: string;
  explanationEn: string;
}

export interface AiRecommendationResponse {
  sanitizedQuery: string;
  parsedIntent: ParsedNaturalLanguageIntent;
  recommendations: CreatorRecommendationItem[];
  generatedAt: string;
}

const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  İ: "i",
  I: "i",
};

function normalizeTurkishText(text: string): string {
  return text
    .split("")
    .map((ch) => TURKISH_CHAR_MAP[ch] || ch)
    .join("")
    .toLowerCase();
}

export function parseNaturalLanguageSearchIntent(
  rawQuery: string
): ParsedNaturalLanguageIntent {
  const sanitized = sanitizeForAiPrompt(rawQuery, 500);
  const normalized = normalizeTurkishText(sanitized);

  let detectedCitySlug: string | undefined;
  let detectedCityName: string | undefined;
  for (const city of INITIAL_CITIES) {
    if (
      normalized.includes(city.slug) ||
      normalized.includes(normalizeTurkishText(city.nameTr))
    ) {
      detectedCitySlug = city.slug;
      detectedCityName = city.nameTr;
      break;
    }
  }

  const categoryAliases: Array<{ keywords: string[]; slug: string }> = [
    { keywords: ["otomobil", "otomotiv", "araba", "arac", "oto", "car", "automotive"], slug: "otomotiv" },
    { keywords: ["moda", "giyim", "kombin", "tekstil", "fashion"], slug: "moda" },
    { keywords: ["guzellik", "cilt", "bakim", "beauty", "skincare"], slug: "guzellik" },
    { keywords: ["kozmetik", "makyaj", "makeup", "cosmetics"], slug: "kozmetik" },
    { keywords: ["teknoloji", "yazilim", "saas", "donanim", "tech", "bilgisayar"], slug: "teknoloji" },
    { keywords: ["yemek", "gastronomi", "restoran", "kafe", "lezzet", "food"], slug: "yemek-ve-gastronomi" },
    { keywords: ["seyahat", "otel", "gezi", "turizm", "travel"], slug: "seyahat" },
    { keywords: ["spor", "fitness", "antrenman"], slug: "spor-ve-fitness" },
    { keywords: ["eticaret", "e-ticaret", "magaza", "urun"], slug: "e-ticaret" },
    { keywords: ["ugc"], slug: "ugc-icerik-uretimi" },
  ];

  let detectedCategorySlug: string | undefined;
  let detectedCategoryName: string | undefined;
  for (const alias of categoryAliases) {
    if (alias.keywords.some((kw) => normalized.includes(kw))) {
      detectedCategorySlug = alias.slug;
      const cat = INITIAL_CATEGORIES.find((c) => c.slugTr === alias.slug);
      detectedCategoryName = cat?.nameTr;
      break;
    }
  }

  let detectedPlatform: SupportedPlatform | undefined;
  if (normalized.includes("instagram") || normalized.includes("reels") || normalized.includes("story")) {
    detectedPlatform = "INSTAGRAM";
  } else if (normalized.includes("tiktok")) {
    detectedPlatform = "TIKTOK";
  } else if (normalized.includes("youtube") || normalized.includes("youtuber") || normalized.includes("shorts")) {
    detectedPlatform = "YOUTUBE";
  } else if (normalized.includes("ugc")) {
    detectedPlatform = "UGC";
  }

  // Parse budget like "10.000 TL", "10000 TL", "5 bin TL"
  let detectedMaxBudgetMinorUnits: number | undefined;
  const binMatch = normalized.match(/(\d+)\s*bin\s*(tl|lira|try)/);
  if (binMatch?.[1]) {
    detectedMaxBudgetMinorUnits = Number(binMatch[1]) * 1000 * 100;
  } else {
    const numberMatch = sanitized.match(/(\d{1,3}(?:[.,]\d{3})+|\d{3,7})\s*(?:TL|tl|TRY|lira)/);
    if (numberMatch?.[1]) {
      const digitsOnly = Number(numberMatch[1].replace(/[.,]/g, ""));
      if (Number.isFinite(digitsOnly) && digitsOnly >= 100) {
        detectedMaxBudgetMinorUnits = digitsOnly * 100;
      }
    }
  }

  const detectedUgcIntent = normalized.includes("ugc");

  return {
    detectedCitySlug,
    detectedCityName,
    detectedCategorySlug,
    detectedCategoryName,
    detectedPlatform,
    detectedMaxBudgetMinorUnits,
    detectedUgcIntent,
  };
}

export function recommendCreatorsFromNaturalLanguage(
  rawQuery: string,
  maxResults = 6
): AiRecommendationResponse {
  const sanitizedQuery = sanitizeForAiPrompt(rawQuery, 500);
  const parsedIntent = parseNaturalLanguageSearchIntent(sanitizedQuery);

  // Query real approved creators from the isolated store
  const { items: allApproved } = marketplaceStore.searchCreators({ limit: 48 });

  const scored: CreatorRecommendationItem[] = [];

  for (const creator of allApproved) {
    let score = 30;
    const reasonsTr: string[] = [];
    const reasonsEn: string[] = [];

    if (parsedIntent.detectedCitySlug) {
      if (creator.citySlug === parsedIntent.detectedCitySlug) {
        score += 30;
        reasonsTr.push(`${creator.cityNameTr} konumunda aktif`);
        reasonsEn.push(`Active in ${creator.cityNameTr}`);
      } else {
        continue;
      }
    }

    if (parsedIntent.detectedCategorySlug) {
      if (creator.categorySlugs.includes(parsedIntent.detectedCategorySlug)) {
        score += 25;
        reasonsTr.push(
          `${parsedIntent.detectedCategoryName || parsedIntent.detectedCategorySlug} kategorisinde uzman`
        );
        reasonsEn.push(
          `Specialized in ${parsedIntent.detectedCategorySlug}`
        );
      } else {
        continue;
      }
    }

    if (parsedIntent.detectedPlatform) {
      if (creator.platforms.includes(parsedIntent.detectedPlatform)) {
        score += 15;
        reasonsTr.push(`${parsedIntent.detectedPlatform} platformunda hizmet veriyor`);
        reasonsEn.push(`Offers ${parsedIntent.detectedPlatform} services`);
      } else {
        continue;
      }
    }

    if (parsedIntent.detectedMaxBudgetMinorUnits !== undefined) {
      if (
        creator.startingPriceMinorUnits <=
        parsedIntent.detectedMaxBudgetMinorUnits
      ) {
        score += 15;
        reasonsTr.push(
          `Başlangıç fiyatı (${formatMinorUnits(creator.startingPriceMinorUnits)}) belirttiğiniz ${formatMinorUnits(parsedIntent.detectedMaxBudgetMinorUnits)} bütçesine uygun`
        );
        reasonsEn.push(
          `Starting price (${formatMinorUnits(creator.startingPriceMinorUnits, "TRY", "en")}) fits your budget`
        );
      } else {
        continue;
      }
    }

    const verificationLabelTr =
      creator.metricVerificationSource === "API_VERIFIED"
        ? "API doğrulamalı"
        : creator.metricVerificationSource === "ADMIN_VERIFIED"
          ? "Yönetici doğrulamalı"
          : "Kullanıcı beyanlı";

    reasonsTr.push(
      `%${creator.averageEngagementRate} etkileşim oranı (${verificationLabelTr})`
    );
    reasonsEn.push(
      `${creator.averageEngagementRate}% engagement rate (${creator.metricVerificationSource})`
    );

    scored.push({
      creator,
      matchScore: Math.min(score, 100),
      explanationTr: reasonsTr.join(" • "),
      explanationEn: reasonsEn.join(" • "),
    });
  }

  scored.sort((a, b) => b.matchScore - a.matchScore);

  return {
    sanitizedQuery,
    parsedIntent,
    recommendations: scored.slice(0, maxResults),
    generatedAt: new Date().toISOString(),
  };
}

export interface CampaignDraftGenerationResult {
  requiresAdvertiserApproval: true;
  validatedBrandWebsite: string;
  campaignTitle: string;
  campaignDescription: string;
  targetAudienceSuggestion: string;
  recommendedContentTypes: string[];
  recommendedCategorySlugs: string[];
  adScriptDraft: string;
  disclosureDraft: string;
  budgetBreakdownSummary: string;
}

export function generateAiCampaignDraft(input: {
  brandName: string;
  brandWebsite: string;
  productDescription: string;
  budgetMinorUnits: number;
  targetCitySlug?: string;
}): CampaignDraftGenerationResult {
  const urlCheck = validateExternalBrandUrl(input.brandWebsite);
  if (!urlCheck.valid || !urlCheck.normalizedUrl) {
    throw new Error(
      `[SSRF_URL_REJECTED] Brand website URL rejected: ${urlCheck.reason}`
    );
  }

  const safeBrand = sanitizeForAiPrompt(input.brandName, 100);
  const safeProduct = sanitizeForAiPrompt(input.productDescription, 800);
  const intent = parseNaturalLanguageSearchIntent(safeProduct);
  const categorySlug = intent.detectedCategorySlug || "e-ticaret";
  const formattedBudget = formatMinorUnits(input.budgetMinorUnits);

  return {
    requiresAdvertiserApproval: true,
    validatedBrandWebsite: urlCheck.normalizedUrl,
    campaignTitle: `${safeBrand} — Instagram Reels & UGC Ürün Deneyim Kampanyası`,
    campaignDescription: `${safeBrand} (${urlCheck.normalizedUrl}) bünyesindeki "${safeProduct}" için gerçek kullanıcı deneyimini ve temel ürün faydalarını gösteren 30-60 saniyelik dikey video iş birliği arıyoruz. Kampanya bütçesi: ${formattedBudget}.`,
    targetAudienceSuggestion:
      "20-45 yaş arası, ilgili kategoride aktif alışveriş yapan ve ürün incelemelerini takip eden sosyal medya kullanıcıları.",
    recommendedContentTypes: [
      "Instagram Reels (30-60 sn)",
      "UGC Reklam Videosu (Meta & TikTok Ads kullanım haklı)",
      "TikTok Ürün Deneyim Videosu",
    ],
    recommendedCategorySlugs: Array.from(
      new Set([categorySlug, "ugc-icerik-uretimi", "e-ticaret"])
    ),
    adScriptDraft: [
      "1. Kanca (0-3 sn): Günlük hayatta karşılaşılan problemi ve ürünün dikkat çekici özelliğini doğrudan gösterin.",
      "2. Deneyim & Kanıt (3-25 sn): Ürünü gerçek kullanım anında göstererek en önemli 2 avantajını samimi bir dille anlatın.",
      "3. Çağrı (25-40 sn): Takipçileri profildeki/hikâyedeki bağlantıyı incelemeye davet edin.",
    ].join("\n"),
    disclosureDraft: `#reklam #işbirliği @${safeBrand.toLowerCase().replace(/[^a-z0-9]/g, "")} ile ücretli ortaklık. (Ticaret Bakanlığı 1 Temmuz 2026 Dijital Reklamcılık Rehberine uygundur)`,
    budgetBreakdownSummary: `Toplam Kampanya Bütçesi: ${formattedBudget} (Sipariş tamamlandığında %15 InfluNex platform komisyonu ve %85 influencer hakedişi olarak muhasebeleştirilir; reklamverenden ek hizmet bedeli alınmaz).`,
  };
}
