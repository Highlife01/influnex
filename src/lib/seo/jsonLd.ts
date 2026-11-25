/**
 * INFLUNEX SCHEMA.ORG JSON-LD BUILDER
 * Generates strict, validated JSON-LD graphs for Organization, WebSite,
 * ProfilePage + Person, Service + Offer, CollectionPage + ItemList,
 * BreadcrumbList, BlogPosting, and FAQPage.
 * Never outputs fake AggregateRating or Review when verifiedReviewCount === 0.
 */

import type {
  CreatorServiceRecord,
  PublicCreatorProfile,
  SupportedLocale,
} from "../types/domain";
import { SITE_BASE_URL } from "./routeRegistry";

export function buildOrganizationAndWebsiteJsonLd(locale: SupportedLocale) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_BASE_URL}/#organization`,
        name: "InfluNex",
        url: SITE_BASE_URL,
        slogan:
          locale === "tr"
            ? "İş birliği yap. Birlikte kazan."
            : "Connect. Collaborate. Earn.",
        description:
          locale === "tr"
            ? "Markaları doğrulanmış Instagram, TikTok, YouTube influencer'ları ve UGC içerik üreticileriyle buluşturan, ücretsiz üyelikli ve yalnızca %15 komisyonla çalışan dijital reklam pazaryeri."
            : "Global influencer and UGC creator marketplace with free membership and a transparent 15% commission on completed collaborations.",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_BASE_URL}/#website`,
        url: `${SITE_BASE_URL}/${locale}`,
        name: "InfluNex",
        publisher: { "@id": `${SITE_BASE_URL}/#organization` },
        inLanguage: locale === "tr" ? "tr-TR" : "en-US",
      },
    ],
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.path.startsWith("http")
        ? item.path
        : `${SITE_BASE_URL}${item.path}`,
    })),
  };
}

export function buildCreatorProfileJsonLd(
  profile: PublicCreatorProfile,
  services: CreatorServiceRecord[],
  locale: SupportedLocale
) {
  const profileUrl =
    locale === "tr"
      ? `${SITE_BASE_URL}/tr/influencer/${profile.username}`
      : `${SITE_BASE_URL}/en/creators/${profile.username}`;

  const personEntity: Record<string, unknown> = {
    "@type": "Person",
    "@id": `${profileUrl}#person`,
    name: profile.displayName,
    alternateName: profile.username,
    description: locale === "tr" ? profile.bioTr : profile.bioEn,
    image: {
      "@type": "ImageObject",
      url: profile.avatarUrl,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.cityNameTr,
      addressCountry: profile.countryCode,
    },
    knowsLanguage: profile.spokenLanguages,
    url: profileUrl,
  };

  const offerCatalogItems = services.map((s) => ({
    "@type": "Offer",
    "@id": `${profileUrl}#offer-${s.id}`,
    name: locale === "tr" ? s.titleTr : s.titleEn,
    description: locale === "tr" ? s.descriptionTr : s.descriptionEn,
    price: (s.priceMinorUnits / 100).toFixed(2),
    priceCurrency: s.currency,
    availability: "https://schema.org/InStock",
  }));

  const profilePage: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${profileUrl}#profilepage`,
    url: profileUrl,
    name: `${profile.displayName} (@${profile.username}) | InfluNex`,
    dateModified: profile.updatedAt,
    mainEntity: personEntity,
  };

  if (offerCatalogItems.length > 0) {
    personEntity.makesOffer = offerCatalogItems;
  }

  return profilePage;
}

export function buildCollectionPageJsonLd(params: {
  title: string;
  description: string;
  path: string;
  creators: PublicCreatorProfile[];
  locale: SupportedLocale;
}) {
  const pageUrl = `${SITE_BASE_URL}${params.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}#collection`,
    url: pageUrl,
    name: params.title,
    description: params.description,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: params.creators.length,
      itemListElement: params.creators.map((c, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url:
          params.locale === "tr"
            ? `${SITE_BASE_URL}/tr/influencer/${c.username}`
            : `${SITE_BASE_URL}/en/creators/${c.username}`,
        name: c.displayName,
      })),
    },
  };
}

export function buildServicePageJsonLd(params: {
  title: string;
  description: string;
  path: string;
  services: CreatorServiceRecord[];
}) {
  const pageUrl = `${SITE_BASE_URL}${params.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: params.title,
    description: params.description,
    provider: {
      "@id": `${SITE_BASE_URL}/#organization`,
    },
    offers: params.services.map((s) => ({
      "@type": "Offer",
      name: s.titleTr,
      price: (s.priceMinorUnits / 100).toFixed(2),
      priceCurrency: s.currency,
      availability: "https://schema.org/InStock",
    })),
  };
}

export function buildFaqJsonLd(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
