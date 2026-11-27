"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, Video } from "lucide-react";
import {
  calculateCommissionBreakdown,
  formatMinorUnits,
} from "@/lib/finance/commission";
import type { SupportedLocale } from "@/lib/types/domain";

interface FormatBenchmark {
  id: string;
  platform: string;
  titleTr: string;
  titleEn: string;
  deliveryWindowTr: string;
  deliveryWindowEn: string;
  referenceGrossTl: number;
}

const FORMAT_BENCHMARKS: FormatBenchmark[] = [
  {
    id: "ig-reels",
    platform: "Instagram",
    titleTr: "Instagram Reels Videosu (30–60 sn)",
    titleEn: "Instagram Reels Video (30–60s)",
    deliveryWindowTr: "3–5 Gün Teslim",
    deliveryWindowEn: "3–5 Days",
    referenceGrossTl: 8500,
  },
  {
    id: "tiktok-spark",
    platform: "TikTok",
    titleTr: "TikTok Tanıtım Videosu",
    titleEn: "TikTok Promotional Video",
    deliveryWindowTr: "2–4 Gün Teslim",
    deliveryWindowEn: "2–4 Days",
    referenceGrossTl: 7500,
  },
  {
    id: "ugc-performance",
    platform: "UGC Video",
    titleTr: "UGC Ürün & Reklam Videosu (Markaya Teslim)",
    titleEn: "UGC Product & Ad Video",
    deliveryWindowTr: "3–4 Gün Teslim",
    deliveryWindowEn: "3–4 Days",
    referenceGrossTl: 5500,
  },
  {
    id: "yt-integration",
    platform: "YouTube",
    titleTr: "YouTube Ürün İnceleme & Tanıtım",
    titleEn: "YouTube Product Review",
    deliveryWindowTr: "5–7 Gün Teslim",
    deliveryWindowEn: "5–7 Days",
    referenceGrossTl: 15000,
  },
  {
    id: "ig-story-set",
    platform: "Instagram",
    titleTr: "Instagram 3'lü Story + Link Paylaşımı",
    titleEn: "Instagram 3-Story + Link Bundle",
    deliveryWindowTr: "1–2 Gün Teslim",
    deliveryWindowEn: "1–2 Days",
    referenceGrossTl: 4500,
  },
];

export function PlatformStatisticsSection({
  locale,
  approvedCreatorCount,
}: {
  locale: SupportedLocale;
  approvedCreatorCount: number;
  openCampaignCount?: number;
}) {
  const [monthlyDeals, setMonthlyDeals] = useState<number>(5);
  const [avgPackagePriceTl, setAvgPackagePriceTl] = useState<number>(8000);

  const monthlyGrossMinor = Math.round(monthlyDeals * avgPackagePriceTl * 100);
  const monthlyBreakdown = calculateCommissionBreakdown(monthlyGrossMinor, "TRY");
  const yearlyCreatorPayoutMinor =
    monthlyBreakdown.creatorNetPayoutMinorUnits * 12;

  return (
    <section
      id="profesyonel-istatistikler"
      className="border-y border-slate-200 bg-slate-900 py-14 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300">
            {locale === "tr"
              ? "Şeffaf Fiyatlar & Kazanç Hesaplayıcı"
              : "Transparent Rates & Earnings Calculator"}
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {locale === "tr"
              ? "İçerik Üreterek Ne Kadar Kazanabilirsiniz?"
              : "How Much Can You Earn Creating Content?"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            {locale === "tr"
              ? "InfluNex'te üyelik veya aylık abonelik ücreti yoktur. Tamamlanan her iş birliğinde kazancın %85'i doğrudan içerik üreticisine ödenir."
              : "Joining InfluNex is completely free. Creators keep 85% of every completed collaboration."}
          </p>
        </div>

        {/* 4 Simple Key Numbers */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <span className="text-xs text-emerald-300">
              {locale === "tr" ? "Üretici Kazanç Oranı" : "Creator Share"}
            </span>
            <p className="mt-1 text-3xl font-extrabold text-white">%85</p>
            <p className="mt-1 text-xs text-slate-300">
              {locale === "tr" ? "Her tamamlanan işte" : "On every completed job"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <span className="text-xs text-indigo-300">
              {locale === "tr" ? "Üyelik ve İlan Ücreti" : "Membership Fee"}
            </span>
            <p className="mt-1 text-3xl font-extrabold text-white">0 TL</p>
            <p className="mt-1 text-xs text-slate-300">
              {locale === "tr" ? "Abonelik veya jeton yok" : "No subscriptions"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <span className="text-xs text-violet-300">
              {locale === "tr" ? "Kayıtlı İçerik Üreticisi" : "Verified Creators"}
            </span>
            <p className="mt-1 text-3xl font-extrabold text-white">
              {approvedCreatorCount.toLocaleString("tr-TR")}+
            </p>
            <p className="mt-1 text-xs text-slate-300">
              {locale === "tr" ? "81 il ve 25 kategoride" : "Across 25 categories"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <span className="text-xs text-amber-300">
              {locale === "tr" ? "Hizmet Hizmeti Komisyonu" : "Platform Fee"}
            </span>
            <p className="mt-1 text-3xl font-extrabold text-white">%15</p>
            <p className="mt-1 text-xs text-slate-300">
              {locale === "tr" ? "Sadece iş tamamlandığında" : "Only when completed"}
            </p>
          </div>
        </div>

        {/* 2 Columns: Simple Format Reference + Simple Earnings Calculator */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:col-span-7">
            <h3 className="text-lg font-bold text-white">
              {locale === "tr"
                ? "Popüler İçerik Türleri ve Ortalama Fiyatlar"
                : "Popular Content Formats & Average Rates"}
            </h3>
            <p className="mt-1 text-xs text-slate-300">
              {locale === "tr"
                ? "Kendi paket fiyatınızı dilediğiniz gibi belirleyebilirsiniz. Aşağıdaki tutarlar fikir vermesi için ortalama örneklerdir:"
                : "You set your own prices. Below are common marketplace averages:"}
            </p>

            <div className="mt-4 divide-y divide-white/10">
              {FORMAT_BENCHMARKS.map((item) => {
                const breakdown = calculateCommissionBreakdown(
                  item.referenceGrossTl * 100,
                  "TRY"
                );
                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3.5"
                  >
                    <div>
                      <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-200">
                        {item.platform}
                      </span>
                      <span className="ml-2 text-xs text-slate-400">
                        {locale === "tr"
                          ? item.deliveryWindowTr
                          : item.deliveryWindowEn}
                      </span>
                      <h4 className="mt-1 text-sm font-bold text-white">
                        {locale === "tr" ? item.titleTr : item.titleEn}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="block text-xs text-slate-400">
                        {locale === "tr" ? "Paket Fiyatı:" : "Package:"}{" "}
                        <strong className="text-white">
                          {formatMinorUnits(breakdown.grossAmountMinorUnits)}
                        </strong>
                      </span>
                      <span className="mt-0.5 block text-sm font-extrabold text-emerald-400">
                        {locale === "tr" ? "Senin Kazancın (%85):" : "Your 85%:"}{" "}
                        {formatMinorUnits(breakdown.creatorNetPayoutMinorUnits)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simple Monthly Earnings Calculator */}
          <div className="flex flex-col justify-between rounded-2xl border border-emerald-400/30 bg-slate-950 p-6 lg:col-span-5">
            <div>
              <h3 className="text-xl font-bold text-white">
                {locale === "tr"
                  ? "Aylık Kazancını Hesapla"
                  : "Calculate Your Monthly Earnings"}
              </h3>
              <p className="mt-1 text-xs text-slate-300">
                {locale === "tr"
                  ? "Ayda kaç iş birliği yapacağını ve paket fiyatını seç:"
                  : "Choose your monthly collaborations and package price:"}
              </p>

              <div className="mt-5 space-y-5">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <label htmlFor="sim-monthly-deals" className="text-slate-200">
                      {locale === "tr"
                        ? "Aylık İş Birliği Sayısı"
                        : "Monthly Collaborations"}
                    </label>
                    <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-sm font-bold text-emerald-300">
                      {monthlyDeals} {locale === "tr" ? "İş / Ay" : "Deals / Mo"}
                    </span>
                  </div>
                  <input
                    id="sim-monthly-deals"
                    type="range"
                    min={1}
                    max={25}
                    step={1}
                    value={monthlyDeals}
                    onChange={(e) => setMonthlyDeals(Number(e.target.value))}
                    className="mt-2 w-full accent-emerald-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <label htmlFor="sim-avg-price" className="text-slate-200">
                      {locale === "tr"
                        ? "Ortalama Paket Fiyatın"
                        : "Average Package Price"}
                    </label>
                    <span className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-sm font-bold text-indigo-300">
                      {avgPackagePriceTl.toLocaleString("tr-TR")} TL
                    </span>
                  </div>
                  <input
                    id="sim-avg-price"
                    type="range"
                    min={1500}
                    max={40000}
                    step={500}
                    value={avgPackagePriceTl}
                    onChange={(e) => setAvgPackagePriceTl(Number(e.target.value))}
                    className="mt-2 w-full accent-indigo-400"
                  />
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>{locale === "tr" ? "Toplam Tutar:" : "Total:"}</span>
                  <strong>
                    {formatMinorUnits(monthlyBreakdown.grossAmountMinorUnits)}
                  </strong>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {locale === "tr"
                      ? "Platform Hizmet Bedeli (%15):"
                      : "Platform Fee (15%):"}
                  </span>
                  <span>
                    -{" "}
                    {formatMinorUnits(
                      monthlyBreakdown.platformCommissionMinorUnits
                    )}
                  </span>
                </div>
                <div className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-3">
                  <span className="text-sm font-bold text-emerald-300">
                    {locale === "tr"
                      ? "Aylık Net Kazancın (%85):"
                      : "Your Monthly Earnings (85%):"}
                  </span>
                  <p className="text-2xl font-black text-emerald-400">
                    {formatMinorUnits(
                      monthlyBreakdown.creatorNetPayoutMinorUnits
                    )}
                  </p>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  <TrendingUp size={13} className="mr-1 inline text-emerald-400" />
                  {locale === "tr"
                    ? `Yıllık Tahmini Kazanç: ${formatMinorUnits(yearlyCreatorPayoutMinor)}`
                    : `Estimated Annual Earnings: ${formatMinorUnits(yearlyCreatorPayoutMinor)}`}
                </p>
              </div>
            </div>

            <Link
              href={`/${locale}/kayit?role=CREATOR`}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
            >
              <Video size={17} />
              {locale === "tr"
                ? "Ücretsiz Profilini Oluştur"
                : "Create Your Free Profile"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
