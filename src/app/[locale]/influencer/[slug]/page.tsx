import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { CreatorCard } from "@/components/CreatorCard";
import {
  INITIAL_CATEGORIES,
  INITIAL_CITIES,
  PLATFORM_LABELS,
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
} from "@/lib/seo/jsonLd";
import { evaluateIndexQualityGate } from "@/lib/seo/qualityGate";
import {
  buildCanonicalUrl,
  buildHreflangAlternates,
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
      description: `${p.displayName}: ${p.headlineTr}. Takipçi: ${p.totalFollowers.toLocaleString("tr-TR")}, Etkileşim: %${p.averageEngagementRate}. Başlangıç fiyatı: ${formatMinorUnits(p.startingPriceMinorUnits)}.`,
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
      title: locale === "tr" ? cat.seoTitleTr.replace(" | InfluNex", "") : cat.seoTitleEn.replace(" | InfluNex", ""),
      description: locale === "tr" ? cat.seoDescriptionTr : cat.seoDescriptionEn,
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
      title: "Türkiye Influencer ve UGC İçerik Üreticileri",
      description:
        "Türkiye genelindeki Instagram, TikTok, YouTube influencer ve UGC içerik üreticilerini keşfedin.",
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
        name: "Influencer",
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
          / <span className="font-semibold text-slate-800">{creator.displayName}</span>
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
                  <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                    {creator.displayName}
                  </h1>
                  <p className="text-sm text-slate-500">
                    @{creator.username} • {creator.cityNameTr}, Türkiye
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {locale === "tr" ? creator.headlineTr : creator.headlineEn}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/tr/panel?action=order&creator=${creator.username}`}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-indigo-700"
                >
                  Hizmet Satın Al
                </Link>
                <Link
                  href={`/tr/panel?tab=messages&to=${creator.username}`}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Ücretsiz Mesaj Gönder
                </Link>
              </div>
            </div>

            {/* Distinct Verification Badges & Metric Source Attribution (Sections 7 & 8) */}
            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4 text-xs">
              <span className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1 font-semibold text-indigo-900">
                Veri Kaynağı: {t.metricSource[creator.metricVerificationSource]}
              </span>
              {creator.verificationBadges.emailVerified ? (
                <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-800">
                  ✓ Doğrulanmış E-Posta
                </span>
              ) : null}
              {creator.verificationBadges.identityVerified ? (
                <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-800">
                  ✓ Doğrulanmış Kimlik (18+)
                </span>
              ) : null}
              {creator.verificationBadges.socialVerified ? (
                <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-800">
                  ✓ Doğrulanmış Sosyal Medya Hesabı
                </span>
              ) : (
                <span className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 font-medium text-amber-800">
                  İstatistikler Kullanıcı Beyanlıdır
                </span>
              )}
            </div>

            <p className="mt-5 text-sm leading-relaxed text-slate-700">
              {locale === "tr" ? creator.bioTr : creator.bioEn}
            </p>

            {/* Key Metrics */}
            <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-4">
              <div>
                <dt className="text-xs text-slate-500">Toplam Takipçi</dt>
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
                <dt className="text-xs text-slate-500">Tamamlanan Sipariş</dt>
                <dd className="mt-0.5 text-lg font-extrabold text-slate-900">
                  {creator.completedOrdersCount} İş Birliği
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Services & Transparent Pricing List (Section 11) */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-slate-900">
            Reklam Hizmetleri ve Fiyatları
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Sipariş başladığında fiyat, komisyon oranı (%15) ve kullanım haklarının değiştirilemez anlık görüntüsü (snapshot) kaydedilir.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {services.map((srv) => {
              const breakdown = calculateCommissionBreakdown(
                srv.priceMinorUnits,
                srv.currency
              );
              return (
                <div
                  key={srv.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded-md bg-indigo-50 px-2.5 py-1 font-bold text-indigo-800">
                        {srv.platform}
                      </span>
                      <span className="text-slate-500">
                        Teslim: {srv.deliveryDays} Gün • {srv.revisionCount} Revizyon
                      </span>
                    </div>
                    <h3 className="mt-2.5 text-base font-bold text-slate-900">
                      {locale === "tr" ? srv.titleTr : srv.titleEn}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      {locale === "tr" ? srv.descriptionTr : srv.descriptionEn}
                    </p>
                    <ul className="mt-3 space-y-1 text-xs text-slate-600">
                      <li>
                        <strong>Kullanım Hakları:</strong> {srv.usageRightsTr}
                      </li>
                      <li>
                        <strong>Ücretli Reklam (Paid Ads) İzni:</strong>{" "}
                        {srv.paidAdsReuseAllowed ? "Dahil" : "Yalnızca Organik Paylaşım"}
                      </li>
                      <li>
                        <strong>Münhasırlık:</strong> {srv.exclusivityTermsTr}
                      </li>
                    </ul>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <span className="text-lg font-extrabold text-slate-900">
                        {formatMinorUnits(srv.priceMinorUnits)}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        Influencer Net Hakedişi (%85):{" "}
                        {formatMinorUnits(breakdown.creatorNetPayoutMinorUnits)}
                      </span>
                    </div>

                    <Link
                      href={`/tr/panel?action=order&serviceId=${srv.id}`}
                      className="rounded-xl bg-indigo-950 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                    >
                      Sipariş Oluştur
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Internal Linking: Related City & Categories (Section 26) */}
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
            {creator.categorySlugs.map((catSlug) => (
              <Link
                key={catSlug}
                href={`/tr/influencer/${catSlug}`}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:border-indigo-400"
              >
                {catSlug} Influencer&apos;ları
              </Link>
            ))}
            {creator.categorySlugs.map((catSlug) => (
              <Link
                key={`${creator.citySlug}-${catSlug}`}
                href={`/tr/influencer/${creator.citySlug}/${catSlug}`}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:border-indigo-400"
              >
                {creator.cityNameTr} {catSlug}
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // CASE B: PROGRAMMATIC LISTING PAGE (City, Category, Platform, or Country)
  let heading = "";
  let description = "";
  let creators = marketplaceStore.searchCreators().items;

  if (resolved.kind === "CITY") {
    heading = `${resolved.city.nameTr} Influencer ve UGC İçerik Üreticileri`;
    description = resolved.city.descriptionTr;
    creators = marketplaceStore.searchCreators({
      citySlug: resolved.city.slug,
    }).items;
  } else if (resolved.kind === "CATEGORY") {
    heading = `${resolved.category.nameTr} Influencer ve İçerik Üreticileri`;
    description = resolved.category.descriptionTr;
    creators = marketplaceStore.searchCreators({
      categorySlug: resolved.category.slugTr,
    }).items;
  } else if (resolved.kind === "PLATFORM") {
    const label = PLATFORM_LABELS[resolved.platform];
    heading = `${label.nameTr} Influencer ve İçerik Üreticileri`;
    description = `${label.nameTr} üzerinde markanız için gerçek etkileşimli sponsorlu içerik ve reklam iş birlikleri oluşturun.`;
    creators = marketplaceStore.searchCreators({
      platform: resolved.platform,
    }).items;
  } else if (resolved.kind === "COUNTRY") {
    heading = "Türkiye Influencer ve UGC İçerik Üreticileri";
    description =
      "Türkiye genelindeki 81 il ve 25 kategoride onaylı influencer ve UGC içerik üreticileri.";
  }

  const pagePath =
    locale === "tr" ? `/tr/influencer/${slug}` : `/en/creators/${slug}`;
  const gate = evaluateIndexQualityGate({
    path: pagePath,
    approvedCreatorCount: creators.length,
    activeServiceCount: creators.length,
    uniqueDescriptionText: `${heading} - ${description} Markanız için güvenli ve şeffaf %15 komisyon modeliyle hemen iş birliği başlatın.`,
  });

  const collectionJsonLd = buildCollectionPageJsonLd({
    title: heading,
    description,
    path: pagePath,
    creators,
    locale,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
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
          / <span className="font-semibold text-slate-800">{heading}</span>
        </nav>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            gate.indexable
              ? "bg-emerald-50 text-emerald-800"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          SEO Quality Gate: {gate.robotsDirective} ({creators.length} Onaylı Profil)
        </span>
      </div>

      <h1 className="mt-4 text-3xl font-extrabold text-slate-900">{heading}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
        {description}
      </p>

      {creators.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
          <h2 className="text-lg font-bold text-slate-900">
            Bu kategoride/şehirde henüz yeterli onaylı profil bulunmuyor
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            InfluNex politikası gereği hiçbir sayfada sahte influencer profili
            veya uydurma fiyat gösterilmez. Bu sayfa yeterli onaylı profil
            oluşana kadar arama motorlarına <code>noindex</code> olarak sunulur.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/tr/kampanyalar"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
            >
              Ücretsiz Kampanya İlanı Aç
            </Link>
            <Link
              href="/tr/kayit?role=CREATOR"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800"
            >
              İlk Influencer Olarak Katıl
            </Link>
          </div>
        </div>
      )}

      {/* Cross-linking Matrix (City x Category & Related Hubs) */}
      <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-base font-bold text-slate-900">
          İlgili Şehir ve Kategori Kombinasyonları
        </h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {resolved.kind === "CITY"
            ? INITIAL_CATEGORIES.slice(0, 10).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/tr/influencer/${resolved.city.slug}/${cat.slugTr}`}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:border-indigo-400"
                >
                  {resolved.city.nameTr} {cat.nameTr} Influencer
                </Link>
              ))
            : INITIAL_CITIES.map((city) => (
                <Link
                  key={city.id}
                  href={`/tr/influencer/${city.slug}`}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:border-indigo-400"
                >
                  {city.nameTr} Influencer&apos;ları
                </Link>
              ))}
        </div>
      </section>
    </div>
  );
}
