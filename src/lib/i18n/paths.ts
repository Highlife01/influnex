import type { SupportedLocale } from "../types/domain";

const PUBLIC_PATHS = {
  tr: {
    creators: "/tr/influencer",
    campaigns: "/tr/kampanyalar",
    howItWorks: "/tr/nasil-calisir",
    ugc: "/tr/ugc",
    pricing: "/tr/influencer-reklam-fiyatlari",
    blog: "/tr/blog",
    login: "/tr/giris",
    signup: "/tr/kayit",
    dashboard: "/tr/panel",
    legal: "/tr/hukuki",
    services: "/tr/hizmetler",
  },
  en: {
    creators: "/en/creators",
    campaigns: "/en/campaigns",
    howItWorks: "/en/how-it-works",
    ugc: "/en/ugc-creators",
    pricing: "/en/influencer-reklam-fiyatlari",
    blog: "/en/blog",
    login: "/en/giris",
    signup: "/en/kayit",
    dashboard: "/en/panel",
    legal: "/en/hukuki",
    services: "/en/hizmetler",
  },
} as const satisfies Record<SupportedLocale, Record<string, string>>;

export function localizedPath(
  locale: SupportedLocale,
  key: keyof (typeof PUBLIC_PATHS)["tr"],
  suffix = "",
): string {
  return `${PUBLIC_PATHS[locale][key]}${suffix}`;
}

export function creatorProfilePath(
  locale: SupportedLocale,
  username: string,
): string {
  return `${localizedPath(locale, "creators")}/${username}`;
}

export function categoryPath(
  locale: SupportedLocale,
  slug: string,
): string {
  return `${localizedPath(locale, "creators")}/${slug}`;
}

export function servicePath(locale: SupportedLocale, slug: string): string {
  return `${localizedPath(locale, "services")}/${slug}`;
}
