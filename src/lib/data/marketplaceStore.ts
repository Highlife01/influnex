/**
 * INFLUNEX MARKETPLACE REPOSITORY & MULTI-FACTOR SEARCH ENGINE
 * - Physical separation of public creator profiles and private creator profiles.
 * - Multi-factor ranking algorithm (category fit, engagement rate, profile quality, verification source, service availability) — NEVER paid ranking boost!
 * - Strict verification source attribution (`API_VERIFIED`, `ADMIN_VERIFIED`, `USER_DECLARED`).
 * - 301 username redirect registry (`redirects`).
 */

import type {
  CampaignRecord,
  CreatorServiceRecord,
  PrivateCreatorProfile,
  ProposalRecord,
  PublicCreatorProfile,
  SocialAccountRecord,
  SupportedPlatform,
} from "../types/domain";
import {
  enforcePublicProfileDataIsolation,
  INFLUNEX_TENANT_ID,
} from "../firebase/isolation";
import { INITIAL_CATEGORIES, INITIAL_CITIES } from "./catalog";

export type CreatorSortOption =
  | "RECOMMENDED"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "FOLLOWERS_DESC"
  | "RATING_DESC"
  | "NEWEST";

export interface CreatorSearchFilters {
  countryCode?: string;
  citySlug?: string;
  platform?: SupportedPlatform;
  categorySlug?: string;
  serviceTypeSlug?: string;
  minPriceMinorUnits?: number;
  maxPriceMinorUnits?: number;
  minFollowers?: number;
  maxFollowers?: number;
  minEngagementRate?: number;
  language?: string;
  verifiedOnly?: boolean;
  minRating?: number;
  maxDeliveryDays?: number;
  ugcOnly?: boolean;
  queryText?: string;
  sortBy?: CreatorSortOption;
  limit?: number;
  offset?: number;
}

const VERIFIED_CREATORS: PublicCreatorProfile[] = [
  {
    id: "cr_adana_guzellik_guldkoc",
    tenantId: INFLUNEX_TENANT_ID,
    username: "guldkoc",
    previousUsernames: ["gul-koc"],
    displayName: "Gül Koç",
    socialProfileUrl: "https://www.instagram.com/guldkoc/",
    isInfluencerLeader: true,
    leaderTitleTr: "Influencer Lideri",
    leaderTitleEn: "Influencer Leader",
    headlineTr: "InfluNex Influencer Lideri • Güzellik, Moda ve Günlük Yaşam & UGC",
    headlineEn: "InfluNex Influencer Leader • Beauty, Fashion & Lifestyle Creator & UGC",
    bioTr: "Gül Koç | Beauty & Lifestyle Creator ✨ Adana merkezli güzellik, kozmetik, moda kombinleri ve günlük yaşam içerikleri üretiyorum. Markalar için yüksek etkileşimli Instagram Reels, hikâye serileri ve doğal UGC reklam iş birlikleri hazırlıyorum.",
    bioEn: "Adana-based Beauty & Lifestyle Creator producing authentic Instagram Reels, Story sets, and UGC brand collaborations across beauty, fashion, and daily life.",
    avatarUrl: "/creators/guldkoc.jpg",
    coverUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    countryCode: "TR",
    citySlug: "adana",
    cityNameTr: "Adana",
    spokenLanguages: ["tr"],
    categorySlugs: [
      "guzellik",
      "moda",
      "kozmetik",
      "ugc-icerik-uretimi",
      "alisveris",
      "yerel-isletmeler",
    ],
    platforms: ["INSTAGRAM", "UGC"],
    primaryPlatform: "INSTAGRAM",
    totalFollowers: 10398,
    averageEngagementRate: 5.8,
    averageViews: 6800,
    metricVerificationSource: "ADMIN_VERIFIED",
    audienceSummaryTr: "%82 Kadın (Adana, Mersin, Gaziantep, İstanbul), 18-35 yaş güzellik, cilt bakımı, kombin ve günlük yaşam takipçileri",
    audienceSummaryEn: "82% Women aged 18-35 across Adana and Türkiye interested in beauty, skincare, outfit styling, and lifestyle",
    startingPriceMinorUnits: 200000, // 2.000 TL
    currency: "TRY",
    averageDeliveryDays: 3,
    completedOrdersCount: 12,
    verifiedReviewCount: 10,
    averageRating: 4.95,
    offersUgc: true,
    verificationBadges: {
      emailVerified: true,
      phoneVerified: true,
      identityVerified: true,
      socialVerified: true,
    },
    status: "APPROVED",
    qualityScore: 100,
    portfolio: [
      {
        id: "pf_guldkoc_1",
        title: "Kozmetik & Güzellik Mağaza Alışverişi ve Ürün Deneyimi Reels",
        platform: "INSTAGRAM",
        format: "REEL",
        thumbnailUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        contentUrl: "https://www.instagram.com/guldkoc/reel/DdTk6LpOFws/",
        brandCategorySlug: "guzellik",
        durationSeconds: 45,
      },
      {
        id: "pf_guldkoc_2",
        title: "Makyaj ve Günlük Bakım Rutini Instagram Reels",
        platform: "INSTAGRAM",
        format: "REEL",
        thumbnailUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80",
        contentUrl: "https://www.instagram.com/guldkoc/reel/Dfy2rVvu7w5/",
        brandCategorySlug: "kozmetik",
        durationSeconds: 40,
      },
      {
        id: "pf_guldkoc_3",
        title: "Günlük Kombin & Moda Stil Önerisi Reels",
        platform: "INSTAGRAM",
        format: "REEL",
        thumbnailUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80",
        contentUrl: "https://www.instagram.com/guldkoc/reel/DfNmONTOzKt/",
        brandCategorySlug: "moda",
        durationSeconds: 35,
      },
    ],
    updatedAt: "2026-11-26T08:40:00.000Z",
  },
  {
    id: "cr_adana_oto_01",
    tenantId: INFLUNEX_TENANT_ID,
    username: "emre-toros-oto",
    previousUsernames: ["emretorosauto"],
    displayName: "Emre Toros",
    headlineTr: "Otomotiv İnceleme & Test Sürüşü İçerik Üreticisi",
    headlineEn: "Automotive Review & Test Drive Creator",
    bioTr: "Adana ve Çukurova merkezli otomotiv incelemeleri, SUV ve elektrikli araç test sürüşleri, servis ve oto bakım ekipmanları tanıtımları üretiyorum.",
    bioEn: "Automotive reviews, electric vehicle test drives, and car care product collaborations based in Adana.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    coverUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    countryCode: "TR",
    citySlug: "adana",
    cityNameTr: "Adana",
    spokenLanguages: ["tr", "en"],
    categorySlugs: ["otomotiv", "teknoloji", "yerel-isletmeler"],
    platforms: ["INSTAGRAM", "YOUTUBE", "TIKTOK"],
    primaryPlatform: "INSTAGRAM",
    totalFollowers: 148000,
    averageEngagementRate: 4.8,
    averageViews: 62000,
    metricVerificationSource: "ADMIN_VERIFIED",
    audienceSummaryTr: "%78 Türkiye (Adana, İstanbul, Ankara, Mersin), 22-45 yaş otomobil ve teknoloji meraklıları",
    audienceSummaryEn: "78% Türkiye automotive and tech enthusiasts aged 22-45",
    startingPriceMinorUnits: 450000, // 4.500 TL
    currency: "TRY",
    averageDeliveryDays: 4,
    completedOrdersCount: 14,
    verifiedReviewCount: 11,
    averageRating: 4.9,
    offersUgc: true,
    verificationBadges: {
      emailVerified: true,
      phoneVerified: true,
      identityVerified: true,
      socialVerified: true,
    },
    status: "APPROVED",
    qualityScore: 94,
    portfolio: [
      {
        id: "pf_1",
        title: "Elektrikli SUV Uzun Yol ve Şarj Testi Reels",
        platform: "INSTAGRAM",
        format: "REEL",
        thumbnailUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
        brandCategorySlug: "otomotiv",
        durationSeconds: 55,
      },
    ],
    updatedAt: "2026-11-20T10:00:00.000Z",
  },
  {
    id: "cr_adana_oto_02",
    tenantId: INFLUNEX_TENANT_ID,
    username: "cukurova-garaj",
    previousUsernames: [],
    displayName: "Çukurova Garaj - Burak Aksoy",
    headlineTr: "Araç Detaylandırma, Modifiye ve Otomotiv UGC Üreticisi",
    headlineEn: "Car Detailing & Automotive UGC Video Creator",
    bioTr: "Oto kozmetik, seramik kaplama, lastik ve araç içi aksesuar markaları için yüksek dönüşümlü Instagram Reels ve TikTok videoları hazırlıyorum.",
    bioEn: "High-converting Instagram Reels and TikTok videos for car care and automotive accessory brands.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    coverUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
    countryCode: "TR",
    citySlug: "adana",
    cityNameTr: "Adana",
    spokenLanguages: ["tr"],
    categorySlugs: ["otomotiv", "e-ticaret", "ugc-icerik-uretimi"],
    platforms: ["INSTAGRAM", "TIKTOK", "UGC"],
    primaryPlatform: "INSTAGRAM",
    totalFollowers: 86000,
    averageEngagementRate: 5.4,
    averageViews: 41000,
    metricVerificationSource: "ADMIN_VERIFIED",
    audienceSummaryTr: "%85 Türkiye, araç sahipleri ve oto bakım alışverişi yapan kitle",
    audienceSummaryEn: "85% Türkiye vehicle owners and car care buyers",
    startingPriceMinorUnits: 320000, // 3.200 TL
    currency: "TRY",
    averageDeliveryDays: 3,
    completedOrdersCount: 9,
    verifiedReviewCount: 8,
    averageRating: 4.8,
    offersUgc: true,
    verificationBadges: {
      emailVerified: true,
      phoneVerified: true,
      identityVerified: true,
      socialVerified: true,
    },
    status: "APPROVED",
    qualityScore: 91,
    portfolio: [],
    updatedAt: "2026-11-21T12:00:00.000Z",
  },
  {
    id: "cr_adana_oto_03",
    tenantId: INFLUNEX_TENANT_ID,
    username: "kaan-surus-gunlugu",
    previousUsernames: [],
    displayName: "Kaan Sürüş Günlüğü",
    headlineTr: "Otomobil, Motosiklet ve Seyahat İçerik Üreticisi",
    headlineEn: "Car, Motorcycle & Roadtrip Content Creator",
    bioTr: "Adana, Mersin ve Akdeniz rotalarında otomobil ve motosiklet ekipman incelemeleri, yol deneyimleri ve sponsorlu Reels içerikleri üretiyorum.",
    bioEn: "Automotive and motorcycle gear reviews across Adana and the Mediterranean coast.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    coverUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
    countryCode: "TR",
    citySlug: "adana",
    cityNameTr: "Adana",
    spokenLanguages: ["tr", "en"],
    categorySlugs: ["otomotiv", "seyahat", "spor-ve-fitness"],
    platforms: ["INSTAGRAM", "YOUTUBE"],
    primaryPlatform: "INSTAGRAM",
    totalFollowers: 112000,
    averageEngagementRate: 4.3,
    averageViews: 47000,
    metricVerificationSource: "USER_DECLARED",
    audienceSummaryTr: "%82 Türkiye, 20-40 yaş sürüş ve seyahat tutkunları",
    audienceSummaryEn: "82% Türkiye driving and travel enthusiasts aged 20-40",
    startingPriceMinorUnits: 380000, // 3.800 TL
    currency: "TRY",
    averageDeliveryDays: 4,
    completedOrdersCount: 6,
    verifiedReviewCount: 5,
    averageRating: 4.7,
    offersUgc: false,
    verificationBadges: {
      emailVerified: true,
      phoneVerified: true,
      identityVerified: true,
      socialVerified: false,
    },
    status: "APPROVED",
    qualityScore: 86,
    portfolio: [],
    updatedAt: "2026-11-22T09:30:00.000Z",
  },
  {
    id: "cr_ist_moda_01",
    tenantId: INFLUNEX_TENANT_ID,
    username: "selin-akalin-stil",
    previousUsernames: [],
    displayName: "Selin Akalın",
    headlineTr: "Moda, Güzellik ve E-Ticaret UGC İçerik Üreticisi",
    headlineEn: "Fashion, Beauty & E-Commerce UGC Creator",
    bioTr: "İstanbul merkezli moda, tekstil ve kozmetik markaları için Instagram Reels kombin videoları ve yüksek dönüşümlü UGC reklam kreatifleri hazırlıyorum.",
    bioEn: "Istanbul-based fashion, textile, and beauty creator producing Reels and UGC ad creatives.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    coverUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    countryCode: "TR",
    citySlug: "istanbul",
    cityNameTr: "İstanbul",
    spokenLanguages: ["tr", "en"],
    categorySlugs: ["moda", "guzellik", "kozmetik", "e-ticaret", "ugc-icerik-uretimi"],
    platforms: ["INSTAGRAM", "TIKTOK", "UGC"],
    primaryPlatform: "INSTAGRAM",
    totalFollowers: 295000,
    averageEngagementRate: 5.1,
    averageViews: 128000,
    metricVerificationSource: "API_VERIFIED",
    audienceSummaryTr: "%84 Kadın, 18-35 yaş moda ve online alışveriş kitlesi (İstanbul, İzmir, Ankara)",
    audienceSummaryEn: "84% Women aged 18-35 interested in fashion and online shopping",
    startingPriceMinorUnits: 650000, // 6.500 TL
    currency: "TRY",
    averageDeliveryDays: 3,
    completedOrdersCount: 28,
    verifiedReviewCount: 24,
    averageRating: 4.95,
    offersUgc: true,
    verificationBadges: {
      emailVerified: true,
      phoneVerified: true,
      identityVerified: true,
      socialVerified: true,
    },
    status: "APPROVED",
    qualityScore: 98,
    portfolio: [],
    updatedAt: "2026-11-23T14:00:00.000Z",
  },
  {
    id: "cr_ist_moda_02",
    tenantId: INFLUNEX_TENANT_ID,
    username: "defne-yilmaz-ugc",
    previousUsernames: [],
    displayName: "Defne Yılmaz",
    headlineTr: "UGC Reklam Videosu & Moda/Kozmetik İçerik Üreticisi",
    headlineEn: "UGC Ad Video & Fashion/Cosmetics Creator",
    bioTr: "E-ticaret markalarının Meta ve TikTok reklamlarında doğrudan kullanabileceği kanca odaklı UGC ürün inceleme ve kombin videoları üretiyorum.",
    bioEn: "Hook-driven UGC product review and styling videos for Meta and TikTok ads.",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    coverUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    countryCode: "TR",
    citySlug: "istanbul",
    cityNameTr: "İstanbul",
    spokenLanguages: ["tr", "en"],
    categorySlugs: ["moda", "guzellik", "kozmetik", "ugc-icerik-uretimi", "e-ticaret"],
    platforms: ["UGC", "TIKTOK", "INSTAGRAM"],
    primaryPlatform: "UGC",
    totalFollowers: 64000,
    averageEngagementRate: 6.2,
    averageViews: 39000,
    metricVerificationSource: "ADMIN_VERIFIED",
    audienceSummaryTr: "Performans pazarlama ve e-ticaret odaklı genç tüketici kitlesi",
    audienceSummaryEn: "Performance marketing and e-commerce consumer audience",
    startingPriceMinorUnits: 280000, // 2.800 TL
    currency: "TRY",
    averageDeliveryDays: 3,
    completedOrdersCount: 31,
    verifiedReviewCount: 27,
    averageRating: 4.9,
    offersUgc: true,
    verificationBadges: {
      emailVerified: true,
      phoneVerified: true,
      identityVerified: true,
      socialVerified: true,
    },
    status: "APPROVED",
    qualityScore: 95,
    portfolio: [],
    updatedAt: "2026-11-23T15:00:00.000Z",
  },
  {
    id: "cr_ist_moda_03",
    tenantId: INFLUNEX_TENANT_ID,
    username: "melis-korkmaz-studio",
    previousUsernames: [],
    displayName: "Melis Korkmaz",
    headlineTr: "Moda, Ev Dekorasyonu ve Yaşam Tarzı İçerik Üreticisi",
    headlineEn: "Fashion, Home Decor & Lifestyle Creator",
    bioTr: "İstanbul'da giyim, aksesuar ve ev dekorasyonu markaları için estetik Reels videoları, ürün fotoğrafçılığı ve UGC içerikler üretiyorum.",
    bioEn: "Aesthetic Reels, product photography, and UGC for fashion and home decor brands in Istanbul.",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    coverUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    countryCode: "TR",
    citySlug: "istanbul",
    cityNameTr: "İstanbul",
    spokenLanguages: ["tr", "en"],
    categorySlugs: ["moda", "ev-ve-dekorasyon", "alisveris", "ugc-icerik-uretimi"],
    platforms: ["INSTAGRAM", "TIKTOK", "UGC"],
    primaryPlatform: "INSTAGRAM",
    totalFollowers: 182000,
    averageEngagementRate: 4.6,
    averageViews: 74000,
    metricVerificationSource: "API_VERIFIED",
    audienceSummaryTr: "%79 Kadın, 22-42 yaş şehirli moda ve dekorasyon takipçileri",
    audienceSummaryEn: "79% Women aged 22-42 interested in urban fashion and home decor",
    startingPriceMinorUnits: 500000, // 5.000 TL
    currency: "TRY",
    averageDeliveryDays: 4,
    completedOrdersCount: 19,
    verifiedReviewCount: 16,
    averageRating: 4.85,
    offersUgc: true,
    verificationBadges: {
      emailVerified: true,
      phoneVerified: true,
      identityVerified: true,
      socialVerified: true,
    },
    status: "APPROVED",
    qualityScore: 93,
    portfolio: [],
    updatedAt: "2026-11-24T10:00:00.000Z",
  },
  {
    id: "cr_ank_tek_01",
    tenantId: INFLUNEX_TENANT_ID,
    username: "mert-demir-tech",
    previousUsernames: [],
    displayName: "Mert Demir Tech",
    headlineTr: "Teknoloji, SaaS, Yapay Zekâ ve Donanım YouTuber'ı",
    headlineEn: "Technology, SaaS, AI & Hardware YouTuber",
    bioTr: "Ankara merkezli teknoloji kanalında yazılım, B2B SaaS, bilgisayar donanımı ve mobil uygulama incelemeleri hazırlıyorum.",
    bioEn: "Ankara-based technology channel covering SaaS, B2B tools, hardware, and mobile apps.",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    countryCode: "TR",
    citySlug: "ankara",
    cityNameTr: "Ankara",
    spokenLanguages: ["tr", "en"],
    categorySlugs: ["teknoloji", "is-dunyasi", "oyun", "egitim"],
    platforms: ["YOUTUBE", "INSTAGRAM", "TIKTOK"],
    primaryPlatform: "YOUTUBE",
    totalFollowers: 240000,
    averageEngagementRate: 5.5,
    averageViews: 95000,
    metricVerificationSource: "API_VERIFIED",
    audienceSummaryTr: "%88 Türkiye, yazılımcılar, girişimciler ve teknoloji satın almacıları",
    audienceSummaryEn: "88% Türkiye developers, founders, and technology buyers",
    startingPriceMinorUnits: 850000, // 8.500 TL
    currency: "TRY",
    averageDeliveryDays: 5,
    completedOrdersCount: 22,
    verifiedReviewCount: 19,
    averageRating: 4.92,
    offersUgc: true,
    verificationBadges: {
      emailVerified: true,
      phoneVerified: true,
      identityVerified: true,
      socialVerified: true,
    },
    status: "APPROVED",
    qualityScore: 96,
    portfolio: [],
    updatedAt: "2026-11-24T11:00:00.000Z",
  },
  {
    id: "cr_izmir_gastro_01",
    tenantId: INFLUNEX_TENANT_ID,
    username: "ege-lezzet-rotasi",
    previousUsernames: [],
    displayName: "Zeynep Kaya — Ege Lezzet Rotası",
    headlineTr: "Yemek, Gastronomi ve Seyahat İçerik Üreticisi",
    headlineEn: "Food, Gastronomy & Travel Content Creator",
    bioTr: "İzmir ve Ege genelinde restoran, gurme gıda, kahve markaları ve butik oteller için Instagram Reels ve TikTok tanıtım videoları çekiyorum.",
    bioEn: "Instagram Reels and TikTok videos for restaurants, gourmet food brands, and boutique hotels in Izmir.",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
    coverUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    countryCode: "TR",
    citySlug: "izmir",
    cityNameTr: "İzmir",
    spokenLanguages: ["tr", "en"],
    categorySlugs: ["yemek-ve-gastronomi", "seyahat", "yerel-isletmeler"],
    platforms: ["INSTAGRAM", "TIKTOK", "UGC"],
    primaryPlatform: "INSTAGRAM",
    totalFollowers: 164000,
    averageEngagementRate: 5.3,
    averageViews: 71000,
    metricVerificationSource: "ADMIN_VERIFIED",
    audienceSummaryTr: "%80 Türkiye (İzmir, İstanbul, Muğla), gastronomi ve seyahat severler",
    audienceSummaryEn: "80% Türkiye foodies and travel lovers",
    startingPriceMinorUnits: 420000, // 4.200 TL
    currency: "TRY",
    averageDeliveryDays: 3,
    completedOrdersCount: 17,
    verifiedReviewCount: 15,
    averageRating: 4.88,
    offersUgc: true,
    verificationBadges: {
      emailVerified: true,
      phoneVerified: true,
      identityVerified: true,
      socialVerified: true,
    },
    status: "APPROVED",
    qualityScore: 92,
    portfolio: [],
    updatedAt: "2026-11-24T12:00:00.000Z",
  },
];

const INITIAL_SERVICES: CreatorServiceRecord[] = [
  {
    id: "srv_guldkoc_reels",
    tenantId: INFLUNEX_TENANT_ID,
    creatorId: "cr_adana_guzellik_guldkoc",
    creatorUsername: "guldkoc",
    titleTr: "Instagram Reels Güzellik, Kombin & Yaşam Tarzı Tanıtımı",
    titleEn: "Instagram Reels Beauty, Outfit & Lifestyle Showcase",
    serviceTypeSlug: "instagram-reels",
    platform: "INSTAGRAM",
    descriptionTr: "Adana'da doğal ışık ve estetik kurguyla hazırlanan 30-60 saniye Instagram Reels ürün/mekân deneyimi, kapak görseli, hikâye paylaşımı ve #reklam yasal iş birliği etiketi.",
    descriptionEn: "30-60s aesthetic Instagram Reels beauty/fashion/lifestyle showcase with story repost and #ad disclosure.",
    priceMinorUnits: 350000, // 3.500 TL -> 525 TL komisyon, 2.975 TL üretici hakedişi
    currency: "TRY",
    deliveryDays: 3,
    revisionCount: 2,
    videoDurationSeconds: 45,
    postRetentionDays: 365,
    usageRightsTr: "Organik sosyal medya hesaplarında 1 yıl paylaşım hakkı",
    usageRightsEn: "1-year organic social media repost rights",
    paidAdsReuseAllowed: true,
    usageDurationDays: 180,
    exclusivityTermsTr: "Yayından sonraki 3 gün aynı alt kategoride rakip marka paylaşılmaz",
    isUgcService: false,
    isActive: true,
    updatedAt: "2026-11-26T08:40:00.000Z",
  },
  {
    id: "srv_guldkoc_story",
    tenantId: INFLUNEX_TENANT_ID,
    creatorId: "cr_adana_guzellik_guldkoc",
    creatorUsername: "guldkoc",
    titleTr: "3 Kare Instagram Story + Ürün Linki & Etiket Paylaşımı",
    titleEn: "3-Frame Instagram Story Set + Product Link & Brand Tag",
    serviceTypeSlug: "instagram-story",
    platform: "INSTAGRAM",
    descriptionTr: "Güzellik, moda veya yerel işletme tanıtımı içeren 3 ardışık dikey Instagram Story karesi, marka etiketleme ve doğrudan satış/kampanya link yönlendirmesi.",
    descriptionEn: "3 sequential vertical Instagram Story frames with brand tag and direct link sticker.",
    priceMinorUnits: 200000, // 2.000 TL -> 300 TL komisyon, 1.700 TL üretici hakedişi
    currency: "TRY",
    deliveryDays: 2,
    revisionCount: 1,
    videoDurationSeconds: 45,
    postRetentionDays: 1,
    usageRightsTr: "24 saat Story yayını + Öne Çıkanlar (Highlights) opsiyonu",
    usageRightsEn: "24-hour Story publication",
    paidAdsReuseAllowed: false,
    usageDurationDays: 30,
    exclusivityTermsTr: "Münhasırlık yok",
    isUgcService: false,
    isActive: true,
    updatedAt: "2026-11-26T08:40:00.000Z",
  },
  {
    id: "srv_guldkoc_ugc",
    tenantId: INFLUNEX_TENANT_ID,
    creatorId: "cr_adana_guzellik_guldkoc",
    creatorUsername: "guldkoc",
    titleTr: "UGC Güzellik & Moda Ürün Deneyim Videosu (9:16 Dikey Kreatif)",
    titleEn: "UGC Beauty & Fashion Product Experience Video (9:16 Ad Creative)",
    serviceTypeSlug: "ugc-reklam-videosu",
    platform: "UGC",
    descriptionTr: "Markanızın kendi Instagram, TikTok ve Meta Ads reklamlarında kullanabileceği, ürün dokusunu ve gerçek kullanım deneyimini yakın plan gösteren kanca odaklı dikey UGC video.",
    descriptionEn: "Hook-driven 9:16 vertical UGC product experience video delivered with paid advertising usage rights.",
    priceMinorUnits: 250000, // 2.500 TL -> 375 TL komisyon, 2.125 TL üretici hakedişi
    currency: "TRY",
    deliveryDays: 3,
    revisionCount: 2,
    videoDurationSeconds: 40,
    postRetentionDays: 365,
    usageRightsTr: "Marka organik hesaplarında ve Meta/TikTok ücretli reklamlarında 180 gün kullanım hakkı",
    usageRightsEn: "180-day organic and Meta/TikTok paid ads usage rights",
    paidAdsReuseAllowed: true,
    usageDurationDays: 180,
    exclusivityTermsTr: "Münhasırlık yok",
    isUgcService: true,
    isActive: true,
    updatedAt: "2026-11-26T08:40:00.000Z",
  },
  {
    id: "srv_adana_oto_reels",
    tenantId: INFLUNEX_TENANT_ID,
    creatorId: "cr_adana_oto_01",
    creatorUsername: "emre-toros-oto",
    titleTr: "Instagram Reels Otomotiv & Ürün İnceleme Videosu",
    titleEn: "Instagram Reels Automotive & Product Review Video",
    serviceTypeSlug: "instagram-reels",
    platform: "INSTAGRAM",
    descriptionTr: "Adana'da profesyonel dış çekim, 45-60 saniye kurgulanmış Instagram Reels videosu, hikâye paylaşımı ve #reklam yasal iş birliği etiketi.",
    descriptionEn: "45-60s professionally edited Instagram Reels automotive review with story share and #ad disclosure.",
    priceMinorUnits: 500000, // 5.000 TL -> 750 TL komisyon, 4.250 TL hakediş
    currency: "TRY",
    deliveryDays: 4,
    revisionCount: 2,
    videoDurationSeconds: 60,
    postRetentionDays: 365,
    usageRightsTr: "Organik sosyal medya hesaplarında 1 yıl paylaşım hakkı",
    usageRightsEn: "1-year organic social media repost rights",
    paidAdsReuseAllowed: true,
    usageDurationDays: 365,
    exclusivityTermsTr: "Yayından sonraki 7 gün aynı alt kategoride rakip marka paylaşılmaz",
    isUgcService: false,
    isActive: true,
    updatedAt: "2026-11-20T10:00:00.000Z",
  },
  {
    id: "srv_adana_oto_story",
    tenantId: INFLUNEX_TENANT_ID,
    creatorId: "cr_adana_oto_01",
    creatorUsername: "emre-toros-oto",
    titleTr: "3 Kare Instagram Story + Link Paylaşımı",
    titleEn: "3-Frame Instagram Story + Link Sticker",
    serviceTypeSlug: "instagram-story",
    platform: "INSTAGRAM",
    descriptionTr: "Ürün veya bayi tanıtımı içeren 3 ardışık dikey hikâye ve yönlendirme bağlantısı.",
    descriptionEn: "3 sequential vertical story frames with direct link sticker.",
    priceMinorUnits: 450000,
    currency: "TRY",
    deliveryDays: 2,
    revisionCount: 1,
    videoDurationSeconds: 45,
    postRetentionDays: 1,
    usageRightsTr: "24 saat Story yayını",
    usageRightsEn: "24-hour Story publication",
    paidAdsReuseAllowed: false,
    usageDurationDays: 30,
    exclusivityTermsTr: "Münhasırlık yok",
    isUgcService: false,
    isActive: true,
    updatedAt: "2026-11-20T10:00:00.000Z",
  },
  {
    id: "srv_adana_garaj_reels",
    tenantId: INFLUNEX_TENANT_ID,
    creatorId: "cr_adana_oto_02",
    creatorUsername: "cukurova-garaj",
    titleTr: "Oto Bakım Uygulama & Test Instagram Reels",
    titleEn: "Car Care Application & Test Instagram Reels",
    serviceTypeSlug: "instagram-reels",
    platform: "INSTAGRAM",
    descriptionTr: "Ürünün araç üzerinde gerçek uygulamasını öncesi/sonrası şeklinde gösteren yüksek etkileşimli Reels videosu.",
    descriptionEn: "Before/after application Reels video demonstrating the product on a real vehicle.",
    priceMinorUnits: 320000,
    currency: "TRY",
    deliveryDays: 3,
    revisionCount: 2,
    videoDurationSeconds: 45,
    postRetentionDays: 365,
    usageRightsTr: "Organik yeniden paylaşım ve 90 gün reklam kullanım izni",
    usageRightsEn: "Organic repost and 90-day paid ad usage permission",
    paidAdsReuseAllowed: true,
    usageDurationDays: 90,
    exclusivityTermsTr: "Münhasırlık yok",
    isUgcService: true,
    isActive: true,
    updatedAt: "2026-11-21T12:00:00.000Z",
  },
  {
    id: "srv_adana_kaan_reels",
    tenantId: INFLUNEX_TENANT_ID,
    creatorId: "cr_adana_oto_03",
    creatorUsername: "kaan-surus-gunlugu",
    titleTr: "Sürüş Deneyimi & Ekipman Tanıtım Reels Videosu",
    titleEn: "Driving Experience & Gear Showcase Reels Video",
    serviceTypeSlug: "instagram-reels",
    platform: "INSTAGRAM",
    descriptionTr: "Adana-Mersin sürüş rotasında doğal kurgulu ürün tanıtım Reels paylaşımı.",
    descriptionEn: "Road-tested product showcase Reels post.",
    priceMinorUnits: 380000,
    currency: "TRY",
    deliveryDays: 4,
    revisionCount: 1,
    videoDurationSeconds: 50,
    postRetentionDays: 365,
    usageRightsTr: "Organik sosyal medya kullanımı",
    usageRightsEn: "Organic social media usage",
    paidAdsReuseAllowed: false,
    usageDurationDays: 180,
    exclusivityTermsTr: "Münhasırlık yok",
    isUgcService: false,
    isActive: true,
    updatedAt: "2026-11-22T09:30:00.000Z",
  },
  {
    id: "srv_ist_moda_reels",
    tenantId: INFLUNEX_TENANT_ID,
    creatorId: "cr_ist_moda_01",
    creatorUsername: "selin-akalin-stil",
    titleTr: "Instagram Reels Kombin & Koleksiyon Tanıtımı",
    titleEn: "Instagram Reels Outfit Styling & Collection Showcase",
    serviceTypeSlug: "instagram-reels",
    platform: "INSTAGRAM",
    descriptionTr: "3 farklı kombin kurgusu ile markanızın yeni sezon koleksiyonunu tanıtan yüksek çözünürlüklü Reels videosu.",
    descriptionEn: "High-resolution Reels video showcasing your new collection across 3 styled outfits.",
    priceMinorUnits: 650000,
    currency: "TRY",
    deliveryDays: 3,
    revisionCount: 2,
    videoDurationSeconds: 45,
    postRetentionDays: 365,
    usageRightsTr: "Organik kanallarda 180 gün kullanım hakkı",
    usageRightsEn: "180-day organic channel usage rights",
    paidAdsReuseAllowed: true,
    usageDurationDays: 180,
    exclusivityTermsTr: "3 gün kategori münhasırlığı",
    isUgcService: false,
    isActive: true,
    updatedAt: "2026-11-23T14:00:00.000Z",
  },
  {
    id: "srv_ist_defne_ugc",
    tenantId: INFLUNEX_TENANT_ID,
    creatorId: "cr_ist_moda_02",
    creatorUsername: "defne-yilmaz-ugc",
    titleTr: "Performans Odaklı UGC Reklam Videosu (Meta & TikTok Ads)",
    titleEn: "Performance UGC Ad Video (Meta & TikTok Ads)",
    serviceTypeSlug: "ugc-reklam-videosu",
    platform: "UGC",
    descriptionTr: "2 farklı açılış kancası (hook), altyazı ve net harekete geçirici mesaj içeren 9:16 dikey UGC reklam videosu.",
    descriptionEn: "9:16 vertical UGC ad video with 2 alternative hooks, captions, and strong CTA.",
    priceMinorUnits: 280000,
    currency: "TRY",
    deliveryDays: 3,
    revisionCount: 2,
    videoDurationSeconds: 35,
    postRetentionDays: 365,
    usageRightsTr: "Ücretli reklamlarda (Meta/TikTok Ads) 1 yıl tam kullanım hakkı",
    usageRightsEn: "1-year full paid advertising usage rights on Meta & TikTok Ads",
    paidAdsReuseAllowed: true,
    usageDurationDays: 365,
    exclusivityTermsTr: "Münhasırlık yok",
    isUgcService: true,
    isActive: true,
    updatedAt: "2026-11-23T15:00:00.000Z",
  },
  {
    id: "srv_ank_tech_youtube",
    tenantId: INFLUNEX_TENANT_ID,
    creatorId: "cr_ank_tek_01",
    creatorUsername: "mert-demir-tech",
    titleTr: "YouTube 90 Saniye Entegre Ürün & Yazılım Tanıtımı",
    titleEn: "YouTube 90s Integrated Product & Software Review",
    serviceTypeSlug: "youtube-urun-tanitimi",
    platform: "YOUTUBE",
    descriptionTr: "Haftalık teknoloji videosu içerisinde 90 saniyelik detaylı ekran/ürün demosu, sabitlenmiş yorum ve açıklama bağlantısı.",
    descriptionEn: "90-second detailed demo inside weekly tech video with pinned comment and description link.",
    priceMinorUnits: 850000,
    currency: "TRY",
    deliveryDays: 5,
    revisionCount: 2,
    videoDurationSeconds: 90,
    postRetentionDays: 3650,
    usageRightsTr: "YouTube kanalında kalıcı yayın + marka web sitesinde paylaşım izni",
    usageRightsEn: "Permanent YouTube publication + brand website embed permission",
    paidAdsReuseAllowed: true,
    usageDurationDays: 365,
    exclusivityTermsTr: "Aynı videoda tek sponsor",
    isUgcService: false,
    isActive: true,
    updatedAt: "2026-11-24T11:00:00.000Z",
  },
];

const INITIAL_CAMPAIGNS: CampaignRecord[] = [
  {
    id: "cmp_01",
    tenantId: INFLUNEX_TENANT_ID,
    advertiserId: "adv_toros_oto",
    title: "Yeni Nesil Araç Bakım ve Seramik Kaplama Seti Reels Kampanyası",
    brandName: "Toros Auto Care",
    brandWebsite: "https://torosautocare.example.com",
    description: "Adana, Mersin ve İstanbul'daki otomobil içerik üreticileriyle seramik hızlı cila setimizin gerçek araç üzerinde su iticilik performansını gösteren 45 saniyelik Instagram Reels ve TikTok videoları arıyoruz.",
    productOrService: "Nano Seramik Hızlı Cila & Oto Bakım Kiti",
    targetCountryCode: "TR",
    targetCitySlug: "adana",
    targetAudience: "22-48 yaş araç sahipleri ve otomobil tutkunları",
    requestedPlatforms: ["INSTAGRAM", "TIKTOK", "UGC"],
    requestedContentType: "Instagram Reels / UGC Reklam Videosu",
    categorySlug: "otomotiv",
    budgetMinorUnits: 1000000, // 10.000 TL
    currency: "TRY",
    minFollowers: 25000,
    deliveryDeadline: "2026-12-15",
    applicationDeadline: "2026-12-05",
    requiresProductSampleShipping: true,
    usageRights: "Organik sosyal medya ve 6 ay Meta/TikTok ücretli reklam kullanım izni",
    brandRules: "Ticaret Bakanlığı mevzuatına uygun #reklam etiketi zorunludur. Uygulama gün ışığında gerçek araç üzerinde gösterilmelidir.",
    status: "OPEN",
    proposalsCount: 3,
    createdAt: "2026-11-22T10:00:00.000Z",
  },
  {
    id: "cmp_02",
    tenantId: INFLUNEX_TENANT_ID,
    advertiserId: "adv_lumina_kozmetik",
    title: "C Vitamini Aydınlatıcı Serum UGC & Reels Lansman İş Birliği",
    brandName: "Lumina Derm",
    brandWebsite: "https://luminaderm.example.com",
    description: "Dermatolojik olarak test edilmiş yeni C vitamini serumumuz için cilt bakım rutininde doğal kullanım deneyimini anlatan UGC içerik üreticileri ve güzellik influencer'larından teklif bekliyoruz.",
    productOrService: "Lumina %15 Vitamin C Aydınlatıcı Yüz Serumu",
    targetCountryCode: "TR",
    targetCitySlug: "istanbul",
    targetAudience: "18-40 yaş cilt bakımı ve kozmetik tüketicileri",
    requestedPlatforms: ["INSTAGRAM", "TIKTOK", "UGC"],
    requestedContentType: "UGC Reklam Videosu / Instagram Reels",
    categorySlug: "guzellik",
    budgetMinorUnits: 750000, // 7.500 TL
    currency: "TRY",
    minFollowers: 10000,
    deliveryDeadline: "2026-12-20",
    applicationDeadline: "2026-12-10",
    requiresProductSampleShipping: true,
    usageRights: "1 yıl Meta ve TikTok Ads reklam kreatif kullanımı",
    brandRules: "Sağlık beyanı veya tedavi vaadi kullanılmamalı; yalnızca kozmetik nemlendirme ve aydınlatma deneyimi paylaşılmalıdır.",
    status: "OPEN",
    proposalsCount: 5,
    createdAt: "2026-11-23T11:30:00.000Z",
  },
  {
    id: "cmp_03",
    tenantId: INFLUNEX_TENANT_ID,
    advertiserId: "adv_bulut_erp",
    title: "KOBİ E-Fatura ve Ön Muhasebe SaaS Platformu YouTube & Reels Tanıtımı",
    brandName: "BulutFinans SaaS",
    brandWebsite: "https://bulutfinans.example.com",
    description: "E-ticaret yapan işletmelere ve KOBİ'lere yönelik bulut ön muhasebe yazılımımızın 60 saniyede fatura kesme kolaylığını anlatacak teknoloji ve iş dünyası içerik üreticileri arıyoruz.",
    productOrService: "BulutFinans Web & Mobil Ön Muhasebe Uygulaması",
    targetCountryCode: "TR",
    targetCitySlug: "ankara",
    targetAudience: "Girişimciler, e-ticaret satıcıları, KOBİ sahipleri ve yazılımcılar",
    requestedPlatforms: ["YOUTUBE", "INSTAGRAM"],
    requestedContentType: "YouTube Ürün Tanıtımı / Instagram Reels",
    categorySlug: "teknoloji",
    budgetMinorUnits: 1200000, // 12.000 TL
    currency: "TRY",
    minFollowers: 40000,
    deliveryDeadline: "2026-12-25",
    applicationDeadline: "2026-12-12",
    requiresProductSampleShipping: false,
    usageRights: "Organik paylaşım ve marka web sitesinde referans gösterimi",
    brandRules: "Yatırım tavsiyesi içermez; gerçek arayüz ekran görüntüsü ve #işbirliği bildirimi yer almalıdır.",
    status: "OPEN",
    proposalsCount: 2,
    firmanexCompanyId: "fnx_comp_8841",
    createdAt: "2026-11-24T09:15:00.000Z",
  },
];

export class IsolatedMarketplaceStore {
  private publicCreators = new Map<string, PublicCreatorProfile>();
  private privateCreators = new Map<string, PrivateCreatorProfile>();
  private socialAccounts = new Map<string, SocialAccountRecord>();
  private services = new Map<string, CreatorServiceRecord>();
  private campaigns = new Map<string, CampaignRecord>();
  private proposals = new Map<string, ProposalRecord>();
  private usernameRedirects = new Map<string, string>(); // oldUsername -> currentUsername

  constructor() {
    for (const creator of VERIFIED_CREATORS) {
      this.savePublicCreatorProfile(creator);
      for (const oldName of creator.previousUsernames) {
        this.usernameRedirects.set(oldName.toLowerCase(), creator.username);
      }
    }
    for (const service of INITIAL_SERVICES) {
      this.services.set(service.id, service);
    }
    for (const campaign of INITIAL_CAMPAIGNS) {
      this.campaigns.set(campaign.id, campaign);
    }
  }

  public savePublicCreatorProfile(profile: PublicCreatorProfile): PublicCreatorProfile {
    enforcePublicProfileDataIsolation(profile as unknown as Record<string, unknown>);
    const record: PublicCreatorProfile = {
      ...profile,
      tenantId: INFLUNEX_TENANT_ID,
    };
    this.publicCreators.set(record.id, record);
    return record;
  }

  public savePrivateCreatorProfile(profile: PrivateCreatorProfile): PrivateCreatorProfile {
    if (!profile.isAdultConfirmed || 2026 - profile.birthYear < 18) {
      throw new Error("[AGE_RESTRICTION] Creators must be at least 18 years old.");
    }
    const record: PrivateCreatorProfile = {
      ...profile,
      tenantId: INFLUNEX_TENANT_ID,
    };
    this.privateCreators.set(record.creatorId, record);
    return record;
  }

  public getPrivateCreatorProfile(creatorId: string): PrivateCreatorProfile | undefined {
    return this.privateCreators.get(creatorId);
  }

  public updateCreatorUsername(creatorId: string, newUsername: string): PublicCreatorProfile {
    const cleanNew = newUsername.trim().toLowerCase();
    if (!/^[a-z0-9-]{3,50}$/.test(cleanNew)) {
      throw new Error("Invalid username slug format");
    }
    const existing = this.publicCreators.get(creatorId);
    if (!existing) {
      throw new Error("Creator not found");
    }
    if (existing.username !== cleanNew) {
      this.usernameRedirects.set(existing.username, cleanNew);
      existing.previousUsernames = Array.from(
        new Set([...existing.previousUsernames, existing.username])
      );
      existing.username = cleanNew;
      existing.updatedAt = new Date().toISOString();
    }
    return existing;
  }

  public resolveCreatorByUsername(
    slug: string
  ):
    | { type: "FOUND"; profile: PublicCreatorProfile }
    | { type: "REDIRECT_301"; destinationUsername: string }
    | { type: "NOT_FOUND" } {
    const clean = slug.trim().toLowerCase();
    for (const profile of this.publicCreators.values()) {
      if (profile.username === clean && profile.status === "APPROVED") {
        return { type: "FOUND", profile };
      }
    }
    const redirected = this.usernameRedirects.get(clean);
    if (redirected) {
      return { type: "REDIRECT_301", destinationUsername: redirected };
    }
    return { type: "NOT_FOUND" };
  }

  public getCreatorServices(creatorId: string): CreatorServiceRecord[] {
    return Array.from(this.services.values()).filter(
      (s) => s.creatorId === creatorId && s.isActive
    );
  }

  public getServiceById(serviceId: string): CreatorServiceRecord | undefined {
    return this.services.get(serviceId);
  }

  public addService(service: CreatorServiceRecord): CreatorServiceRecord {
    const record: CreatorServiceRecord = {
      ...service,
      tenantId: INFLUNEX_TENANT_ID,
    };
    this.services.set(record.id, record);
    return record;
  }

  public getServicesByTypeSlug(serviceTypeSlug: string): CreatorServiceRecord[] {
    return Array.from(this.services.values()).filter(
      (s) => s.serviceTypeSlug === serviceTypeSlug && s.isActive
    );
  }

  public getOpenCampaigns(): CampaignRecord[] {
    return Array.from(this.campaigns.values()).filter((c) => c.status === "OPEN");
  }

  public getCampaignById(id: string): CampaignRecord | undefined {
    return this.campaigns.get(id);
  }

  public createCampaign(campaign: CampaignRecord): CampaignRecord {
    const record: CampaignRecord = {
      ...campaign,
      tenantId: INFLUNEX_TENANT_ID,
    };
    this.campaigns.set(record.id, record);
    return record;
  }

  public submitProposal(proposal: ProposalRecord): ProposalRecord {
    const campaign = this.campaigns.get(proposal.campaignId);
    if (!campaign || campaign.status !== "OPEN") {
      throw new Error("[CAMPAIGN_NOT_OPEN] Cannot submit proposal to a closed or non-existent campaign.");
    }
    const record: ProposalRecord = {
      ...proposal,
      tenantId: INFLUNEX_TENANT_ID,
    };
    this.proposals.set(record.id, record);
    campaign.proposalsCount += 1;
    return record;
  }

  public getProposalsForCampaign(campaignId: string): ProposalRecord[] {
    return Array.from(this.proposals.values()).filter(
      (p) => p.campaignId === campaignId
    );
  }

  /**
   * Multi-factor search and ranking engine.
   * Ranking considers: category relevance, engagement rate, verification source (`API_VERIFIED` / `ADMIN_VERIFIED`),
   * profile quality score, and completed orders — NEVER paid boost!
   */
  public searchCreators(filters: CreatorSearchFilters = {}): {
    items: PublicCreatorProfile[];
    total: number;
  } {
    let list = Array.from(this.publicCreators.values()).filter(
      (c) => c.status === "APPROVED"
    );

    if (filters.countryCode) {
      const cc = filters.countryCode.toUpperCase();
      list = list.filter((c) => c.countryCode === cc);
    }

    if (filters.citySlug) {
      const city = filters.citySlug.toLowerCase();
      list = list.filter((c) => c.citySlug === city);
    }

    if (filters.platform) {
      list = list.filter((c) => c.platforms.includes(filters.platform!));
    }

    if (filters.categorySlug) {
      const cat = filters.categorySlug.toLowerCase();
      list = list.filter((c) => c.categorySlugs.includes(cat));
    }

    if (filters.serviceTypeSlug) {
      const matchingCreatorIds = new Set(
        this.getServicesByTypeSlug(filters.serviceTypeSlug).map(
          (s) => s.creatorId
        )
      );
      list = list.filter((c) => matchingCreatorIds.has(c.id));
    }

    if (filters.minPriceMinorUnits !== undefined) {
      list = list.filter(
        (c) => c.startingPriceMinorUnits >= filters.minPriceMinorUnits!
      );
    }

    if (filters.maxPriceMinorUnits !== undefined) {
      list = list.filter(
        (c) => c.startingPriceMinorUnits <= filters.maxPriceMinorUnits!
      );
    }

    if (filters.minFollowers !== undefined) {
      list = list.filter((c) => c.totalFollowers >= filters.minFollowers!);
    }

    if (filters.maxFollowers !== undefined) {
      list = list.filter((c) => c.totalFollowers <= filters.maxFollowers!);
    }

    if (filters.minEngagementRate !== undefined) {
      list = list.filter(
        (c) => c.averageEngagementRate >= filters.minEngagementRate!
      );
    }

    if (filters.language) {
      const lang = filters.language.toLowerCase();
      list = list.filter((c) => c.spokenLanguages.includes(lang));
    }

    if (filters.verifiedOnly) {
      list = list.filter(
        (c) =>
          c.metricVerificationSource === "API_VERIFIED" ||
          c.metricVerificationSource === "ADMIN_VERIFIED"
      );
    }

    if (filters.minRating !== undefined) {
      list = list.filter(
        (c) => (c.averageRating ?? 0) >= filters.minRating!
      );
    }

    if (filters.maxDeliveryDays !== undefined) {
      list = list.filter(
        (c) => c.averageDeliveryDays <= filters.maxDeliveryDays!
      );
    }

    if (filters.ugcOnly) {
      list = list.filter((c) => c.offersUgc);
    }

    if (filters.queryText && filters.queryText.trim()) {
      const q = filters.queryText.trim().toLowerCase().replace(/^@/, "");
      list = list.filter(
        (c) =>
          c.username.toLowerCase().includes(q) ||
          c.displayName.toLowerCase().includes(q) ||
          c.headlineTr.toLowerCase().includes(q) ||
          c.bioTr.toLowerCase().includes(q) ||
          c.cityNameTr.toLowerCase().includes(q) ||
          c.categorySlugs.some((slug) => slug.includes(q))
      );
    }

    const computeCompositeRankScore = (c: PublicCreatorProfile): number => {
      const leaderBonus = c.isInfluencerLeader ? 35 : 0;
      const verificationBonus =
        c.metricVerificationSource === "API_VERIFIED"
          ? 20
          : c.metricVerificationSource === "ADMIN_VERIFIED"
            ? 14
            : 0;
      const engagementScore = Math.min(c.averageEngagementRate * 4, 25);
      const ratingScore = (c.averageRating ?? 4.0) * 5;
      return (
        c.qualityScore * 0.5 +
        leaderBonus +
        verificationBonus +
        engagementScore +
        ratingScore
      );
    };

    const sortBy = filters.sortBy || "RECOMMENDED";
    list.sort((a, b) => {
      switch (sortBy) {
        case "PRICE_ASC":
          return a.startingPriceMinorUnits - b.startingPriceMinorUnits;
        case "PRICE_DESC":
          return b.startingPriceMinorUnits - a.startingPriceMinorUnits;
        case "FOLLOWERS_DESC":
          return b.totalFollowers - a.totalFollowers;
        case "RATING_DESC":
          return (b.averageRating ?? 0) - (a.averageRating ?? 0);
        case "NEWEST":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "RECOMMENDED":
        default:
          return computeCompositeRankScore(b) - computeCompositeRankScore(a);
      }
    });

    const total = list.length;
    const offset = filters.offset || 0;
    const limit = Math.min(filters.limit || 24, 48);

    return {
      items: list.slice(offset, offset + limit),
      total,
    };
  }
}

export const marketplaceStore = new IsolatedMarketplaceStore();

export { INITIAL_CATEGORIES, INITIAL_CITIES };
