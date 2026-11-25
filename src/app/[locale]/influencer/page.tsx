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
        ? "Influencer Keşfet — Instagram, TikTok, YouTube ve UGC Üreticileri"
        : "Explore Influencers & UGC Content Creators",
    description:
      locale === "tr"
        ? "Türkiye'deki onaylı Instagram, TikTok, YouTube influencer'larını ve UGC içerik üreticilerini şehir, kategori, bütçe ve etkileşim oranına göre filtreleyin."
        : "Filter verified Instagram, TikTok, YouTube influencers and UGC creators by city, category, budget, and engagement rate.",
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
  const ugcOnly = query.ugc === "true";
  const verifiedOnly = query.verified === "true";
  const sortBy =
    typeof query.sort === "string"
      ? (query.sort as CreatorSortOption)
      : "RECOMMENDED";

  const { items: creators, total } = marketplaceStore.searchCreators({
    citySlug,
    categorySlug,
    platform,
    ugcOnly,
    verifiedOnly,
    sortBy,
  });

  const collectionJsonLd = buildCollectionPageJsonLd({
    title: "Influencer ve UGC İçerik Üreticileri | InfluNex",
    description:
      "Şehir, kategori, platform ve bütçeye göre filtrelenebilir onaylı influencer listesi.",
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
            ? "Influencer ve UGC İçerik Üreticilerini Keşfedin"
            : "Discover Influencers & UGC Content Creators"}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Sıralama algoritmamız ücretli öne çıkarma içermez; kategori uygunluğu,
          gerçek etkileşim oranı, doğrulama kaynağı ve tamamlanan iş birliği
          kalitesini esas alır.
        </p>
      </div>

      {/* Programmatic SEO Quick Filter Pills (Real HTML Anchor Links) */}
      <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
          {INITIAL_CATEGORIES.slice(0, 12).map((cat) => (
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
    </div>
  );
}
