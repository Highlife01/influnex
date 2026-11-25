"use client";

import { useState } from "react";
import {
  calculateCommissionBreakdown,
  formatMinorUnits,
} from "@/lib/finance/commission";

interface CommissionCalculatorWidgetProps {
  locale?: "tr" | "en";
}

export function CommissionCalculatorWidget({
  locale = "tr",
}: CommissionCalculatorWidgetProps) {
  const [priceTl, setPriceTl] = useState<number>(5000);
  const isTurkish = locale === "tr";

  const safeTl = Number.isFinite(priceTl) && priceTl >= 100 ? Math.min(priceTl, 1000000) : 100;
  const breakdown = calculateCommissionBreakdown(Math.round(safeTl * 100), "TRY");
  const formatAmount = (amount: number) =>
    formatMinorUnits(amount, "TRY", locale);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {isTurkish
              ? "Planlanan %15 Komisyon • %85 Üretici Payı"
              : "Planned 15% Commission • 85% Creator Share"}
          </span>
          <h3 className="mt-2 text-lg font-bold text-slate-900">
            {isTurkish
              ? "Örnek Komisyon Hesaplayıcı"
              : "Sample Commission Calculator"}
          </h3>
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="service-price-input"
          className="block text-xs font-semibold uppercase tracking-wide text-slate-600"
        >
          {isTurkish ? "Örnek Hizmet Bedeli (TL)" : "Sample Service Amount (TRY)"}
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
            className="w-44 rounded-xl border border-slate-300 px-3.5 py-2 text-base font-bold text-slate-900 focus:border-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          />
          {[100, 1000, 5000, 10000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setPriceTl(preset)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
                priceTl === preset
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {preset.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")}{" "}
              {isTurkish ? "TL" : "TRY"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <span className="text-xs font-medium text-slate-500">
            {isTurkish
              ? "Örnek Hizmet Bedeli (Brüt)"
              : "Sample Service Amount (Gross)"}
          </span>
          <p className="mt-1 text-xl font-extrabold text-slate-900">
            {formatAmount(breakdown.grossAmountMinorUnits)}
          </p>
          <span className="mt-0.5 block text-[11px] text-slate-500">
            {isTurkish ? "Ek hizmet bedeli yok" : "No additional service fee"}
          </span>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
          <span className="text-xs font-medium text-indigo-800">
            {isTurkish
              ? "Planlanan Platform Komisyonu (%15)"
              : "Planned Platform Commission (15%)"}
          </span>
          <p className="mt-1 text-xl font-extrabold text-indigo-900">
            {formatAmount(breakdown.platformCommissionMinorUnits)}
          </p>
          <span className="mt-0.5 block text-[11px] text-indigo-700">
            {isTurkish
              ? "Canlı iş akışı açıldığında"
              : "Once the live workflow launches"}
          </span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
          <span className="text-xs font-medium text-emerald-800">
            {isTurkish
              ? "Planlanan Üretici Payı (%85)"
              : "Planned Creator Share (85%)"}
          </span>
          <p className="mt-1 text-xl font-extrabold text-emerald-900">
            {formatAmount(breakdown.creatorNetPayoutMinorUnits)}
          </p>
          <span className="mt-0.5 block text-[11px] text-emerald-700">
            {isTurkish
              ? "Vergi ve yasal kesintiler öncesi"
              : "Before taxes and statutory deductions"}
          </span>
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">
        {isTurkish
          ? "Bu tutarlar planlanan model için örnektir; şu anda sipariş veya ödeme alınmamaktadır."
          : "These amounts illustrate the planned model; orders and payments are not currently processed."}
      </p>
    </div>
  );
}
