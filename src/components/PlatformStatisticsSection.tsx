"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  Crown,
  Layers,
  Lock,
  Sparkles,
  TrendingUp,
  Video,
  Zap,
} from "lucide-react";
import {
  calculateCommissionBreakdown,
  formatMinorUnits,
} from "@/lib/finance/commission";
import type { SupportedLocale } from "@/lib/types/domain";

interface FormatBenchmark {
  id: string;
  platform: "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "UGC";
  titleTr: string;
  titleEn: string;
  avgErBenchmark: string;
  deliveryWindowTr: string;
  deliveryWindowEn: string;
  usageScopeTr: string;
  usageScopeEn: string;
  referenceGrossTl: number;
  completionTargetScore: number;
}

const FORMAT_BENCHMARKS: FormatBenchmark[] = [
  {
    id: "ig-reels",
    platform: "INSTAGRAM",
    titleTr: "Instagram Reels İş Birliği (30-60 sn Dikey Video)",
    titleEn: "Instagram Reels Collaboration (30-60s Vertical Video)",
    avgErBenchmark: "%3.8 – %6.4 ER",
    deliveryWindowTr: "3 – 5 İş Günü",
    deliveryWindowEn: "3 – 5 Business Days",
    usageScopeTr: "Organik Akış + #reklam Etiketli Sabit Yayım",
    usageScopeEn: "Organic Feed + #ad Disclosure Pin",
    referenceGrossTl: 8500,
    completionTargetScore: 96,
  },
  {
    id: "tiktok-spark",
    platform: "TIKTOK",
    titleTr: "TikTok Native Kreatif & Trend Kurgusu",
    titleEn: "TikTok Native Creative & Trend Cut",
    avgErBenchmark: "%5.2 – %9.1 ER",
    deliveryWindowTr: "2 – 4 İş Günü",
    deliveryWindowEn: "2 – 4 Business Days",
    usageScopeTr: "Organik TikTok + Opsiyonel Spark Ads Kodu",
    usageScopeEn: "Organic TikTok + Optional Spark Ads Code",
    referenceGrossTl: 7500,
    completionTargetScore: 95,
  },
  {
    id: "ugc-performance",
    platform: "UGC",
    titleTr: "UGC Performans Reklam Videosu (9:16 Ham + Kurgulu)",
    titleEn: "UGC Performance Ad Creative (9:16 Hook + Edited)",
    avgErBenchmark: "3 Kanca (Hook) Varyasyonu",
    deliveryWindowTr: "3 – 4 İş Günü",
    deliveryWindowEn: "3 – 4 Business Days",
    usageScopeTr: "Meta / TikTok Paid Ads Lisansı (30-90 Gün)",
    usageScopeEn: "Meta / TikTok Paid Ads License (30-90 Days)",
    referenceGrossTl: 5500,
    completionTargetScore: 98,
  },
  {
    id: "yt-integration",
    platform: "YOUTUBE",
    titleTr: "YouTube 60-90 sn Entegre Sponsorluk & Sabit Link",
    titleEn: "YouTube 60-90s Integrated Sponsorship & Pinned Link",
    avgErBenchmark: "%4.5 – %7.8 İzlenme Oranı",
    deliveryWindowTr: "5 – 7 İş Günü",
    deliveryWindowEn: "5 – 7 Business Days",
    usageScopeTr: "Kalıcı YouTube Video İçeriği + Açıklama Linki",
    usageScopeEn: "Permanent YouTube Video + Description Link",
    referenceGrossTl: 15000,
    completionTargetScore: 97,
  },
  {
    id: "ig-story-set",
    platform: "INSTAGRAM",
    titleTr: "Instagram 3'lü Hikâye (Story) + Link Sticker Paketi",
    titleEn: "Instagram 3-Frame Story + Link Sticker Bundle",
    avgErBenchmark: "%2.9 – %5.1 Tıklama/Etkileşim",
    deliveryWindowTr: "1 – 2 İş Günü",
    deliveryWindowEn: "1 – 2 Business Days",
    usageScopeTr: "24 Saat Hikâye + 7 Gün Öne Çıkanlar",
    usageScopeEn: "24h Story + 7-Day Highlight",
    referenceGrossTl: 4500,
    completionTargetScore: 99,
  },
];

export function PlatformStatisticsSection({
  locale,
  approvedCreatorCount,
  openCampaignCount,
}: {
  locale: SupportedLocale;
  approvedCreatorCount: number;
  openCampaignCount: number;
}) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("ALL");
  const [monthlyDeals, setMonthlyDeals] = useState<number>(6);
  const [avgPackagePriceTl, setAvgPackagePriceTl] = useState<number>(8500);

  const monthlyGrossMinor = Math.round(monthlyDeals * avgPackagePriceTl * 100);
  const monthlyBreakdown = calculateCommissionBreakdown(monthlyGrossMinor, "TRY");
  const yearlyCreatorPayoutMinor =
    monthlyBreakdown.creatorNetPayoutMinorUnits * 12;

  const filteredBenchmarks =
    selectedPlatform === "ALL"
      ? FORMAT_BENCHMARKS
      : FORMAT_BENCHMARKS.filter((b) => b.platform === selectedPlatform);

  return (
    <section
      id="profesyonel-istatistikler"
      className="border-y border-slate-200 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 py-16 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-3.5 py-1 text-xs font-bold text-indigo-300">
              <BarChart3 size={14} />
              {locale === "tr"
                ? "Şeffaf Pazaryeri İstatistikleri & Sektör Benchmarkları"
                : "Transparent Marketplace Analytics & Format Benchmarks"}
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              {locale === "tr"
                ? "Veriye Dayalı Influencer & UGC Ekonomi Motoru"
                : "Data-Driven Influencer & UGC Economy Engine"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
              {locale === "tr"
                ? "InfluNex; kuruş hassasiyetli (1500 BPS / 8500 BPS) finansal motoru, 15 durumlu sipariş koruma mimarisi ve 81 il × 25 kategori programatik veri ağıyla hem içerik üreticileri hem de markalar için tam şeffaflık sunar."
                : "Built on an integer minor-unit financial engine (1500 BPS / 8500 BPS), a 15-state order protection state machine, and programmatic taxonomy coverage across 81 cities and 25 categories."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-300">
              <CheckCircle2 size={14} />
              {locale === "tr"
                ? "Veri İzolasyonu: influnex-db"
                : "Data Isolation: influnex-db"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-violet-400/30 bg-violet-500/10 px-3.5 py-2 text-xs font-bold text-violet-200">
              <Lock size={14} />
              {locale === "tr"
                ? "Kuruş Hassasiyetli (Integer BPS) Muhasebe"
                : "Integer Minor-Unit Accounting"}
            </span>
          </div>
        </div>

        {/* 6 Core Platform Architecture & Marketplace Metrics */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              {locale === "tr" ? "Üretici Brüt Payı" : "Creator Gross Share"}
            </span>
            <p className="mt-2 text-3xl font-black text-white">%85</p>
            <p className="mt-1 text-xs text-slate-300">
              {locale === "tr"
                ? "8500 BPS • Sıfır abonelik/jeton"
                : "8500 BPS • Zero subscription"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
              {locale === "tr" ? "Platform Komisyonu" : "Platform Commission"}
            </span>
            <p className="mt-2 text-3xl font-black text-white">%15</p>
            <p className="mt-1 text-xs text-slate-300">
              {locale === "tr"
                ? "Yalnızca tamamlanan iş birliğinde"
                : "Only on completed collaborations"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300">
              {locale === "tr" ? "Kapsanan Şehir & Kategori" : "Cities & Categories"}
            </span>
            <p className="mt-2 text-3xl font-black text-white">81 × 25</p>
            <p className="mt-1 text-xs text-slate-300">
              {locale === "tr"
                ? "81 İl ve 25 Sektörel Uzmanlık"
                : "81 Cities & 25 Verticals"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              {locale === "tr" ? "Standart Hizmet Paketi" : "Service Templates"}
            </span>
            <p className="mt-2 text-3xl font-black text-white">12 Format</p>
            <p className="mt-1 text-xs text-slate-300">
              {locale === "tr"
                ? "Instagram, TikTok, YouTube & UGC"
                : "Instagram, TikTok, YouTube & UGC"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
              {locale === "tr" ? "Sipariş Güvence Adımı" : "Order Protection States"}
            </span>
            <p className="mt-2 text-3xl font-black text-white">15 Durum</p>
            <p className="mt-1 text-xs text-slate-300">
              {locale === "tr"
                ? "Snapshot, Bloke & #reklam Kontrolü"
                : "Snapshot, Escrow & #ad Check"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-300">
              {locale === "tr" ? "Aktif Vitrin & Brief" : "Active Showcase"}
            </span>
            <p className="mt-2 text-3xl font-black text-white">
              {approvedCreatorCount} / {openCampaignCount}
            </p>
            <p className="mt-1 text-xs text-slate-300">
              {locale === "tr"
                ? "Doğrulanmış Vitrin Profili & Brief"
                : "Showcase Profiles & Open Briefs"}
            </p>
          </div>
        </div>

        {/* Main 2-Column Area: Format Benchmark Table + Creator Earnings Simulator */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left 7 Cols: Interactive Format & Price/Payout Benchmark Matrix */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xs lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  {locale === "tr"
                    ? "Format & Teslimat Benchmark Tablosu"
                    : "Format & Delivery Benchmark Matrix"}
                </span>
                <h3 className="mt-1 text-xl font-black text-white">
                  {locale === "tr"
                    ? "Kanal Bazlı Referans Paket, Etkileşim ve %85 Hakediş Dağılımı"
                    : "Channel Reference Packages, Engagement & 85% Payout Breakdown"}
                </h3>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {["ALL", "INSTAGRAM", "TIKTOK", "YOUTUBE", "UGC"].map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setSelectedPlatform(plat)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      selectedPlatform === plat
                        ? "bg-indigo-500 text-white"
                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                  >
                    {plat === "ALL" ? (locale === "tr" ? "Tümü" : "All") : plat}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {filteredBenchmarks.map((item) => {
                const breakdown = calculateCommissionBreakdown(
                  item.referenceGrossTl * 100,
                  "TRY"
                );
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/75 p-4 transition hover:border-indigo-400/50"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[11px] font-bold text-indigo-300">
                            {item.platform}
                          </span>
                          <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                            {item.avgErBenchmark}
                          </span>
                          <span className="text-xs text-slate-400">
                            •{" "}
                            {locale === "tr"
                              ? item.deliveryWindowTr
                              : item.deliveryWindowEn}
                          </span>
                        </div>
                        <h4 className="mt-1.5 text-sm font-extrabold text-white">
                          {locale === "tr" ? item.titleTr : item.titleEn}
                        </h4>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {locale === "tr" ? item.usageScopeTr : item.usageScopeEn}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="block text-[11px] text-slate-400">
                          {locale === "tr" ? "Referans Brüt" : "Reference Gross"}
                        </span>
                        <strong className="text-base font-black text-white">
                          {formatMinorUnits(breakdown.grossAmountMinorUnits)}
                        </strong>
                        <span className="mt-0.5 block text-xs font-bold text-emerald-400">
                          %85 Pay:{" "}
                          {formatMinorUnits(breakdown.creatorNetPayoutMinorUnits)}
                        </span>
                      </div>
                    </div>

                    {/* Visual 85/15 Split Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>
                          %85 Üretici Hakedişi (
                          {formatMinorUnits(breakdown.creatorNetPayoutMinorUnits)})
                        </span>
                        <span>
                          %15 Platform Komisyonu (
                          {formatMinorUnits(
                            breakdown.platformCommissionMinorUnits
                          )}
                          )
                        </span>
                      </div>
                      <div className="mt-1 flex h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                          style={{ width: "85%" }}
                        />
                        <div
                          className="h-full bg-indigo-500"
                          style={{ width: "15%" }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 5 Cols: Creator-Magnetic Interactive Monthly/Annual Earnings Simulator */}
          <div className="flex flex-col justify-between rounded-3xl border border-emerald-400/30 bg-gradient-to-b from-emerald-950/60 via-slate-900 to-slate-900 p-6 shadow-xl lg:col-span-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                <Crown size={14} />
                {locale === "tr"
                  ? "Influencer & UGC Gelir Simülatörü"
                  : "Creator Earnings Simulator"}
              </div>
              <h3 className="mt-3 text-2xl font-black text-white">
                {locale === "tr"
                  ? "Influencer Olarak Ne Kadar Kazanırsın?"
                  : "Calculate Your 85% Creator Payout"}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                {locale === "tr"
                  ? "Aylık tamamladığın iş birliği sayısını ve ortalama paket fiyatını seç; abonelik veya gizli kesinti olmadan %85 brüt hakedişini anında gör."
                  : "Select your monthly completed collaborations and average package price to see your 85% gross payout with zero subscriptions."}
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <label htmlFor="sim-monthly-deals" className="text-slate-200">
                      {locale === "tr"
                        ? "Aylık Tamamlanan İş Birliği Sayısı"
                        : "Monthly Completed Collaborations"}
                    </label>
                    <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-sm font-black text-emerald-300">
                      {monthlyDeals} {locale === "tr" ? "İş Birliği / Ay" : "Deals / Mo"}
                    </span>
                  </div>
                  <input
                    id="sim-monthly-deals"
                    type="range"
                    min={1}
                    max={30}
                    step={1}
                    value={monthlyDeals}
                    onChange={(e) => setMonthlyDeals(Number(e.target.value))}
                    className="mt-2 w-full accent-emerald-400"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                    <span>1 İş</span>
                    <span>10 İş</span>
                    <span>20 İş</span>
                    <span>30 İş</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <label htmlFor="sim-avg-price" className="text-slate-200">
                      {locale === "tr"
                        ? "Ortalama Paket Fiyatı (Vergi Hariç Brüt)"
                        : "Average Package Price (Gross)"}
                    </label>
                    <span className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-sm font-black text-indigo-300">
                      {avgPackagePriceTl.toLocaleString("tr-TR")} TL
                    </span>
                  </div>
                  <input
                    id="sim-avg-price"
                    type="range"
                    min={1500}
                    max={50000}
                    step={500}
                    value={avgPackagePriceTl}
                    onChange={(e) => setAvgPackagePriceTl(Number(e.target.value))}
                    className="mt-2 w-full accent-indigo-400"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                    <span>1.500 TL</span>
                    <span>15.000 TL</span>
                    <span>30.000 TL</span>
                    <span>50.000 TL</span>
                  </div>
                </div>
              </div>

              {/* Output Box */}
              <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-slate-950/90 p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
                  <span className="text-slate-400">
                    {locale === "tr"
                      ? "Aylık Toplam İşlem Hacmi (Brüt)"
                      : "Monthly Gross Volume"}
                  </span>
                  <strong className="font-bold text-white">
                    {formatMinorUnits(monthlyBreakdown.grossAmountMinorUnits)}
                  </strong>
                </div>

                <div className="mt-3 flex items-center justify-between border-b border-white/10 pb-3 text-xs">
                  <span className="text-slate-400">
                    {locale === "tr"
                      ? "InfluNex %15 Hizmet Komisyonu"
                      : "InfluNex 15% Platform Commission"}
                  </span>
                  <strong className="font-bold text-indigo-300">
                    -{" "}
                    {formatMinorUnits(
                      monthlyBreakdown.platformCommissionMinorUnits
                    )}
                  </strong>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
                      {locale === "tr"
                        ? "Aylık %85 Influencer Hakedişin"
                        : "Your Monthly 85% Gross Payout"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {locale === "tr"
                        ? "Yasal vergi/stopaj öncesi brüt tutar"
                        : "Gross amount before statutory taxes"}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-emerald-400 sm:text-3xl">
                    {formatMinorUnits(
                      monthlyBreakdown.creatorNetPayoutMinorUnits
                    )}
                  </p>
                </div>

                <div className="mt-3 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200">
                  <TrendingUp size={14} className="mr-1.5 inline" />
                  {locale === "tr"
                    ? `Yıllık Projeksiyon (12 Ay): ${formatMinorUnits(yearlyCreatorPayoutMinor)}`
                    : `12-Month Projection: ${formatMinorUnits(yearlyCreatorPayoutMinor)}`}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2.5">
              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-2">
                  <Zap size={13} className="text-emerald-400" />
                  Ödeme Bloke Güvencesi
                </span>
                <span className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-2">
                  <Layers size={13} className="text-indigo-400" />
                  6 Boyutlu Telif Koruması
                </span>
              </div>
              <Link
                href={`/${locale}/kayit?role=CREATOR`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 text-sm font-black text-slate-950 shadow-lg transition hover:from-emerald-400 hover:to-teal-400"
              >
                <Video size={17} />
                {locale === "tr"
                  ? "Ücretsiz Influencer & UGC Vitrinini Oluştur (%85 Pay)"
                  : "Create Your Free Creator Showcase (85% Payout)"}
              </Link>
              <Link
                href={`/${locale}/yayinci/panel`}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
              >
                <Sparkles size={14} className="text-indigo-300" />
                {locale === "tr"
                  ? "Gelişmiş Influencer Paneline Göz At →"
                  : "Preview Advanced Creator Dashboard →"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
