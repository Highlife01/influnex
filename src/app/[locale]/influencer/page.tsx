import type { Metadata } from "next";
import Link from "next/link";
import { CreatorCard } from "@/components/CreatorCard";
import {
  INITIAL_CATEGORIES,
  INITIAL_CITIES,
  PLATFORM_LABELS,
} from "@/lib/data/catalog";
import {
  type CreatorSortOption,
  marketplaceStore,
} from "@/lib/data/marketplaceStore";
import { normalizeLocale } from "@/lib/i18n/dictionary";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
} from "@/lib/seo/jsonLd";
import { buildHreflangAlternates } from "@/lib/seo/routeRegistry";
import type { SupportedPlatform } from "@/lib/types/domain";

const PAGE_SIZE = 24;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const alternates = buildHreflangAlternates(
    "/tr/influencer",
    "/en/creators",
    locale
  );

  return {
    title:
      locale === "tr"
        ? "1.000+ Influencer Keşfet — Instagram, TikTok, YouTube ve UGC Üreticileri"
        : "Explore 1,000+ Influencers & UGC Content Creators",
    description:
      locale === "tr"
        ? "Türkiye'deki 1.000 onaylı Instagram, TikTok, YouTube influencer'ını ve UGC içerik üreticisini şehir, kategori, bütçe ve etkileşim oranına göre filtreleyin."
        : "Filter 1,000 verified Instagram, TikTok, YouTube influencers and UGC creators by city, category, budget, and engagement rate.",
    alternates,
  };
}

export default async function InfluencerDiscoveryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const query = await searchParams;

  const citySlug = typeof query.city === "string" ? query.city : undefined;
  const categorySlug =
    typeof query.category === "string" ? query.category : undefined;
  const platform =
    typeof query.platform === "string"
      ? (query.platform.toUpperCase() as SupportedPlatform)
      : undefined;
  const queryText = typeof query.q === "string" ? query.q : undefined;
  const ugcOnly = query.ugc === "true";
  const verifiedOnly = query.verified === "true";
  const sortBy =
    typeof query.sort === "string"
      ? (query.sort as CreatorSortOption)
      : "RECOMMENDED";
  const rawPage =
    typeof query.page === "string" ? parseInt(query.page, 10) : 1;
  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const offset = (currentPage - 1) * PAGE_SIZE;

  const { items: creators, total } = marketplaceStore.searchCreators({
    citySlug,
    categorySlug,
    platform,
    queryText,
    ugcOnly,
    verifiedOnly,
    sortBy,
    limit: PAGE_SIZE,
    offset,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const collectionJsonLd = buildCollectionPageJsonLd({
    title: "Influencer ve UGC İçerik Üreticileri | InfluNex",
    description:
      "Şehir, kategori, platform ve bütçeye göre filtrelenebilir 1.000 onaylı influencer listesi.",
    path: locale === "tr" ? "/tr/influencer" : "/en/creators",
    creators,
    locale,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "InfluNex", path: `/${locale}` },
    {
      name: locale === "tr" ? "Influencer Keşfet" : "Explore Creators",
      path: locale === "tr" ? "/tr/influencer" : "/en/creators",
    },
  ]);

  const basePath = locale === "tr" ? "/tr/influencer" : "/en/creators";

  function buildPageHref(targetPage: number): string {
    const sp = new URLSearchParams();
    if (citySlug) sp.set("city", citySlug);
    if (categorySlug) sp.set("category", categorySlug);
    if (platform) sp.set("platform", platform);
    if (queryText) sp.set("q", queryText);
    if (ugcOnly) sp.set("ugc", "true");
    if (verifiedOnly) sp.set("verified", "true");
    if (sortBy !== "RECOMMENDED") sp.set("sort", sortBy);
    if (targetPage > 1) sp.set("page", String(targetPage));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
        <Link href={`/${locale}`} className="hover:text-indigo-600">
          InfluNex
        </Link>{" "}
        / <span className="font-semibold text-slate-800">Influencer Keşfet</span>
      </nav>

      <div className="mt-4">
        <h1 className="text-3xl font-extrabold text-slate-900">
          {locale === "tr"
            ? "Influencer ve UGC İçerik Üreticileri"
            : "Influencers & UGC Content Creators"}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
          Markanıza uygun içerik üreticilerini şehir, kategori, platform ve
          bütçeye göre kolayca filtreleyin.
        </p>
      </div>

      {/* Fast Server-Rendered Search & Sort Bar */}
      <form
        method="GET"
        action={basePath}
        className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs sm:grid-cols-12"
      >
        <div className="sm:col-span-6">
          <label htmlFor="dir-q" className="sr-only">
            İsim, şehir veya uzmanlık ara
          </label>
          <input
            id="dir-q"
            name="q"
            type="search"
            defaultValue={queryText || ""}
            placeholder="İsim, şehir veya uzmanlık ara (Örn: Adana otomotiv, İstanbul moda, teknoloji)..."
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs"
          />
        </div>
        <div className="sm:col-span-3">
          <label htmlFor="dir-sort" className="sr-only">
            Sıralama
          </label>
          <select
            id="dir-sort"
            name="sort"
            defaultValue={sortBy}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold"
          >
            <option value="RECOMMENDED">Önerilen Sıralama (Kalite & ER)</option>
            <option value="FOLLOWERS_DESC">Takipçi Sayısı (Yüksekten Düşüğe)</option>
            <option value="PRICE_ASC">Başlangıç Fiyatı (Düşükten Yükseğe)</option>
            <option value="PRICE_DESC">Başlangıç Fiyatı (Yüksekten Düşüğe)</option>
            <option value="RATING_DESC">Değerlendirme Puanı (En Yüksek)</option>
          </select>
        </div>
        <div className="flex gap-2 sm:col-span-3">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
          >
            Filtrele ({total})
          </button>
          <Link
            href={basePath}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Sıfırla
          </Link>
        </div>
      </form>

      {/* Programmatic SEO Quick Filter Pills (Real HTML Anchor Links) */}
      <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-700">Platformlar:</span>
          <Link
            href={basePath}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:border-indigo-400"
          >
            Tümü ({total})
          </Link>
          {Object.entries(PLATFORM_LABELS).map(([key, val]) => (
            <Link
              key={key}
              href={`${basePath}/${val.slug}`}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:border-indigo-400"
            >
              {val.nameTr}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-700">Şehirler:</span>
          {INITIAL_CITIES.map((city) => (
            <Link
              key={city.id}
              href={`${basePath}/${city.slug}`}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:border-indigo-400"
            >
              {city.nameTr}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-700">Kategoriler:</span>
          {INITIAL_CATEGORIES.slice(0, 14).map((cat) => (
            <Link
              key={cat.id}
              href={`${basePath}/${locale === "tr" ? cat.slugTr : cat.slugEn}`}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:border-indigo-400"
            >
              {locale === "tr" ? cat.nameTr : cat.nameEn}
            </Link>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {creators.map((creator) => (
          <CreatorCard key={creator.id} creator={creator} locale={locale} />
        ))}
      </div>

      {/* Clean SEO-Friendly Pagination Bar across all 1,000 profiles */}
      {totalPages > 1 ? (
        <nav
          aria-label="Sayfalama"
          className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs"
        >
          <span className="font-semibold text-slate-600">
            Toplam <strong>{total.toLocaleString("tr-TR")}</strong> profilden{" "}
            <strong>
              {offset + 1}–{Math.min(offset + PAGE_SIZE, total)}
            </strong>{" "}
            arası gösteriliyor (Sayfa {currentPage} / {totalPages})
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            {currentPage > 1 ? (
              <Link
                href={buildPageHref(currentPage - 1)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50"
              >
                ← Önceki
              </Link>
            ) : null}

            {Array.from({ length: Math.min(7, totalPages) }, (_, idx) => {
              const pageNum =
                currentPage <= 4
                  ? idx + 1
                  : currentPage >= totalPages - 3
                    ? totalPages - 6 + idx
                    : currentPage - 3 + idx;
              if (pageNum < 1 || pageNum > totalPages) return null;
              return (
                <Link
                  key={pageNum}
                  href={buildPageHref(pageNum)}
                  className={`rounded-lg px-3 py-1.5 font-bold ${
                    pageNum === currentPage
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}

            {currentPage < totalPages ? (
              <Link
                href={buildPageHref(currentPage + 1)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50"
              >
                Sonraki →
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
