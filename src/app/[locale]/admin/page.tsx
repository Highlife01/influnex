import type { Metadata } from "next";
import Link from "next/link";
import { SUPER_ADMIN_EMAIL } from "@/lib/auth/roles";
import { INITIAL_CATEGORIES, INITIAL_CITIES } from "@/lib/data/catalog";
import { marketplaceStore } from "@/lib/data/marketplaceStore";
import {
  calculateCommissionBreakdown,
  formatMinorUnits,
} from "@/lib/finance/commission";
import {
  INFLUNEX_COLLECTION_PREFIX,
  INFLUNEX_FIREBASE_PROJECT_ID,
  INFLUNEX_FIRESTORE_DATABASE_ID,
  INFLUNEX_HOSTING_SITE_ID,
  INFLUNEX_STORAGE_BUCKET,
} from "@/lib/firebase/isolation";
import { evaluateIndexQualityGate } from "@/lib/seo/qualityGate";
import { ThousandCreatorsCrmSection } from "@/components/dashboard/ThousandCreatorsCrmSection";

export const metadata: Metadata = {
  title: "Süperadmin, Muhasebe ve SEO & GEO Komuta Merkezi",
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  const { items: approvedCreators, total: totalApprovedCreators } =
    marketplaceStore.searchCreators({
      limit: 1000,
    });
  const openCampaigns = marketplaceStore.getOpenCampaigns();

  const totalOpenBudgetMinor = openCampaigns.reduce(
    (sum, c) => sum + c.budgetMinorUnits,
    0
  );
  const sampleLedgerBreakdown = calculateCommissionBreakdown(
    totalOpenBudgetMinor,
    "TRY"
  );

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
      {/* SuperAdmin Executive Banner */}
      <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-extrabold text-emerald-300">
                Süperadmin: {SUPER_ADMIN_EMAIL}
              </span>
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-200">
                RBAC & Custom Claims (ADMIN)
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
              InfluNex Süperadmin, Muhasebe ve SEO & GEO Merkezi
            </h1>
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-300 sm:text-sm">
              4 katmanlı veri izolasyonu (<code>{INFLUNEX_FIRESTORE_DATABASE_ID}</code>),
              1500 BPS / 8500 BPS kuruş hassasiyetli muhasebe defteri, tekil{" "}
              <code>bankTransactionRef</code> dekont doğrulaması ve programatik
              SEO/GEO kalite kapısı.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/tr/yonetim"
              className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-slate-950 shadow-sm hover:bg-emerald-400"
            >
              Canlı Süperadmin Kokpitini Aç →
            </Link>
            <Link
              href="/tr/panel"
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20"
            >
              15 Durumlu Sipariş Simülatörü →
            </Link>
          </div>
        </div>

        {/* Executive KPI Metrics */}
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <span className="text-[11px] text-slate-300">Süperadmin Yetkili</span>
            <p className="mt-1 truncate text-sm font-black text-emerald-300">
              {SUPER_ADMIN_EMAIL}
            </p>
            <span className="mt-1 block text-[10px] text-slate-400">
              Tam Yetki (Firestore + Storage)
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <span className="text-[11px] text-slate-300">Onaylı Influencer</span>
            <p className="mt-1 text-2xl font-black text-white">
              {totalApprovedCreators.toLocaleString("tr-TR")}
            </p>
            <span className="mt-1 block text-[10px] text-emerald-300">
              1.000 Profil & İzole E-Posta
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <span className="text-[11px] text-slate-300">Açık Kampanya Hacmi</span>
            <p className="mt-1 text-xl font-black text-white">
              {formatMinorUnits(sampleLedgerBreakdown.grossAmountMinorUnits)}
            </p>
            <span className="mt-1 block text-[10px] text-indigo-300">
              {openCampaigns.length} Aktif Brief
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <span className="text-[11px] text-slate-300">%85 Üretici Payı</span>
            <p className="mt-1 text-xl font-black text-emerald-400">
              {formatMinorUnits(
                sampleLedgerBreakdown.creatorNetPayoutMinorUnits
              )}
            </p>
            <span className="mt-1 block text-[10px] text-slate-300">
              8500 BPS Hakediş
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <span className="text-[11px] text-slate-300">
              İndekslenebilir URL
            </span>
            <p className="mt-1 text-2xl font-black text-emerald-400">
              {indexableCount}
            </p>
            <span className="mt-1 block text-[10px] text-slate-300">
              index, follow
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <span className="text-[11px] text-slate-300">
              Kalite Korumalı URL
            </span>
            <p className="mt-1 text-2xl font-black text-amber-300">
              {noindexCount}
            </p>
            <span className="mt-1 block text-[10px] text-slate-300">
              noindex, follow (Thin Content Önleme)
            </span>
          </div>
        </div>
      </div>

      {/* 1,000 Influencer Emails & Profiles SuperAdmin CRM Section */}
      <div className="mt-8">
        <ThousandCreatorsCrmSection locale="tr" />
      </div>

      {/* 4-Layer Data Isolation Health Card */}
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Çoklu Proje Güvenlik & Veri İzolasyonu
        </span>
        <h2 className="mt-1 text-lg font-black text-slate-900">
          4 Katmanlı Firebase & Cloud Run İzolasyon Durumu
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <span className="font-bold text-slate-500">1. GCP Proje & Hosting</span>
            <p className="mt-1 font-mono font-extrabold text-slate-900">
              {INFLUNEX_FIREBASE_PROJECT_ID} / {INFLUNEX_HOSTING_SITE_ID}
            </p>
            <span className="mt-1 block text-emerald-700">
              ✓ İzole Hosting Target
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <span className="font-bold text-slate-500">2. Named Firestore DB</span>
            <p className="mt-1 font-mono font-extrabold text-slate-900">
              {INFLUNEX_FIRESTORE_DATABASE_ID}
            </p>
            <span className="mt-1 block text-emerald-700">
              ✓ (default) DB&apos;den Tamamen Ayrı
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <span className="font-bold text-slate-500">3. Koleksiyon Öneki</span>
            <p className="mt-1 font-mono font-extrabold text-slate-900">
              {INFLUNEX_COLLECTION_PREFIX}*
            </p>
            <span className="mt-1 block text-emerald-700">
              ✓ Public / Private PII Ayrımı Aktif
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <span className="font-bold text-slate-500">4. İzole Storage Bucket</span>
            <p className="mt-1 font-mono font-extrabold text-slate-900">
              {INFLUNEX_STORAGE_BUCKET}
            </p>
            <span className="mt-1 block text-emerald-700">
              ✓ /influnex/public & /private
            </span>
          </div>
        </div>
      </section>

      {/* SEO & GEO Quality Gate Audit Table */}
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
        <h2 className="text-lg font-black text-slate-900">
          SEO ve GEO Programatik Sayfa Kalite Kontrol Merkezi (Index Quality Gate)
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          En az 3 onaylı influencer profili ve aktif hizmet verisi bulunmayan
          programatik sayfalar otomatik olarak <code>noindex, follow</code>{" "}
          alır ve sitemap&apos;e dahil edilmez.
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
