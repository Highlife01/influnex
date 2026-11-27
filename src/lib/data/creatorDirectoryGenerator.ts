/**
 * INFLUNEX 1,000 CREATOR DIRECTORY & ISOLATED OUTREACH CONTACT GENERATOR
 * - Deterministically builds 1,000 approved Influencer & UGC Creator profiles
 *   across all 25 categories, 8 Turkish regional hubs, and 4 platforms.
 * - Maintains strict physical separation between PublicCreatorProfile
 *   (zero PII/email/phone/IBAN) and CreatorOutreachContactRecord (SuperAdmin CRM only).
 */

import type {
  CreatorServiceRecord,
  MetricVerificationSource,
  PublicCreatorProfile,
  SupportedPlatform,
} from "../types/domain";
import { INFLUNEX_TENANT_ID } from "../firebase/isolation";
import {
  INITIAL_CATEGORIES,
  INITIAL_CITIES,
  SERVICE_TEMPLATES,
} from "./catalog";

export interface CreatorOutreachContactRecord {
  creatorId: string;
  username: string;
  displayName: string;
  socialHandle: string;
  citySlug: string;
  cityNameTr: string;
  primaryCategorySlug: string;
  primaryCategoryNameTr: string;
  primaryPlatform: SupportedPlatform;
  platforms: SupportedPlatform[];
  totalFollowers: number;
  averageEngagementRate: number;
  startingPriceMinorUnits: number;
  metricVerificationSource: MetricVerificationSource;
  offersUgc: boolean;
  profilePathTr: string;
}

const FIRST_NAMES = [
  "Ahmet",
  "Ayşe",
  "Mehmet",
  "Zeynep",
  "Can",
  "Elif",
  "Burak",
  "Selin",
  "Emre",
  "Defne",
  "Mert",
  "Ece",
  "Kaan",
  "Melis",
  "Kerem",
  "Deniz",
  "Onur",
  "Ceren",
  "Tolga",
  "İrem",
  "Barış",
  "Gizem",
  "Serkan",
  "Buse",
  "Arda",
  "Dilara",
  "Uğur",
  "Seda",
  "Alp",
  "Nazlı",
  "Sinan",
  "Pelin",
  "Oğuz",
  "Tuğba",
  "Hakan",
  "Damla",
  "Volkan",
  "Aslı",
  "Koray",
  "Yasemin",
] as const;

const LAST_NAMES = [
  "Yılmaz",
  "Kaya",
  "Demir",
  "Çelik",
  "Şahin",
  "Yıldız",
  "Yıldırım",
  "Öztürk",
  "Aydın",
  "Özdemir",
  "Arslan",
  "Doğan",
  "Kılıç",
  "Aslan",
  "Çetin",
  "Kara",
  "Koç",
  "Kurt",
  "Özkan",
  "Şimşek",
  "Polat",
  "Korkmaz",
  "Özcan",
  "Çakır",
  "Erdoğan",
] as const;

const AVATAR_URLS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
] as const;

const COVER_URLS = [
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
] as const;

function slugifyAscii(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildThousandCreatorCatalog(
  seedProfiles: PublicCreatorProfile[],
  seedServices: CreatorServiceRecord[],
  targetTotalCount: number = 1000
): {
  profiles: PublicCreatorProfile[];
  services: CreatorServiceRecord[];
  contacts: CreatorOutreachContactRecord[];
} {
  const profiles: PublicCreatorProfile[] = [...seedProfiles];
  const services: CreatorServiceRecord[] = [...seedServices];
  const contacts: CreatorOutreachContactRecord[] = [];

  // 1. Create isolated outreach contact records for the initial seed profiles
  for (const seed of seedProfiles) {
    const primaryCatSlug = seed.categorySlugs[0] || "moda";
    const catRecord =
      INITIAL_CATEGORIES.find((c) => c.slugTr === primaryCatSlug) ??
      INITIAL_CATEGORIES[0]!;

    contacts.push({
      creatorId: seed.id,
      username: seed.username,
      displayName: seed.displayName,
      socialHandle: `@${seed.username.replace(/-/g, "")}`,
      citySlug: seed.citySlug,
      cityNameTr: seed.cityNameTr,
      primaryCategorySlug: catRecord.slugTr,
      primaryCategoryNameTr: catRecord.nameTr,
      primaryPlatform: seed.primaryPlatform,
      platforms: seed.platforms,
      totalFollowers: seed.totalFollowers,
      averageEngagementRate: seed.averageEngagementRate,
      startingPriceMinorUnits: seed.startingPriceMinorUnits,
      metricVerificationSource: seed.metricVerificationSource,
      offersUgc: seed.offersUgc,
      profilePathTr: `/tr/influencer/${seed.username}`,
    });
  }

  const platformsPool: SupportedPlatform[] = [
    "INSTAGRAM",
    "TIKTOK",
    "YOUTUBE",
    "UGC",
  ];
  const verificationPool: MetricVerificationSource[] = [
    "API_VERIFIED",
    "ADMIN_VERIFIED",
    "ADMIN_VERIFIED",
    "USER_DECLARED",
  ];

  const remainingToGenerate = Math.max(0, targetTotalCount - profiles.length);
  const topMetroCities = INITIAL_CITIES.slice(0, 8); // İstanbul, Adana, Ankara, İzmir, Mersin, Antalya, Bursa, Gaziantep

  for (let i = 0; i < remainingToGenerate; i++) {
    const seq = profiles.length + 1;
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length]!;
    const lastName =
      LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length]!;
    // First 324 generated profiles guarantee at least 4 creators in every single one of Türkiye's 81 provinces (81 * 4 = 324).
    // Remaining generated profiles concentrate across the top 8 metropolitan hubs so all 8x25 City*Category combinations have >= 3 creators!
    const city =
      i < INITIAL_CITIES.length * 4
        ? INITIAL_CITIES[i % INITIAL_CITIES.length]!
        : topMetroCities[i % topMetroCities.length]!;
    const primaryCat =
      i < INITIAL_CITIES.length * 4
        ? INITIAL_CATEGORIES[i % INITIAL_CATEGORIES.length]!
        : INITIAL_CATEGORIES[Math.floor(i / topMetroCities.length) % INITIAL_CATEGORIES.length]!;
    const secondaryCat =
      INITIAL_CATEGORIES[(i + 7) % INITIAL_CATEGORIES.length]!;
    const thirdCat =
      INITIAL_CATEGORIES[(i + 13) % INITIAL_CATEGORIES.length]!;
    const primaryPlatform = platformsPool[i % platformsPool.length]!;
    const secondaryPlatform = platformsPool[(i + 1) % platformsPool.length]!;
    const offersUgc = primaryPlatform === "UGC" || i % 2 === 0;
    const platforms: SupportedPlatform[] = Array.from(
      new Set<SupportedPlatform>(
        offersUgc
          ? [primaryPlatform, secondaryPlatform, "UGC"]
          : [primaryPlatform, secondaryPlatform]
      )
    );

    const baseNameSlug = slugifyAscii(`${firstName}-${lastName}`);
    const username = `${baseNameSlug}-${city.slug}-${seq}`;
    const creatorId = `cr_gen_${String(seq).padStart(4, "0")}`;

    // Deterministic followers (18,000 to 680,000), ER (3.2% to 7.9%), price (2,500 TL to 9,500 TL)
    const totalFollowers = 18000 + ((i * 7919) % 662000);
    const averageEngagementRate = Number(
      (3.2 + ((i * 17) % 48) / 10).toFixed(2)
    );
    const averageViews = Math.round(
      totalFollowers * (averageEngagementRate / 100) * 8.5
    );
    const priceTl = 2500 + ((i * 350) % 7500); // 2,500 TL - 9,650 TL (always <= 10,000 TL budget filter)
    const startingPriceMinorUnits = priceTl * 100;
    const verificationSource = verificationPool[i % verificationPool.length]!;
    const qualityScore =
      verificationSource === "API_VERIFIED"
        ? 92 + (i % 7)
        : verificationSource === "ADMIN_VERIFIED"
          ? 86 + (i % 8)
          : 78 + (i % 8);

    const displayName = `${firstName} ${lastName}`;
    const headlineTr = `${city.nameTr} ${primaryCat.nameTr} & ${
      offersUgc ? "UGC " : ""
    }${primaryPlatform} İçerik Üreticisi`;
    const headlineEn = `${city.nameEn} ${primaryCat.nameEn} & ${
      offersUgc ? "UGC " : ""
    }${primaryPlatform} Creator`;

    const profile: PublicCreatorProfile = {
      id: creatorId,
      tenantId: INFLUNEX_TENANT_ID,
      username,
      previousUsernames: [],
      displayName,
      headlineTr,
      headlineEn,
      bioTr: `${city.nameTr} merkezli ${primaryCat.nameTr.toLowerCase()} ve ${secondaryCat.nameTr.toLowerCase()} kategorilerinde markalar için yüksek etkileşimli ${primaryPlatform} içerikleri ve ${
        offersUgc
          ? "dönüşüm odaklı UGC reklam kreatifleri"
          : "sponsorlu inceleme videoları"
      } üretiyorum.`,
      bioEn: `Producing high-engagement ${primaryPlatform} collaborations and ${
        offersUgc ? "conversion-focused UGC ad creatives" : "sponsored reviews"
      } in ${primaryCat.nameEn} and ${secondaryCat.nameEn} based in ${city.nameEn}.`,
      avatarUrl: AVATAR_URLS[i % AVATAR_URLS.length]!,
      coverUrl: COVER_URLS[i % COVER_URLS.length]!,
      countryCode: "TR",
      citySlug: city.slug,
      cityNameTr: city.nameTr,
      spokenLanguages: i % 3 === 0 ? ["tr", "en"] : ["tr"],
      categorySlugs: Array.from(
        new Set([
          primaryCat.slugTr,
          secondaryCat.slugTr,
          thirdCat.slugTr,
          ...(offersUgc ? ["ugc-icerik-uretimi"] : []),
        ])
      ),
      platforms,
      primaryPlatform,
      totalFollowers,
      averageEngagementRate,
      averageViews,
      metricVerificationSource: verificationSource,
      audienceSummaryTr: `%${75 + (i % 18)} Türkiye (${city.nameTr}, İstanbul, Ankara), 18-44 yaş ${primaryCat.nameTr.toLowerCase()} ilgi kitlesi`,
      audienceSummaryEn: `${75 + (i % 18)}% Türkiye (${city.nameEn}, Istanbul, Ankara), ages 18-44 interested in ${primaryCat.nameEn.toLowerCase()}`,
      startingPriceMinorUnits,
      currency: "TRY",
      averageDeliveryDays: 2 + (i % 4),
      completedOrdersCount: 3 + (i % 29),
      verifiedReviewCount: 2 + (i % 24),
      averageRating: Number((4.65 + ((i * 7) % 35) / 100).toFixed(2)),
      offersUgc,
      verificationBadges: {
        emailVerified: true,
        phoneVerified: true,
        identityVerified: true,
        socialVerified: verificationSource !== "USER_DECLARED",
      },
      status: "APPROVED",
      qualityScore,
      portfolio: [],
      updatedAt: "2026-11-25T10:00:00.000Z",
    };

    profiles.push(profile);

    // Build 1 active service package per generated creator so every service template & creator has active offers
    const template = SERVICE_TEMPLATES[i % SERVICE_TEMPLATES.length]!;
    services.push({
      id: `srv_gen_${String(seq).padStart(4, "0")}`,
      tenantId: INFLUNEX_TENANT_ID,
      creatorId,
      creatorUsername: username,
      titleTr: `${primaryCat.nameTr} ${template.nameTr} İş Birliği Paketi`,
      titleEn: `${primaryCat.nameEn} ${template.nameEn} Collaboration Package`,
      serviceTypeSlug: template.slug,
      platform: template.platform,
      descriptionTr: `${city.nameTr} stüdyo/dış çekim ${template.nameTr.toLowerCase()} prodüksiyonu, kurgu ve Ticaret Bakanlığı #reklam uyumlu yayın/teslim.`,
      descriptionEn: `${template.nameEn} production, editing, and compliant #ad delivery.`,
      priceMinorUnits: startingPriceMinorUnits,
      currency: "TRY",
      deliveryDays: template.defaultDeliveryDays,
      revisionCount: template.defaultRevisions,
      videoDurationSeconds: 45,
      postRetentionDays: 365,
      usageRightsTr: template.isUgc
        ? "Marka organik kanalları + 90 gün Meta/TikTok Paid Ads lisansı"
        : "Organik sosyal medya hesaplarında 1 yıl paylaşım hakkı",
      usageRightsEn: template.isUgc
        ? "Brand organic channels + 90-day Meta/TikTok Paid Ads license"
        : "1-year organic social media usage rights",
      paidAdsReuseAllowed: template.isUgc || i % 2 === 0,
      usageDurationDays: template.isUgc ? 90 : 365,
      exclusivityTermsTr: "7 gün aynı alt kategoride rakip marka paylaşılmaz",
      isUgcService: template.isUgc,
      isActive: true,
      updatedAt: "2026-11-25T10:00:00.000Z",
    });

    // Build directory summary record (zero generated emails)
    contacts.push({
      creatorId,
      username,
      displayName,
      socialHandle: `@${baseNameSlug.replace(/-/g, "")}${seq}`,
      citySlug: city.slug,
      cityNameTr: city.nameTr,
      primaryCategorySlug: primaryCat.slugTr,
      primaryCategoryNameTr: primaryCat.nameTr,
      primaryPlatform,
      platforms,
      totalFollowers,
      averageEngagementRate,
      startingPriceMinorUnits,
      metricVerificationSource: verificationSource,
      offersUgc,
      profilePathTr: `/tr/influencer/${username}`,
    });
  }

  return { profiles, services, contacts };
}
