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
        ? "Örnek Influencer ve UGC Reklam Kampanyaları"
        : "Sample Influencer & UGC Advertising Campaigns",
    description:
      locale === "tr"
        ? "Markaların yayınladığı örnek reklam kampanyalarını, kapsam ve kullanım haklarını inceleyin; ücretsiz brief hazırlayın veya erken erişim ön kaydı oluşturun."
        : "Browse sample brand campaigns, usage rights, and commission breakdowns, or pre-register for free.",
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
      <div
        role="note"
        className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950"
      >
        <strong className="font-bold">
          Erken Erişim Beta & Örnek Kampanya Vitrini:
        </strong>{" "}
        Aşağıdaki kampanya ilanları; bütçe, kullanım hakları, %15 komisyon / %85
        üretici payı ve teklif akışını göstermek amacıyla hazırlanmış örnek
        ilanlardır.
      </div>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Örnek Reklam Kampanyaları ve Brief Yapısı
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Kampanya oluşturmak ve teklif vermek tamamen ücretsizdir. %15
            platform komisyonu yalnızca tamamlanan siparişin vergi hariç brüt
            tutarı üzerinden hesaplanır.
          </p>
        </div>
        <Link
          href="/tr/kayit?role=ADVERTISER"
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-xs hover:bg-indigo-700"
        >
          + Marka Olarak Beta Ön Kaydı Oluştur
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
                  <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 font-bold text-amber-900">
                    Örnek Kampanya • {cmp.brandName}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 font-bold text-slate-900">
                    Brüt Bütçe: {formatMinorUnits(cmp.budgetMinorUnits)}
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
                  <div className="border-t border-slate-200 pt-1.5">
                    <dt className="inline font-semibold">
                      %15 Platform Komisyonu:{" "}
                    </dt>
                    <dd className="inline font-bold text-indigo-800">
                      {formatMinorUnits(
                        breakdown.platformCommissionMinorUnits
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">
                      %85 Üretici Brüt Payı (Vergi/Stopaj Öncesi):{" "}
                    </dt>
                    <dd className="inline font-bold text-emerald-800">
                      {formatMinorUnits(breakdown.creatorNetPayoutMinorUnits)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                <span className="text-slate-500">
                  Hedef Teslim: {cmp.deliveryDeadline}
                </span>
                <Link
                  href={`/tr/kayit?role=CREATOR&campaignId=${cmp.id}`}
                  className="rounded-xl bg-indigo-950 px-4 py-2 font-bold text-white hover:bg-indigo-700"
                >
                  Üretici Ön Kaydı ile Başvur
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
