import type { SupportedLocale } from "../types/domain";

export const SUPPORTED_LOCALES: SupportedLocale[] = ["tr", "en"];

export const EXPANSION_READY_LOCALES = [
  { code: "tr", label: "Türkçe", dir: "ltr", active: true },
  { code: "en", label: "English", dir: "ltr", active: true },
  { code: "de", label: "Deutsch (Hazır)", dir: "ltr", active: false },
  { code: "ar", label: "العربية (RTL Hazır)", dir: "rtl", active: false },
  { code: "fr", label: "Français (Hazır)", dir: "ltr", active: false },
  { code: "es", label: "Español (Hazır)", dir: "ltr", active: false },
] as const;

export function normalizeLocale(raw?: string): SupportedLocale {
  return raw === "en" ? "en" : "tr";
}

export const DICTIONARY = {
  tr: {
    slogan: "İş birliği yap. Birlikte kazan.",
    nav: {
      explore: "Influencer Keşfet",
      campaigns: "Kampanyalar",
      howItWorks: "Nasıl Çalışır?",
      pricing: "Reklam Fiyatları",
      blog: "Blog",
      login: "Giriş Yap",
      joinFree: "Ücretsiz Katıl",
      dashboard: "Panel",
      admin: "Yönetim",
    },
    hero: {
      title: "Markalar ve içerik üreticileri burada buluşuyor.",
      subtitle:
        "Markanız için doğru influencer'ı bulun veya içerik üreterek kazanmaya başlayın. Ücretsiz katılın, kolayca iş birliği yapın.",
      ctaFindCreator: "Influencer Bul",
      ctaJoinCreator: "Influencer Olarak Katıl",
    },
    metricSource: {
      API_VERIFIED: "API Üzerinden Doğrulanmış",
      ADMIN_VERIFIED: "Yönetici Tarafından Doğrulanmış",
      USER_DECLARED: "Kullanıcı Tarafından Beyan Edilmiş",
    },
    mobileNav: {
      explore: "Keşfet",
      campaigns: "Kampanyalar",
      messages: "Mesajlar",
      orders: "Siparişler",
      profile: "Profil",
    },
  },
  en: {
    slogan: "Connect. Collaborate. Earn.",
    nav: {
      explore: "Explore Creators",
      campaigns: "Campaigns",
      howItWorks: "How It Works",
      pricing: "Ad Pricing",
      blog: "Blog",
      login: "Sign In",
      joinFree: "Join Free",
      dashboard: "Dashboard",
      admin: "Admin",
    },
    hero: {
      title: "Where brands and content creators connect.",
      subtitle:
        "Find the right influencer for your brand or start earning by creating content. Join for free and collaborate effortlessly.",
      ctaFindCreator: "Find a Creator",
      ctaJoinCreator: "Join as Creator",
    },
    metricSource: {
      API_VERIFIED: "Verified via Official API",
      ADMIN_VERIFIED: "Verified by Admin",
      USER_DECLARED: "Self-Declared by Creator",
    },
    mobileNav: {
      explore: "Explore",
      campaigns: "Campaigns",
      messages: "Messages",
      orders: "Orders",
      profile: "Profile",
    },
  },
} as const;
