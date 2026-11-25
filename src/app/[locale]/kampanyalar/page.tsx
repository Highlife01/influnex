import type { Metadata } from "next";
import Link from "next/link";
import { marketplaceStore } from "@/lib/data/marketplaceStore";
import {
  calculateCommissionBreakdown,
  formatMinorUnits,
} from "@/lib/finance/commission";
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
        ? "Açık Influencer ve UGC Reklam Kampanyaları"
        : "Open Influencer & UGC Advertising Campaigns",
    description:
      locale === "tr"
        ? "Markaların yayınladığı açık reklam kampanyalarını inceleyin, ücretsiz teklif verin veya markanız için ücretsiz kampanya ilanı oluşturun."
        : "Browse open brand campaigns, submit free creator proposals, or launch a campaign for your brand for free.",
    alternates: buildHreflangAlternates(
      "/tr/kampanyalar",
      "/en/campaigns",
      locale
    ),
  };
}

export default async function CampaignsPage() {
  const campaigns = marketplaceStore.getOpenCampaigns();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Açık Reklam Kampanyaları
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Kampanya oluşturmak ve teklif vermek tamamen ücretsizdir. Teklif
            kabul edildiğinde otomatik olarak güvenli sipariş oluşturulur.
          </p>
        </div>
        <Link
          href="/tr/panel?tab=campaigns"
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-xs hover:bg-indigo-700"
        >
          + Ücretsiz Kampanya Oluştur
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {campaigns.map((cmp) => {
          const breakdown = calculateCommissionBreakdown(
            cmp.budgetMinorUnits,
            cmp.currency
          );
          return (
            <article
              key={cmp.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-indigo-700">
                    {cmp.brandName}
                  </span>
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 font-bold text-emerald-800">
                    Bütçe: {formatMinorUnits(cmp.budgetMinorUnits)}
                  </span>
                </div>
                <h2 className="mt-2.5 text-lg font-bold text-slate-900">
                  {cmp.title}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {cmp.description}
                </p>

                <dl className="mt-4 space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                  <div>
                    <dt className="inline font-semibold">İstenen Format: </dt>
                    <dd className="inline">{cmp.requestedContentType}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">Hedef Kitle: </dt>
                    <dd className="inline">{cmp.targetAudience}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">Kullanım Hakları: </dt>
                    <dd className="inline">{cmp.usageRights}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">
                      Tahmini Influencer Hakedişi (%85):{" "}
                    </dt>
                    <dd className="inline font-bold text-emerald-800">
                      {formatMinorUnits(breakdown.creatorNetPayoutMinorUnits)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                <span className="text-slate-500">
                  Teslim: {cmp.deliveryDeadline} • {cmp.proposalsCount} Teklif
                </span>
                <Link
                  href={`/tr/panel?tab=proposals&campaignId=${cmp.id}`}
                  className="rounded-xl bg-indigo-950 px-4 py-2 font-bold text-white hover:bg-indigo-700"
                >
                  Teklif Ver
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
