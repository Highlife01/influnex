import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CreatorCard } from "@/components/CreatorCard";
import { INITIAL_CITIES } from "@/lib/data/catalog";
import { marketplaceStore } from "@/lib/data/marketplaceStore";
import { normalizeLocale } from "@/lib/i18n/dictionary";
import { evaluateIndexQualityGate } from "@/lib/seo/qualityGate";
import { buildCanonicalUrl } from "@/lib/seo/routeRegistry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; city: string }>;
}): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = INITIAL_CITIES.find((c) => c.slug === citySlug.toLowerCase());
  if (!city) {
    return { title: "Bulunamadı", robots: { index: false, follow: false } };
  }
  const { items } = marketplaceStore.searchCreators({
    citySlug: city.slug,
    ugcOnly: true,
  });
  const desc = `${city.nameTr}'daki UGC içerik üreticilerini keşfedin. E-ticaret ve marka reklamlarınız için kullanım haklarıyla teslim edilen UGC ürün videoları.`;
  const gate = evaluateIndexQualityGate({
    path: `/tr/ugc/${city.slug}`,
    approvedCreatorCount: items.length,
    activeServiceCount: items.length,
    uniqueDescriptionText: desc,
  });
  return {
    title: `${city.nameTr} UGC İçerik Üreticileri`,
    description: desc,
    alternates: { canonical: buildCanonicalUrl(`/tr/ugc/${city.slug}`) },
    robots: { index: gate.indexable, follow: true },
  };
}

export default async function UgcCityPage({
  params,
}: {
  params: Promise<{ locale: string; city: string }>;
}) {
  const { locale: rawLocale, city: citySlug } = await params;
  const locale = normalizeLocale(rawLocale);
  const city = INITIAL_CITIES.find((c) => c.slug === citySlug.toLowerCase());
  if (!city) notFound();

  const { items: creators } = marketplaceStore.searchCreators({
    citySlug: city.slug,
    ugcOnly: true,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-slate-900">
        {city.nameTr} UGC İçerik Üreticileri
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-600">
        {city.nameTr} merkezli UGC ürün ve reklam videosu üreticileri.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {creators.map((c) => (
          <CreatorCard key={c.id} creator={c} locale={locale} />
        ))}
      </div>
    </div>
  );
}
