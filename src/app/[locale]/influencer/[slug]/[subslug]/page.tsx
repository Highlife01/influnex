import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreatorCard } from "@/components/CreatorCard";
import {
  INITIAL_CATEGORIES,
  INITIAL_CITIES,
  PLATFORM_LABELS,
} from "@/lib/data/catalog";
import { marketplaceStore } from "@/lib/data/marketplaceStore";
import { normalizeLocale } from "@/lib/i18n/dictionary";
import { localizedPath } from "@/lib/i18n/paths";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
} from "@/lib/seo/jsonLd";
import { evaluateIndexQualityGate } from "@/lib/seo/qualityGate";
import { buildHreflangAlternates } from "@/lib/seo/routeRegistry";
import type { SupportedPlatform } from "@/lib/types/domain";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string; subslug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug, subslug } = await params;
  const locale = normalizeLocale(rawLocale);
  const city = INITIAL_CITIES.find((c) => c.slug === slug.toLowerCase());
  const category = INITIAL_CATEGORIES.find(
    (c) =>
      c.slugTr === subslug.toLowerCase() || c.slugEn === subslug.toLowerCase()
  );

  if (!city || !category) {
    return {
      title: "Sayfa Bulunamadı",
      robots: { index: false, follow: false },
    };
  }

  const { items } = marketplaceStore.searchCreators({
    citySlug: city.slug,
    categorySlug: category.slugTr,
  });

  const descriptionText = `${city.nameTr} bölgesindeki onaylı ${category.nameTr.toLowerCase()} influencer ve UGC içerik üreticilerini inceleyin. Gerçek etkileşim verileri ve %15 şeffaf komisyon modeliyle reklam iş birliği başlatın.`;

  const gate = evaluateIndexQualityGate({
    path: `/tr/influencer/${city.slug}/${category.slugTr}`,
    approvedCreatorCount: items.length,
    activeServiceCount: items.length,
    uniqueDescriptionText: descriptionText,
  });

  return {
    title: `${city.nameTr} ${category.nameTr} Influencer ve İçerik Üreticileri`,
    description: descriptionText,
    alternates: buildHreflangAlternates(
      `/tr/influencer/${city.slug}/${category.slugTr}`,
      `/en/creators/${city.slug}/${category.slugEn}`,
      locale
    ),
    robots: {
      index: gate.indexable,
      follow: true,
    },
  };
}

export default async function CityAndCategoryCombinationPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; subslug: string }>;
}) {
  const { locale: rawLocale, slug, subslug } = await params;
  const locale = normalizeLocale(rawLocale);
  const basePath = localizedPath(locale, "creators");

  const city = INITIAL_CITIES.find((c) => c.slug === slug.toLowerCase());
  const category = INITIAL_CATEGORIES.find(
    (c) =>
      c.slugTr === subslug.toLowerCase() || c.slugEn === subslug.toLowerCase()
  );

  let platformKey: SupportedPlatform | undefined;
  for (const [k, v] of Object.entries(PLATFORM_LABELS)) {
    if (v.slug === subslug.toLowerCase()) {
      platformKey = k as SupportedPlatform;
    }
  }

  if (!city || (!category && !platformKey)) {
    notFound();
  }

  const subTitle = category
    ? locale === "tr"
      ? category.nameTr
      : category.nameEn
    : PLATFORM_LABELS[platformKey!].nameTr;

  const { items: creators } = marketplaceStore.searchCreators({
    citySlug: city.slug,
    categorySlug: category?.slugTr,
    platform: platformKey,
  });

  const heading = `${city.nameTr} ${subTitle} Influencer ve İçerik Üreticileri`;
  const description = `${city.nameTr} ilinde ${subTitle.toLowerCase()} alanında içerik üreten örnek vitrin influencer ve UGC profilleri. Tüm hizmet fiyatları ve veri doğrulama kaynakları şeffafça listelenmektedir.`;

  const pagePath = `${basePath}/${city.slug}/${subslug}`;
  const gate = evaluateIndexQualityGate({
    path: pagePath,
    approvedCreatorCount: creators.length,
    activeServiceCount: creators.length,
    uniqueDescriptionText: `${heading} - ${description}`,
  });

  const collectionJsonLd = buildCollectionPageJsonLd({
    title: heading,
    description,
    path: pagePath,
    creators,
    locale,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "InfluNex", path: `/${locale}` },
    {
      name: locale === "tr" ? "Influencer Keşfet" : "Explore Creators",
      path: basePath,
    },
    { name: city.nameTr, path: `${basePath}/${city.slug}` },
    { name: subTitle, path: pagePath },
  ]);

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

      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
          <Link href={`/${locale}`} className="hover:text-indigo-600">
            InfluNex
          </Link>{" "}
          /{" "}
          <Link href={basePath} className="hover:text-indigo-600">
            {locale === "tr" ? "Influencer Keşfet" : "Explore Creators"}
          </Link>{" "}
          /{" "}
          <Link
            href={`${basePath}/${city.slug}`}
            className="hover:text-indigo-600"
          >
            {city.nameTr}
          </Link>{" "}
          / <span className="font-semibold text-slate-800">{subTitle}</span>
        </nav>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            gate.indexable
              ? "bg-emerald-50 text-emerald-800"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          Index Quality Gate: {gate.robotsDirective} ({creators.length} Örnek
          Vitrin Profili)
        </span>
      </div>

      <h1 className="mt-4 text-3xl font-extrabold text-slate-900">{heading}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
        {description}
      </p>

      {creators.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((c) => (
            <CreatorCard key={c.id} creator={c} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
          <h2 className="text-base font-bold text-slate-900">
            {city.nameTr} {subTitle} kategorisinde henüz 3 onaylı profil eşiğine
            ulaşılmadı
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Kalite kontrol kurallarımız gereği bu sayfa şu anda{" "}
            <code>noindex, follow</code> olarak işaretlenmiştir ve sahte veri
            üretilmez.
          </p>
        </div>
      )}

      {/* Related Internal Links */}
      <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-sm font-bold text-slate-900">
          Benzer Şehir ve Kategori Sayfaları
        </h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {INITIAL_CITIES.filter((c) => c.slug !== city.slug).map((other) => (
            <Link
              key={other.id}
              href={`${basePath}/${other.slug}/${subslug}`}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:border-indigo-400"
            >
              {other.nameTr} {subTitle} Influencer&apos;ları
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
