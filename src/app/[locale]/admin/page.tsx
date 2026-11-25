import type { Metadata } from "next";
import { INITIAL_CATEGORIES, INITIAL_CITIES } from "@/lib/data/catalog";
import { marketplaceStore } from "@/lib/data/marketplaceStore";
import { evaluateIndexQualityGate } from "@/lib/seo/qualityGate";

export const metadata: Metadata = {
  title: "Yönetici, Muhasebe ve SEO & GEO Merkezi",
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  const { items: approvedCreators } = marketplaceStore.searchCreators({
    limit: 48,
  });
  const openCampaigns = marketplaceStore.getOpenCampaigns();

  // Evaluate Programmatic SEO Quality Gate across City x Category pages
  const programmaticSamplePages = INITIAL_CITIES.slice(0, 4).flatMap((city) =>
    INITIAL_CATEGORIES.slice(0, 3).map((cat) => {
      const { items } = marketplaceStore.searchCreators({
        citySlug: city.slug,
        categorySlug: cat.slugTr,
      });
      return {
        label: `${city.nameTr} × ${cat.nameTr}`,
        gate: evaluateIndexQualityGate({
          path: `/tr/influencer/${city.slug}/${cat.slugTr}`,
          approvedCreatorCount: items.length,
          activeServiceCount: items.length,
          uniqueDescriptionText: `${city.nameTr} ${cat.nameTr} influencer ve UGC içerik üreticileri listesi, doğrulanmış etkileşim oranları ve hizmet fiyatları.`,
        }),
        count: items.length,
      };
    })
  );

  const indexableCount = programmaticSamplePages.filter(
    (p) => p.gate.indexable
  ).length;
  const noindexCount = programmaticSamplePages.length - indexableCount;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="rounded-full bg-indigo-950 px-3 py-1 text-xs font-bold text-white">
            RBAC & Custom Claims Korumalı Yönetici Merkezi
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
            InfluNex Yönetici, Muhasebe ve SEO & GEO Paneli
          </h1>
        </div>
      </div>

      {/* Executive KPI Metrics (Section 31) */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <span className="text-xs text-slate-500">Onaylı Influencer</span>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {approvedCreators.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <span className="text-xs text-slate-500">Açık Kampanyalar</span>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {openCampaigns.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <span className="text-xs text-slate-500">
            Programatik İndekslenebilir URL
          </span>
          <p className="mt-1 text-2xl font-extrabold text-emerald-700">
            {indexableCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <span className="text-xs text-slate-500">
            Kalite Eşiği Altı (Noindex) URL
          </span>
          <p className="mt-1 text-2xl font-extrabold text-amber-700">
            {noindexCount}
          </p>
        </div>
      </div>

      {/* SEO & GEO Quality Gate Audit Table (Section 27) */}
      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">
          SEO ve GEO Programatik Sayfa Kalite Kontrol Merkezi (Index Quality Gate)
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          En az 3 onaylı influencer profili ve aktif hizmet verisi bulunmayan
          programatik sayfalar otomatik olarak <code>noindex, follow</code>{" "}
          alır ve sitemap&apos;e dahil edilmez.Google Search Console API
          kimlik bilgileri (<code>GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL</code>)
          tanımlanmadan sahte GSC tıklama/gösterim verisi üretilmez.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 uppercase text-slate-500">
                <th className="py-2.5">Programatik Kombinasyon</th>
                <th className="py-2.5">URL</th>
                <th className="py-2.5">Onaylı Profil</th>
                <th className="py-2.5">Kalite Skoru</th>
                <th className="py-2.5">Robots & Sitemap Durumu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {programmaticSamplePages.map((row) => (
                <tr key={row.gate.path}>
                  <td className="py-3 font-bold text-slate-900">{row.label}</td>
                  <td className="py-3 font-mono text-slate-600">
                    {row.gate.path}
                  </td>
                  <td className="py-3 font-semibold">{row.count}</td>
                  <td className="py-3">{row.gate.qualityScore}/100</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 font-bold ${
                        row.gate.indexable
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {row.gate.robotsDirective}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
