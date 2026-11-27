"use client";

import { useState } from "react";
import type { SupportedLocale } from "@/lib/types/domain";
import {
  calculateCommissionBreakdown,
  formatMinorUnits,
} from "@/lib/finance/commission";

export function CommissionCalculatorWidget({
  locale = "tr",
}: {
  locale?: SupportedLocale;
}) {
  const [priceTl, setPriceTl] = useState<number>(5000);

  const safeTl =
    Number.isFinite(priceTl) && priceTl >= 100
      ? Math.min(priceTl, 1000000)
      : 100;
  const breakdown = calculateCommissionBreakdown(
    Math.round(safeTl * 100),
    "TRY"
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
      <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
        {locale === "tr"
          ? "Sürpriz Kesinti Yok • %85 Üretici Kazancı"
          : "No Hidden Fees • 85% Creator Share"}
      </span>
      <h3 className="mt-2 text-lg font-bold text-slate-900">
        {locale === "tr"
          ? "Hizmet Bedeli ve Kazanç Hesaplayıcı"
          : "Service Fee & Earnings Calculator"}
      </h3>
      <p className="mt-1 text-xs text-slate-600">
        {locale === "tr"
          ? "Bir iş birliğinin toplam fiyatını girin; içerik üreticisine kalacak tutarı hemen görün."
          : "Enter the collaboration price to see the creator payout and platform commission."}
      </p>

      <div className="mt-4">
        <label
          htmlFor="service-price-input"
          className="block text-xs font-semibold text-slate-700"
        >
          {locale === "tr" ? "İş Birliği Tutarı (TL)" : "Collaboration Price (TRY)"}
        </label>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <input
            id="service-price-input"
            name="servicePrice"
            type="number"
            inputMode="decimal"
            min={100}
            max={1000000}
            step={100}
            value={priceTl}
            onChange={(e) => setPriceTl(Number(e.target.value))}
            className="w-40 rounded-xl border border-slate-300 px-3.5 py-2 text-base font-bold text-slate-900 focus:border-indigo-600"
          />
          {[2500, 5000, 10000, 25000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setPriceTl(preset)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                priceTl === preset
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {preset.toLocaleString("tr-TR")} TL
            </button>
          ))}
        </div>
      </div>

      <div
        className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3"
        aria-live="polite"
      >
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <span className="text-xs font-medium text-slate-500">
            {locale === "tr" ? "Markanın Ödeyeceği" : "Brand Pays"}
          </span>
          <p className="mt-1 text-xl font-extrabold text-slate-900">
            {formatMinorUnits(breakdown.grossAmountMinorUnits, "TRY", locale)}
          </p>
          <span className="mt-0.5 block text-[11px] text-slate-500">
            {locale === "tr" ? "Ek ücret yok" : "Zero extra fees"}
          </span>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
          <span className="text-xs font-medium text-indigo-800">
            {locale === "tr" ? "Platform Hizmet Bedeli (%15)" : "Platform Fee (15%)"}
          </span>
          <p className="mt-1 text-xl font-extrabold text-indigo-900">
            {formatMinorUnits(
              breakdown.platformCommissionMinorUnits,
              "TRY",
              locale
            )}
          </p>
          <span className="mt-0.5 block text-[11px] text-indigo-700">
            {locale === "tr"
              ? "Sadece iş tamamlanınca"
              : "Only when completed"}
          </span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
          <span className="text-xs font-medium text-emerald-800">
            {locale === "tr" ? "Üreticiye Kalan (%85)" : "Creator Receives (85%)"}
          </span>
          <p className="mt-1 text-xl font-extrabold text-emerald-900">
            {formatMinorUnits(
              breakdown.creatorNetPayoutMinorUnits,
              "TRY",
              locale
            )}
          </p>
          <span className="mt-0.5 block text-[11px] text-emerald-700">
            {locale === "tr" ? "Doğrudan üretici kazancı" : "Creator payout"}
          </span>
        </div>
      </div>
    </div>
  );
}
