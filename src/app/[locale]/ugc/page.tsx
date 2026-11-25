import type { Metadata } from "next";
import Link from "next/link";
import { CreatorCard } from "@/components/CreatorCard";
import { INITIAL_CITIES } from "@/lib/data/catalog";
import { marketplaceStore } from "@/lib/data/marketplaceStore";
import { normalizeLocale } from "@/lib/i18n/dictionary";
import { buildHreflangAlternates } from "@/lib/seo/routeRegistry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  return {
    title:
      locale === "tr"
        ? "UGC İçerik Üreticileri ve Reklam Videosu Hizmetleri"
        : "UGC Content Creators & Ad Video Services",
    description:
      locale === "tr"
        ? "Markanızın Meta, TikTok ve YouTube reklamlarında kullanabileceği yüksek dönüşümlü UGC ürün ve reklam videoları üreten içerik üreticileri."
        : "Hire verified UGC creators for high-converting Meta, TikTok, and YouTube ad creatives.",
    alternates: buildHreflangAlternates("/tr/ugc", "/en/ugc-creators", locale),
  };
}

export default async function UgcDirectoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const { items: ugcCreators } = marketplaceStore.searchCreators({
    ugcOnly: true,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-slate-900">
        {locale === "tr"
          ? "UGC İçerik Üreticileri ve Reklam Videosu Hizmetleri"
          : "UGC Content Creators & Ad Video Services"}
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-600">
        Markanızın kendi sosyal medya hesaplarında ve ücretli reklamlarında
        (Meta Ads, TikTok Ads) kullanabileceği doğal kullanıcı deneyimi
        videoları.
      </p>

      <div className="mt-5 flex flex-wrap gap-2 text-xs">
        {INITIAL_CITIES.map((city) => (
          <Link
            key={city.id}
            href={`/tr/ugc/${city.slug}`}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 hover:border-indigo-400"
          >
            {city.nameTr} UGC Üreticileri
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ugcCreators.map((c) => (
          <CreatorCard key={c.id} creator={c} locale={locale} />
        ))}
      </div>
    </div>
  );
}
