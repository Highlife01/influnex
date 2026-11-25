import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICE_TEMPLATES } from "@/lib/data/catalog";
import { marketplaceStore } from "@/lib/data/marketplaceStore";
import {
  calculateCommissionBreakdown,
  formatMinorUnits,
} from "@/lib/finance/commission";
import { buildServicePageJsonLd } from "@/lib/seo/jsonLd";
import { buildCanonicalUrl } from "@/lib/seo/routeRegistry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tpl = SERVICE_TEMPLATES.find((s) => s.slug === slug.toLowerCase());
  if (!tpl) {
    return { title: "Bulunamadı", robots: { index: false, follow: false } };
  }
  return {
    title: `${tpl.nameTr} Reklam Hizmeti ve Fiyatları`,
    description: `${tpl.nameTr}: ${tpl.descriptionTr} Örnek influencer hizmet paketlerini karşılaştırın ve %15 şeffaf komisyon yapısını inceleyin.`,
    alternates: {
      canonical: buildCanonicalUrl(`/tr/hizmetler/${tpl.slug}`),
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const tpl = SERVICE_TEMPLATES.find((s) => s.slug === slug.toLowerCase());
  if (!tpl) notFound();

  const matchingServices = marketplaceStore.getServicesByTypeSlug(tpl.slug);
  const serviceJsonLd = buildServicePageJsonLd({
    title: `${tpl.nameTr} Reklam Hizmeti`,
    description: tpl.descriptionTr,
    path: `/tr/hizmetler/${tpl.slug}`,
    services: matchingServices,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800">
        {tpl.platform} Hizmet Kategorisi • Örnek Vitrin Paketleri
      </span>
      <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
        {tpl.nameTr} Reklam Hizmetleri ve Fiyatları
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-600">
        {tpl.descriptionTr}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {matchingServices.map((srv) => {
          const breakdown = calculateCommissionBreakdown(
            srv.priceMinorUnits,
            srv.currency
          );
          return (
            <article
              key={srv.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs">
                <Link
                  href={`/tr/influencer/${srv.creatorUsername}`}
                  className="font-bold text-indigo-600 hover:underline"
                >
                  @{srv.creatorUsername} (Örnek Profil)
                </Link>
                <span className="text-slate-500">
                  Teslim: {srv.deliveryDays} Gün • {srv.revisionCount} Revizyon
                </span>
              </div>
              <h2 className="mt-2 text-lg font-bold text-slate-900">
                {srv.titleTr}
              </h2>
              <p className="mt-1.5 text-xs text-slate-600">
                {srv.descriptionTr}
              </p>

              {/* Fixed Unambiguous 3-Column Financial Breakdown (Audit P0 Item 4) */}
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <div>
                  <span className="block text-[11px] font-medium text-slate-500">
                    Toplam Hizmet Bedeli (Brüt)
                  </span>
                  <strong className="mt-0.5 block text-sm font-extrabold text-slate-900">
                    {formatMinorUnits(breakdown.grossAmountMinorUnits)}
                  </strong>
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-indigo-700">
                    Platform Komisyonu (%15)
                  </span>
                  <strong className="mt-0.5 block text-sm font-bold text-indigo-900">
                    {formatMinorUnits(
                      breakdown.platformCommissionMinorUnits
                    )}
                  </strong>
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-emerald-700">
                    Üretici Brüt Payı (%85)
                  </span>
                  <strong className="mt-0.5 block text-sm font-extrabold text-emerald-800">
                    {formatMinorUnits(breakdown.creatorNetPayoutMinorUnits)}
                  </strong>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-[11px] text-slate-500">
                  Vergi/stopaj öncesi örnek brüt hakediş dökümü
                </span>
                <Link
                  href={`/tr/influencer/${srv.creatorUsername}`}
                  className="rounded-xl bg-indigo-950 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Profili ve Kullanım Haklarını Gör →
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
