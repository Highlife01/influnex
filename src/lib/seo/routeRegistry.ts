/**
 * INFLUNEX CENTRAL ROUTE REGISTRY, CANONICAL & HREFLANG ENGINE
 * Resolves city, category, platform, and creator username slugs without collision.
 * Strips UTM, sort, filter, and session parameters from self-referencing canonical URLs.
 * Builds reciprocal `tr-TR`, `en`, and `x-default` hreflang links only for existing pages.
 */

import type {
  CategoryRecord,
  CityRecord,
  PublicCreatorProfile,
  SupportedLocale,
  SupportedPlatform,
} from "../types/domain";
import {
  INITIAL_CATEGORIES,
  INITIAL_CITIES,
  PLATFORM_LABELS,
  SERVICE_TEMPLATES,
} from "../data/catalog";
import { marketplaceStore } from "../data/marketplaceStore";

export const SITE_BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.influnex.com.tr"
).replace(/\/+$/, "");

export function getCategoryNameBySlug(
  slug: string,
  locale: SupportedLocale = "tr"
): string {
  const clean = slug.trim().toLowerCase();
  const found = INITIAL_CATEGORIES.find(
    (c) => c.slugTr === clean || c.slugEn === clean
  );
  if (found) {
    return locale === "tr" ? found.nameTr : found.nameEn;
  }
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export type ResolvedSlugTarget =
  | { kind: "PLATFORM"; platform: SupportedPlatform; slug: string }
  | { kind: "CITY"; city: CityRecord }
  | { kind: "COUNTRY"; countryCode: "TR"; nameTr: string; nameEn: string }
  | { kind: "CATEGORY"; category: CategoryRecord }
  | { kind: "CREATOR_PROFILE"; profile: PublicCreatorProfile }
  | { kind: "CREATOR_REDIRECT_301"; destinationPath: string }
  | { kind: "NOT_FOUND" };

const RESERVED_NAMESPACE_SLUGS = new Set<string>([
  "instagram",
  "tiktok",
  "youtube",
  "ugc",
  "turkiye",
  ...INITIAL_CITIES.map((c) => c.slug),
  ...INITIAL_CATEGORIES.map((c) => c.slugTr),
  ...INITIAL_CATEGORIES.map((c) => c.slugEn),
  ...SERVICE_TEMPLATES.map((s) => s.slug),
]);

export function isReservedNamespaceSlug(slug: string): boolean {
  return RESERVED_NAMESPACE_SLUGS.has(slug.trim().toLowerCase());
}

/**
 * Resolves a single slug under `/tr/influencer/[slug]` or `/en/creators/[slug]`
 * in deterministic priority order: Platform -> Country -> City -> Category -> Creator Profile / 301 Redirect.
 */
export function resolveDiscoverySlug(
  slug: string,
  locale: SupportedLocale = "tr"
): ResolvedSlugTarget {
  const clean = slug.trim().toLowerCase();

  // 1. Check Platform
  for (const [key, val] of Object.entries(PLATFORM_LABELS)) {
    if (val.slug === clean) {
      return {
        kind: "PLATFORM",
        platform: key as SupportedPlatform,
        slug: val.slug,
      };
    }
  }

  // 2. Check Country
  if (clean === "turkiye" || clean === "turkey") {
    return {
      kind: "COUNTRY",
      countryCode: "TR",
      nameTr: "Türkiye",
      nameEn: "Türkiye",
    };
  }

  // 3. Check City
  const city = INITIAL_CITIES.find((c) => c.slug === clean);
  if (city) {
    return { kind: "CITY", city };
  }

  // 4. Check Category (TR or EN slug)
  const category = INITIAL_CATEGORIES.find(
    (c) => c.slugTr === clean || c.slugEn === clean
  );
  if (category) {
    return { kind: "CATEGORY", category };
  }

  // 5. Check Creator Profile or 301 Redirect
  const creatorResolution = marketplaceStore.resolveCreatorByUsername(clean);
  if (creatorResolution.type === "FOUND") {
    return { kind: "CREATOR_PROFILE", profile: creatorResolution.profile };
  }
  if (creatorResolution.type === "REDIRECT_301") {
    const base = locale === "tr" ? "/tr/influencer" : "/en/creators";
    return {
      kind: "CREATOR_REDIRECT_301",
      destinationPath: `${base}/${creatorResolution.destinationUsername}`,
    };
  }

  return { kind: "NOT_FOUND" };
}

/**
 * Builds a clean, self-referencing canonical URL stripping any UTM, sorting, or filter parameters.
 * Preserves explicit page number (`?page=2`) when page > 1 so paginated pages are never falsely canonicalized to page 1.
 */
export function buildCanonicalUrl(
  pathname: string,
  pageNumber?: number
): string {
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const normalizedPath =
    cleanPath.length > 1 ? cleanPath.replace(/\/+$/, "") : cleanPath;

  if (pageNumber && Number.isInteger(pageNumber) && pageNumber > 1) {
    return `${SITE_BASE_URL}${normalizedPath}?page=${pageNumber}`;
  }
  return `${SITE_BASE_URL}${normalizedPath}`;
}

export interface HreflangAlternates {
  canonical: string;
  languages: {
    "tr-TR": string;
    en: string;
    "x-default": string;
  };
}

/**
 * Builds reciprocal `tr-TR`, `en`, and `x-default` hreflang links for bilingual route pairs.
 */
export function buildHreflangAlternates(
  trPath: string,
  enPath: string,
  activeLocale: SupportedLocale,
  pageNumber?: number
): HreflangAlternates {
  const trUrl = buildCanonicalUrl(trPath, pageNumber);
  const enUrl = buildCanonicalUrl(enPath, pageNumber);
  return {
    canonical: activeLocale === "tr" ? trUrl : enUrl,
    languages: {
      "tr-TR": trUrl,
      en: enUrl,
      "x-default": trUrl,
    },
  };
}
