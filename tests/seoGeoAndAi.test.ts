import { describe, expect, it } from "vitest";
import {
  generateAiCampaignDraft,
  recommendCreatorsFromNaturalLanguage,
} from "@/lib/ai/recommendationEngine";
import { marketplaceStore } from "@/lib/data/marketplaceStore";
import {
  buildCreatorProfileJsonLd,
  buildOrganizationAndWebsiteJsonLd,
} from "@/lib/seo/jsonLd";
import { evaluateIndexQualityGate } from "@/lib/seo/qualityGate";
import {
  buildCanonicalUrl,
  buildHreflangAlternates,
  resolveDiscoverySlug,
} from "@/lib/seo/routeRegistry";

describe("InfluNex SEO, Programmatic Quality Gate, Schema.org & AI Engine", () => {
  it("enforces Programmatic SEO Index Quality Gate (minimum 3 approved creators required)", () => {
    // Adana Otomotiv has 3 approved creators -> passes Quality Gate (index, follow)
    const adanaCreators = marketplaceStore.searchCreators({
      citySlug: "adana",
      categorySlug: "otomotiv",
    }).items;
    expect(adanaCreators.length).toBeGreaterThanOrEqual(3);

    const passingGate = evaluateIndexQualityGate({
      path: "/tr/influencer/adana/otomotiv",
      approvedCreatorCount: adanaCreators.length,
      activeServiceCount: adanaCreators.length,
      uniqueDescriptionText:
        "Adana'daki onaylı otomotiv influencer ve içerik üreticilerini keşfedin. Instagram Reels, TikTok ve YouTube reklam fiyatlarını karşılaştırın.",
    });
    expect(passingGate.indexable).toBe(true);
    expect(passingGate.includeInSitemap).toBe(true);
    expect(passingGate.robotsDirective).toBe("index, follow");

    // A city+category combination with only 1 creator must be noindex and excluded from sitemap
    const failingGate = evaluateIndexQualityGate({
      path: "/tr/influencer/ankara/teknoloji",
      approvedCreatorCount: 1,
      activeServiceCount: 1,
      uniqueDescriptionText:
        "Ankara'daki teknoloji influencer ve YouTuber listesi, yazılım ve donanım inceleme kanalları ile reklam iş birliği seçenekleri.",
    });
    expect(failingGate.indexable).toBe(false);
    expect(failingGate.includeInSitemap).toBe(false);
    expect(failingGate.robotsDirective).toBe("noindex, follow");
  });

  it("resolves platforms, cities, categories, creator profiles, and 301 old username redirects without collision", () => {
    expect(resolveDiscoverySlug("instagram").kind).toBe("PLATFORM");
    expect(resolveDiscoverySlug("adana").kind).toBe("CITY");
    expect(resolveDiscoverySlug("otomotiv").kind).toBe("CATEGORY");
    expect(resolveDiscoverySlug("emre-toros-oto").kind).toBe("CREATOR_PROFILE");

    // Old username triggers permanent 301 redirect
    const redirectRes = resolveDiscoverySlug("emretorosauto", "tr");
    expect(redirectRes.kind).toBe("CREATOR_REDIRECT_301");
    if (redirectRes.kind === "CREATOR_REDIRECT_301") {
      expect(redirectRes.destinationPath).toBe(
        "/tr/influencer/emre-toros-oto"
      );
    }
  });

  it("generates self-referencing canonicals, pagination canonicals, and reciprocal tr-TR/en/x-default hreflang tags", () => {
    expect(buildCanonicalUrl("/tr/influencer/adana/")).toBe(
      "https://www.influnex.com.tr/tr/influencer/adana"
    );
    // Page 2 is never canonicalized to page 1
    expect(buildCanonicalUrl("/tr/influencer/adana", 2)).toBe(
      "https://www.influnex.com.tr/tr/influencer/adana?page=2"
    );

    const alternates = buildHreflangAlternates(
      "/tr/influencer/istanbul",
      "/en/creators/istanbul",
      "tr"
    );
    expect(alternates.canonical).toBe(
      "https://www.influnex.com.tr/tr/influencer/istanbul"
    );
    expect(alternates.languages["tr-TR"]).toBe(
      "https://www.influnex.com.tr/tr/influencer/istanbul"
    );
    expect(alternates.languages.en).toBe(
      "https://www.influnex.com.tr/en/creators/istanbul"
    );
    expect(alternates.languages["x-default"]).toBe(
      "https://www.influnex.com.tr/tr/influencer/istanbul"
    );
  });

  it("builds valid Schema.org JSON-LD with consistent @id and real service offers", () => {
    const orgGraph = buildOrganizationAndWebsiteJsonLd("tr");
    expect(orgGraph["@context"]).toBe("https://schema.org");
    expect(orgGraph["@graph"]).toHaveLength(2);

    const creator = marketplaceStore.resolveCreatorByUsername("emre-toros-oto");
    expect(creator.type).toBe("FOUND");
    if (creator.type === "FOUND") {
      const services = marketplaceStore.getCreatorServices(creator.profile.id);
      const profileJsonLd = buildCreatorProfileJsonLd(
        creator.profile,
        services,
        "tr"
      );
      expect(profileJsonLd["@type"]).toBe("ProfilePage");
      expect(profileJsonLd["@id"]).toContain(
        "/tr/influencer/emre-toros-oto#profilepage"
      );
    }
  });

  it("answers natural language AI recommendations using strictly real platform creators and explains why", () => {
    const res = recommendCreatorsFromNaturalLanguage(
      "Adana'da otomobil içerikleri paylaşan, 10.000 TL bütçeme uygun Instagram influencer'ları bul."
    );

    expect(res.parsedIntent.detectedCitySlug).toBe("adana");
    expect(res.parsedIntent.detectedCategorySlug).toBe("otomotiv");
    expect(res.parsedIntent.detectedPlatform).toBe("INSTAGRAM");
    expect(res.parsedIntent.detectedMaxBudgetMinorUnits).toBe(1000000);

    expect(res.recommendations.length).toBeGreaterThanOrEqual(3);
    for (const item of res.recommendations) {
      expect(item.creator.citySlug).toBe("adana");
      expect(item.creator.categorySlugs).toContain("otomotiv");
      expect(item.creator.startingPriceMinorUnits).toBeLessThanOrEqual(1000000);
      expect(item.explanationTr).toContain("Adana");
    }
  });

  it("generates SSRF-protected AI campaign drafts requiring explicit advertiser confirmation", () => {
    const draft = generateAiCampaignDraft({
      brandName: "Toros Auto Care",
      brandWebsite: "https://torosautocare.com.tr",
      productDescription: "Nano seramik hızlı cila ve otomobil bakım seti",
      budgetMinorUnits: 1000000,
    });

    expect(draft.requiresAdvertiserApproval).toBe(true);
    expect(draft.disclosureDraft).toContain("#reklam");
    expect(draft.recommendedCategorySlugs).toContain("otomotiv");

    expect(() =>
      generateAiCampaignDraft({
        brandName: "Internal Probe",
        brandWebsite: "http://169.254.169.254/latest/meta-data",
        productDescription: "SSRF test",
        budgetMinorUnits: 100000,
      })
    ).toThrow(/SSRF_URL_REJECTED/);
  });
});
