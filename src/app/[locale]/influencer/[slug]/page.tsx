import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { CreatorCard } from "@/components/CreatorCard";
import {
  FEATURED_CITIES,
  INITIAL_CATEGORIES,
  INITIAL_CITIES,
  PLATFORM_LABELS,
  SERVICE_TEMPLATES,
  TURKIYE_REGIONS,
} from "@/lib/data/catalog";
import { marketplaceStore } from "@/lib/data/marketplaceStore";
import {
  calculateCommissionBreakdown,
  formatMinorUnits,
} from "@/lib/finance/commission";
import { DICTIONARY, normalizeLocale } from "@/lib/i18n/dictionary";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildCreatorProfileJsonLd,
  buildFaqJsonLd,
} from "@/lib/seo/jsonLd";
import { evaluateIndexQualityGate } from "@/lib/seo/qualityGate";
import {
  buildCanonicalUrl,
  buildHreflangAlternates,
  getCategoryNameBySlug,
  resolveDiscoverySlug,
} from "@/lib/seo/routeRegistry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = normalizeLocale(rawLocale);
  const resolved = resolveDiscoverySlug(slug, locale);
  const basePath = locale === "tr" ? "/tr/influencer" : "/en/creators";

  if (resolved.kind === "CREATOR_PROFILE") {
    const p = resolved.profile;
    return {
      title: `${p.displayName} (@${p.username}) — ${p.cityNameTr} Influencer Profili`,
      description: `${p.displayName} doğrulanmış influencer profili: ${p.headlineTr}. Toplam hizmet başlangıç bedeli: ${formatMinorUnits(p.startingPriceMinorUnits)} (%15 platform komisyonu, %85 üretici payı).`,
      alternates: buildHreflangAlternates(
        `/tr/influencer/${p.username}`,
        `/en/creators/${p.username}`,
        locale
      ),
      openGraph: {
        title: `${p.displayName} (@${p.username}) | InfluNex`,
        description: p.headlineTr,
        images: [{ url: p.avatarUrl }],
      },
    };
  }

  if (resolved.kind === "CITY") {
    const c = resolved.city;
    const { items } = marketplaceStore.searchCreators({ citySlug: c.slug });
    const gate = evaluateIndexQualityGate({
      path: `${basePath}/${c.slug}`,
      approvedCreatorCount: items.length,
      activeServiceCount: items.length,
      uniqueDescriptionText: c.descriptionTr + " " + c.descriptionEn,
    });
    return {
      title: `${c.nameTr} Influencer ve İçerik Üreticileri`,
      description: `${c.nameTr}'daki influencer ve UGC içerik üreticilerini keşfedin. Instagram, TikTok ve YouTube reklam hizmetlerini karşılaştırın ve markanıza uygun iş birlikleri oluşturun.`,
      alternates: buildHreflangAlternates(
        `/tr/influencer/${c.slug}`,
        `/en/creators/${c.slug}`,
        locale
      ),
      robots: {
        index: gate.indexable,
        follow: true,
      },
    };
  }

  if (resolved.kind === "CATEGORY") {
    const cat = resolved.category;
    const { items } = marketplaceStore.searchCreators({
      categorySlug: cat.slugTr,
    });
    const gate = evaluateIndexQualityGate({
      path: `${basePath}/${cat.slugTr}`,
      approvedCreatorCount: items.length,
      activeServiceCount: items.length,
      uniqueDescriptionText: cat.descriptionTr + " " + cat.seoDescriptionTr,
    });
    return {
      title:
        locale === "tr"
          ? cat.seoTitleTr.replace(" | InfluNex", "")
          : cat.seoTitleEn.replace(" | InfluNex", ""),
      description:
        locale === "tr" ? cat.seoDescriptionTr : cat.seoDescriptionEn,
      alternates: buildHreflangAlternates(
        `/tr/influencer/${cat.slugTr}`,
        `/en/creators/${cat.slugEn}`,
        locale
      ),
      robots: {
        index: gate.indexable,
        follow: true,
      },
    };
  }

  if (resolved.kind === "PLATFORM") {
    const label = PLATFORM_LABELS[resolved.platform];
    const { items } = marketplaceStore.searchCreators({
      platform: resolved.platform,
    });
    const gate = evaluateIndexQualityGate({
      path: `${basePath}/${resolved.slug}`,
      approvedCreatorCount: items.length,
      activeServiceCount: items.length,
      uniqueDescriptionText: `${label.nameTr} platformunda onaylı influencer ve içerik üreticileri listesi, reklam fiyatları ve iş birliği seçenekleri.`,
    });
    return {
      title: `${label.nameTr} Influencer ve İçerik Üreticileri`,
      description: `${label.nameTr} reklam iş birlikleri için doğrulanmış influencer profillerini, takipçi ve fiyat bilgilerini inceleyin.`,
      alternates: {
        canonical: buildCanonicalUrl(`${basePath}/${resolved.slug}`),
      },
      robots: {
        index: gate.indexable,
        follow: true,
      },
    };
  }

  if (resolved.kind === "COUNTRY") {
    return {
      title: "Türkiye 81 İl Influencer ve UGC İçerik Üreticileri Rehberi",
      description:
        "Türkiye'nin 7 coğrafi bölgesi ve 81 ilindeki doğrulanmış Instagram, TikTok, YouTube influencer'larını ve UGC içerik üreticilerini şehir ve kategoriye göre keşfedin.",
      alternates: buildHreflangAlternates(
        "/tr/influencer/turkiye",
        "/en/creators/turkiye",
        locale
      ),
    };
  }

  return {
    title: "Bulunamadı",
    robots: { index: false, follow: false },
  };
}

export default async function DynamicSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = DICTIONARY[locale];
  const resolved = resolveDiscoverySlug(slug, locale);

  if (resolved.kind === "CREATOR_REDIRECT_301") {
    permanentRedirect(resolved.destinationPath);
  }

  if (resolved.kind === "NOT_FOUND") {
    notFound();
  }

  // CASE A: INDIVIDUAL CREATOR PROFILE PAGE (/tr/influencer/kullanici-adi)
  if (resolved.kind === "CREATOR_PROFILE") {
    const creator = resolved.profile;
    const services = marketplaceStore.getCreatorServices(creator.id);
    const profileJsonLd = buildCreatorProfileJsonLd(creator, services, locale);
    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
      { name: "InfluNex", path: `/${locale}` },
      {
        name: "Influencer Keşfet",
        path: locale === "tr" ? "/tr/influencer" : "/en/creators",
      },
      {
        name: creator.cityNameTr,
        path: `/tr/influencer/${creator.citySlug}`,
      },
      {
        name: creator.displayName,
        path: `/tr/influencer/${creator.username}`,
      },
    ]);

    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />

        <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
          <Link href={`/${locale}`} className="hover:text-indigo-600">
            InfluNex
          </Link>{" "}
          /{" "}
          <Link href="/tr/influencer" className="hover:text-indigo-600">
            Influencer Keşfet
          </Link>{" "}
          /{" "}
          <Link
            href={`/tr/influencer/${creator.citySlug}`}
            className="hover:text-indigo-600"
          >
            {creator.cityNameTr}
          </Link>{" "}
          /{" "}
          <span className="font-semibold text-slate-800">
            {creator.displayName}
          </span>
        </nav>

        {/* Creator Profile Header Card */}
        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
          <div className="h-40 w-full bg-slate-900 sm:h-52">
            <img
              src={creator.coverUrl}
              alt={`${creator.displayName} kapak görseli`}
              className="h-full w-full object-cover opacity-85"
            />
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="flex items-start gap-4">
                <img
                  src={creator.avatarUrl}
                  alt={creator.displayName}
                  width={96}
                  height={96}
                  className="-mt-14 h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-md"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                      {creator.displayName}
                    </h1>
                    {creator.isInfluencerLeader ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400 bg-gradient-to-r from-emerald-600 to-teal-700 px-3 py-0.5 text-xs font-extrabold text-white shadow-2xs">
                        👑 {locale === "tr" ? creator.leaderTitleTr || "Influencer Lideri" : creator.leaderTitleEn || "Influencer Leader"}
                      </span>
                    ) : null}
                    <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
                      Onaylı Influencer Profili
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    @{creator.username} • {creator.cityNameTr}, Türkiye
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {locale === "tr" ? creator.headlineTr : creator.headlineEn}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {creator.socialProfileUrl ? (
                  <a
                    href={creator.socialProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-pink-200 bg-pink-50 px-4 py-2.5 text-sm font-bold text-pink-800 hover:bg-pink-100"
                  >
                    Instagram (@{creator.username}) ↗
                  </a>
                ) : null}
                <Link
                  href={`/tr/kayit?role=ADVERTISER&creator=${creator.username}`}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-indigo-700"
                >
                  İş Birliği & Brief Talebi Başlat
                </Link>
                <Link
                  href={`/tr/panel?action=order&creator=${creator.username}`}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Sipariş Akışını İncele
                </Link>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-slate-700">
              {locale === "tr" ? creator.bioTr : creator.bioEn}
            </p>

            {/* Key Metrics */}
            <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-4">
              <div>
                <dt className="text-xs text-slate-500">
                  Toplam Takipçi
                </dt>
                <dd className="mt-0.5 text-lg font-extrabold text-slate-900">
                  {creator.totalFollowers.toLocaleString("tr-TR")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Etkileşim Oranı</dt>
                <dd className="mt-0.5 text-lg font-extrabold text-emerald-700">
                  %{creator.averageEngagementRate}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Ort. Görüntülenme</dt>
                <dd className="mt-0.5 text-lg font-extrabold text-slate-900">
                  {creator.averageViews.toLocaleString("tr-TR")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Ortalama Teslim</dt>
                <dd className="mt-0.5 text-lg font-extrabold text-slate-900">
                  {creator.averageDeliveryDays} İş Günü
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Services & Transparent Pricing List */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-slate-900">
            Hizmet Paketleri ve Fiyatlar
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            İhtiyacınıza uygun paketi seçerek iş birliği başlatabilirsiniz.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            {services.map((srv) => {
              const breakdown = calculateCommissionBreakdown(
                srv.priceMinorUnits,
                srv.currency
              );
              return (
                <div
                  key={srv.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded-md bg-indigo-50 px-2.5 py-1 font-bold text-indigo-800">
                        {srv.platform} • {srv.isUgcService ? "UGC Kreatif" : "Influencer Yayını"}
                      </span>
                      <span className="font-medium text-slate-500">
                        Teslim: {srv.deliveryDays} Gün • {srv.revisionCount} Revizyon Hakkı
                      </span>
                    </div>
                    <h3 className="mt-2.5 text-base font-bold text-slate-900">
                      {locale === "tr" ? srv.titleTr : srv.titleEn}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      {locale === "tr" ? srv.descriptionTr : srv.descriptionEn}
                    </p>

                    {/* Clean Usage Summary */}
                    <dl className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                      <div className="flex justify-between py-1.5">
                        <dt className="text-slate-600">Paylaşım Şekli:</dt>
                        <dd className="font-semibold text-slate-900">
                          {srv.isUgcService
                            ? "Markaya Video Teslimi (UGC)"
                            : `${srv.platform} Hesabında Paylaşım`}
                        </dd>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <dt className="text-slate-600">Kullanım Süresi:</dt>
                        <dd className="font-semibold text-slate-900">
                          {srv.usageDurationDays} Gün
                        </dd>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <dt className="text-slate-600">Reklam İzni:</dt>
                        <dd className="font-semibold text-slate-900">
                          {srv.paidAdsReuseAllowed
                            ? "Sponsorlu Reklam İzni Dahil"
                            : "Organik Paylaşım"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <span className="block text-xs text-slate-500">
                        Paket Fiyatı
                      </span>
                      <strong className="text-lg font-extrabold text-slate-900">
                        {formatMinorUnits(breakdown.grossAmountMinorUnits)}
                      </strong>
                    </div>
                    <Link
                      href={`/tr/panel?action=order&serviceId=${srv.id}`}
                      className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
                    >
                      İş Birliği Başlat
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Creator Portfolio & Recent Reels Showcase */}
        {creator.portfolio.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">
              Portfolyo ve Öne Çıkan İçerik Örnekleri
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              İçerik üreticisinin yayınladığı örnek Reels ve marka iş birliği formatları.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {creator.portfolio.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs"
                >
                  <div className="h-44 w-full bg-slate-100">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-700">
                        <span>
                          {item.platform} • {item.format}
                        </span>
                        {item.durationSeconds ? (
                          <span>{item.durationSeconds} sn</span>
                        ) : null}
                      </div>
                      <h3 className="mt-1 text-sm font-bold text-slate-900">
                        {item.title}
                      </h3>
                    </div>
                    {item.contentUrl ? (
                      <a
                        href={item.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        Instagram&apos;da İncele ↗
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Internal Linking: Human-Readable Category & City Names with Proper Spacing (Audit Section 4 Fix) */}
        <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-sm font-bold text-slate-900">
            İlgili Şehir ve Kategori Bağlantıları
          </h2>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Link
              href={`/tr/influencer/${creator.citySlug}`}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-indigo-700 hover:border-indigo-400"
            >
              {creator.cityNameTr} Influencer&apos;ları
            </Link>
            {creator.categorySlugs.map((catSlug) => {
              const catLabel = getCategoryNameBySlug(catSlug, locale);
              return (
                <Link
                  key={catSlug}
                  href={`/tr/influencer/${catSlug}`}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:border-indigo-400"
                >
                  {catLabel} Influencer&apos;ları
                </Link>
              );
            })}
            {creator.categorySlugs.map((catSlug) => {
              const catLabel = getCategoryNameBySlug(catSlug, locale);
              return (
                <Link
                  key={`${creator.citySlug}-${catSlug}`}
                  href={`/tr/influencer/${creator.citySlug}/${catSlug}`}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:border-indigo-400"
                >
                  {creator.cityNameTr} {catLabel} Influencer&apos;ları
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // CASE B: PROGRAMMATIC LISTING PAGE (City, Category, Platform, or Country)
  let heading = "";
  let description = "";
  let creators = marketplaceStore.searchCreators().items;
  let totalMatches = creators.length;

  if (resolved.kind === "CITY") {
    heading = `${resolved.city.nameTr} Influencer ve UGC İçerik Üreticileri`;
    description = resolved.city.descriptionTr;
    const res = marketplaceStore.searchCreators({
      citySlug: resolved.city.slug,
      limit: 24,
    });
    creators = res.items;
    totalMatches = res.total;
  } else if (resolved.kind === "CATEGORY") {
    heading = `${resolved.category.nameTr} Influencer ve İçerik Üreticileri`;
    description = resolved.category.descriptionTr;
    const res = marketplaceStore.searchCreators({
      categorySlug: resolved.category.slugTr,
      limit: 24,
    });
    creators = res.items;
    totalMatches = res.total;
  } else if (resolved.kind === "PLATFORM") {
    const label = PLATFORM_LABELS[resolved.platform];
    heading = `${label.nameTr} Influencer ve İçerik Üreticileri`;
    description = `${label.nameTr} üzerinde markanız için gerçek etkileşimli sponsorlu içerik ve reklam iş birlikleri oluşturun.`;
    const res = marketplaceStore.searchCreators({
      platform: resolved.platform,
      limit: 24,
    });
    creators = res.items;
    totalMatches = res.total;
  } else if (resolved.kind === "COUNTRY") {
    heading = "Türkiye 81 İl Influencer ve UGC İçerik Üreticileri Rehberi";
    description =
      "Türkiye'nin 7 coğrafi bölgesindeki 81 il ve 25 uzmanlık kategorisinde doğrulanmış Instagram, TikTok, YouTube influencer'ları ve UGC içerik üreticileri.";
    const res = marketplaceStore.searchCreators({ limit: 12 });
    creators = res.items;
    totalMatches = res.total;
  }

  const pagePath =
    locale === "tr" ? `/tr/influencer/${slug}` : `/en/creators/${slug}`;

  const collectionJsonLd = buildCollectionPageJsonLd({
    title: heading,
    description,
    path: pagePath,
    creators,
    locale,
  });

  const programmaticFaqs =
    resolved.kind === "CITY"
      ? [
          {
            question: `${resolved.city.nameTr} influencer ve UGC içerik üreticileriyle nasıl iş birliği yapılır?`,
            answer: `${resolved.city.nameTr} (${resolved.city.regionTr} Bölgesi) sayfasındaki onaylı profilleri inceleyerek doğrudan hizmet paketi seçebilir veya ücretsiz kampanya ilanı açarak ${resolved.city.nameTr} merkezli içerik üreticilerinden teklif toplayabilirsiniz.`,
          },
          {
            question: `${resolved.city.nameTr} influencer reklam fiyatları nasıl belirlenir?`,
            answer: `${resolved.city.nameTr} ilindeki içerik üreticileri Instagram Reels, Story, TikTok, YouTube ve UGC video paket fiyatlarını kendi belirler. Üyelik ücretsizdir; yalnızca tamamlanan iş birliklerinde %15 hizmet komisyonu uygulanır ve %85 üreticiye ödenir.`,
          },
        ]
      : resolved.kind === "CATEGORY"
        ? [
            {
              question: `Türkiye'de ${resolved.category.nameTr.toLowerCase()} kategorisinde hangi şehirlerde influencer bulunuyor?`,
              answer: `İstanbul, Adana, Ankara, İzmir, Antalya, Bursa, Mersin ve Gaziantep başta olmak üzere Türkiye'nin 81 ilinde ${resolved.category.nameTr.toLowerCase()} alanında içerik üreten doğrulanmış profiller yer almaktadır.`,
            },
            {
              question: `${resolved.category.nameTr} markaları için UGC mi yoksa influencer paylaşımı mı tercih edilmeli?`,
              answer: `Markanızın kendi reklamlarında (Meta/TikTok Ads) kullanmak istediğiniz kreatifler için UGC paketlerini, doğrudan hedef kitle erişimi için influencer paylaşım paketlerini tercih edebilirsiniz.`,
            },
          ]
        : [
            {
              question: "InfluNex Türkiye'nin kaç ilinde hizmet veriyor?",
              answer:
                "InfluNex, Türkiye'nin 7 coğrafi bölgesindeki 81 ilin tamamında ve 25 sektörel kategoride markalarla içerik üreticilerini buluşturur.",
            },
            {
              question: "Şehir ve kategori sayfalarında üyelik ücreti var mı?",
              answer:
                "Hayır. Türkiye'nin 81 ilinden tüm içerik üreticileri ve markalar ücretsiz katılır; yalnızca tamamlanan işlerde %15 komisyon uygulanır.",
            },
          ];

  const faqJsonLd = buildFaqJsonLd(programmaticFaqs);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
          <Link href={`/${locale}`} className="hover:text-indigo-600">
            InfluNex
          </Link>{" "}
          /{" "}
          <Link href="/tr/influencer" className="hover:text-indigo-600">
            Influencer Keşfet
          </Link>{" "}
          /{" "}
          {resolved.kind === "CITY" ? (
            <>
              <Link
                href="/tr/influencer/turkiye"
                className="hover:text-indigo-600"
              >
                Türkiye (81 İl)
              </Link>{" "}
              /{" "}
            </>
          ) : null}
          <span className="font-semibold text-slate-800">{heading}</span>
        </nav>

        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800">
          {totalMatches.toLocaleString("tr-TR")} Onaylı Profil
        </span>
      </div>

      <h1 className="mt-4 text-3xl font-extrabold text-slate-900">{heading}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
        {description}
      </p>

      {/* CITY QUICK FILTER PILLS: Platforms & Top Categories in This City */}
      {resolved.kind === "CITY" ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-800">
              {resolved.city.nameTr} Platformlar:
            </span>
            {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
              <Link
                key={k}
                href={
                  v.slug === "ugc"
                    ? `/tr/ugc/${resolved.city.slug}`
                    : `/tr/influencer/${resolved.city.slug}/${v.slug}`
                }
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-indigo-700 hover:border-indigo-400"
              >
                {resolved.city.nameTr} {v.nameTr}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-800">
              {resolved.city.nameTr} Sektörler:
            </span>
            {INITIAL_CATEGORIES.slice(0, 12).map((cat) => (
              <Link
                key={cat.id}
                href={`/tr/influencer/${resolved.city.slug}/${cat.slugTr}`}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-700"
              >
                {resolved.city.nameTr} {cat.nameTr}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {/* TURKIYE 81 PROVINCES x 7 GEOGRAPHICAL REGIONS HUB (/tr/influencer/turkiye) */}
      {resolved.kind === "COUNTRY" ? (
        <section className="mt-8 space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs text-slate-500">Kapsanan İl Sayısı</span>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">
                81 İl
              </p>
              <span className="text-xs text-emerald-700">
                01 Adana – 81 Düzce
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs text-slate-500">Coğrafi Bölge</span>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">
                7 Bölge
              </p>
              <span className="text-xs text-indigo-700">
                Tüm Türkiye Kapsamı
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs text-slate-500">Sektörel Kategori</span>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">
                25 Kategori
              </p>
              <span className="text-xs text-slate-600">
                81 × 25 = 2.025 İl/Sektör Ağı
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs text-slate-500">Onaylı Üretici</span>
              <p className="mt-1 text-2xl font-extrabold text-emerald-700">
                {totalMatches.toLocaleString("tr-TR")}+
              </p>
              <span className="text-xs text-slate-600">
                Instagram, TikTok, YouTube & UGC
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {TURKIYE_REGIONS.map((region) => {
              const regionCities = [...INITIAL_CITIES]
                .filter((c) => c.regionTr === region)
                .sort((a, b) => a.plateCode - b.plateCode);
              return (
                <div
                  key={region}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-base font-bold text-slate-900">
                      {region} Bölgesi Influencer&apos;ları
                    </h2>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-800">
                      {regionCities.length} İl
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {regionCities.map((city) => (
                      <Link
                        key={city.id}
                        href={`/tr/influencer/${city.slug}`}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-medium text-slate-800 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-800"
                      >
                        <span className="font-mono text-[11px] text-slate-400">
                          {String(city.plateCode).padStart(2, "0")}
                        </span>{" "}
                        {city.nameTr}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {creators.length > 0 ? (
        <div className="mt-8">
          {resolved.kind === "COUNTRY" ? (
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Türkiye Geneli Öne Çıkan İçerik Üreticileri
            </h2>
          ) : null}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} locale={locale} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
          <h2 className="text-lg font-bold text-slate-900">
            Bu kategoride/şehirde henüz yeterli onaylı profil bulunmuyor
          </h2>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/tr/kampanyalar"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
            >
              Kampanyaları İncele
            </Link>
            <Link
              href="/tr/kayit?role=CREATOR"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800"
            >
              Ücretsiz Üretici Kaydı
            </Link>
          </div>
        </div>
      )}

      {/* Programmatic Internal Linking Matrix: All 25 Categories, Neighboring Cities & All 81 Provinces */}
      <section className="mt-12 space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        {resolved.kind === "CITY" ? (
          <>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {resolved.city.nameTr} İli 25 Kategori Influencer Sayfaları
              </h2>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {INITIAL_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/tr/influencer/${resolved.city.slug}/${cat.slugTr}`}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-700"
                  >
                    {resolved.city.nameTr} {cat.nameTr} Influencer&apos;ları
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {resolved.city.regionTr} Bölgesi ve Türkiye Geneli Diğer İller
                </h3>
                <Link
                  href="/tr/influencer/turkiye"
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Tüm 81 İli Görüntüle →
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {INITIAL_CITIES.filter(
                  (c) =>
                    c.slug !== resolved.city.slug &&
                    (c.regionTr === resolved.city.regionTr ||
                      FEATURED_CITIES.some((f) => f.slug === c.slug))
                )
                  .slice(0, 24)
                  .map((city) => (
                    <Link
                      key={city.id}
                      href={`/tr/influencer/${city.slug}`}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:border-indigo-400"
                    >
                      {city.nameTr} Influencer&apos;ları
                    </Link>
                  ))}
              </div>
            </div>
          </>
        ) : resolved.kind === "CATEGORY" ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900">
                81 İlde {resolved.category.nameTr} Influencer ve İçerik
                Üreticileri
              </h2>
              <Link
                href="/tr/influencer/turkiye"
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Türkiye 81 İl Rehberi →
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {INITIAL_CITIES.map((city) => (
                <Link
                  key={city.id}
                  href={`/tr/influencer/${city.slug}/${resolved.category.slugTr}`}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-700"
                >
                  {city.nameTr} {resolved.category.nameTr}
                </Link>
              ))}
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                25 Uzmanlık Kategorisi ve 12 Hizmet Formatı
              </h2>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {INITIAL_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/tr/influencer/${cat.slugTr}`}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:border-indigo-400"
                  >
                    {cat.nameTr} Influencer&apos;ları
                  </Link>
                ))}
                {SERVICE_TEMPLATES.map((srv) => (
                  <Link
                    key={srv.slug}
                    href={`/tr/hizmetler/${srv.slug}`}
                    className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 font-semibold text-indigo-900 hover:border-indigo-400"
                  >
                    {srv.nameTr}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* Localized Programmatic FAQ Accordion */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-900">
          Sık Sorulan Sorular
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {programmaticFaqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <h3 className="text-sm font-bold text-slate-900">
                {faq.question}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
