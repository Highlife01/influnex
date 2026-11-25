"use client";

import { useState } from "react";
import Link from "next/link";
import { SUPER_ADMIN_EMAIL } from "@/lib/auth/roles";
import {
  calculateCommissionBreakdown,
  formatMinorUnits,
} from "@/lib/finance/commission";

const ORDER_LIFECYCLE_STEPS = [
  {
    code: "PAYMENT_PENDING",
    label: "1. Ödeme Bekleniyor",
    detail: "Sipariş snapshot'ı sabitlendi; banka havalesi / EFT / FAST bekleniyor.",
  },
  {
    code: "PAYMENT_REVIEW",
    label: "2. Dekont İncelemede",
    detail: "PDF/JPG/PNG dekont yüklendi; yönetici banka hareketiyle eşleştiriyor.",
  },
  {
    code: "PAID",
    label: "3. Ödeme Onaylandı (Bloke)",
    detail: "Tahsilat doğrulandı ve tutar iş tamamlanana kadar muhasebede bloke edildi.",
  },
  {
    code: "IN_PROGRESS",
    label: "4. Üretimde",
    detail: "Üretici çekim ve kurgu sürecine başladı.",
  },
  {
    code: "CONTENT_SUBMITTED",
    label: "5. Taslak Teslim Edildi",
    detail: "İçerik önizlemesi sipariş odasına yüklendi (5 iş günü inceleme süresi).",
  },
  {
    code: "REVISION_REQUESTED",
    label: "6. Revizyon İstendi",
    detail: "Paketteki revizyon hakkı dahilinde gerekçeli düzeltme talep edildi.",
  },
  {
    code: "CONTENT_APPROVED",
    label: "7. İçerik Onaylandı",
    detail: "Marka taslağı onayladı; yayına hazır.",
  },
  {
    code: "PUBLISHED",
    label: "8. Yayında (#reklam Doğrulandı)",
    detail: "Yayın bağlantısı ve Ticaret Bakanlığı #reklam / #işbirliği etiketi doğrulandı.",
  },
  {
    code: "COMPLETED",
    label: "9. Tamamlandı & %85 Hakediş Tahakkuku",
    detail: "%15 komisyon ayrıldı, %85 üretici brüt hakedişi ödeme kuyruğuna (PAYOUT_PENDING) alındı.",
  },
  {
    code: "PAYOUT_COMPLETED",
    label: "10. Hakediş Ödendi",
    detail: "Üretici hakedişi banka işlem referans numarasıyla aktarıldı.",
  },
] as const;

export default function UserDashboardPanelPage() {
  const [activeRole, setActiveRole] = useState<
    "SUPERADMIN" | "CREATOR" | "ADVERTISER"
  >("CREATOR");
  const [orderStatus, setOrderStatus] = useState<string>("PAID");
  const [receiptFileName, setReceiptFileName] = useState<string>("");
  const [receiptStatusMsg, setReceiptStatusMsg] = useState<string | null>(null);

  // AI Campaign Brief Builder state
  const [brandName, setBrandName] = useState("Toros Auto Care");
  const [brandWebsite, setBrandWebsite] = useState(
    "https://torosautocare.com.tr"
  );
  const [productDesc, setProductDesc] = useState(
    "Nano seramik hızlı cila ve su itici araç bakım kiti tanıtımı"
  );
  const [budgetTl, setBudgetTl] = useState(10000);
  const [aiDraftResult, setAiDraftResult] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const sampleOrderBreakdown = calculateCommissionBreakdown(1000000, "TRY"); // 10.000 TL

  function handleReceiptUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!receiptFileName) {
      setReceiptStatusMsg("Lütfen PDF, JPG veya PNG formatında dekont seçiniz.");
      return;
    }
    setOrderStatus("PAYMENT_REVIEW");
    setReceiptStatusMsg(
      "Örnek dekont simülasyonu tamamlandı (PAYMENT_REVIEW). Süperadmin banka ekstresindeki tekil işlem referans numarasını doğruladığında sipariş PAID (Bloke) durumuna geçer."
    );
  }

  async function handleGenerateAiBrief(e: React.FormEvent) {
    e.preventDefault();
    setAiError(null);
    setAiDraftResult(null);
    try {
      const res = await fetch("/api/v1/campaigns/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          brandWebsite,
          productDescription: productDesc,
          budgetMinorUnits: Math.round(budgetTl * 100),
          locale: "tr",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "Kampanya taslağı oluşturulamadı.");
      } else {
        setAiDraftResult(data);
      }
    } catch {
      setAiError("Sunucu bağlantı hatası.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Top Executive Navigation Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-slate-950 p-4 text-xs text-white">
        <div>
          <strong className="text-emerald-400">
            Birleşik İşlem, Sipariş Durum Makinesi & Hakediş Kokpiti:
          </strong>{" "}
          Süperadmin (<code>{SUPER_ADMIN_EMAIL}</code>), Influencer (%85 Pay)
          ve Reklamveren görünümleri arasında geçiş yapabilirsiniz.
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/tr/yonetim"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 font-bold text-white hover:bg-indigo-500"
          >
            Süperadmin Paneli →
          </Link>
          <Link
            href="/tr/yayinci/panel"
            className="rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-500"
          >
            Influencer Stüdyosu →
          </Link>
          <Link
            href="/tr/reklamveren/panel"
            className="rounded-lg bg-white/15 px-3 py-1.5 font-bold text-white hover:bg-white/25"
          >
            Reklamveren Paneli →
          </Link>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800">
            İzole Veri Katmanı: influnex-db • Süperadmin: {SUPER_ADMIN_EMAIL}
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            15 Durumlu Sipariş, Bloke & %85 Hakediş Simülasyon Merkezi
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveRole("CREATOR")}
            className={`rounded-xl px-4 py-2 text-xs font-bold ${
              activeRole === "CREATOR"
                ? "bg-emerald-600 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            Influencer (%85 Hakediş)
          </button>
          <button
            type="button"
            onClick={() => setActiveRole("ADVERTISER")}
            className={`rounded-xl px-4 py-2 text-xs font-bold ${
              activeRole === "ADVERTISER"
                ? "bg-indigo-600 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            Reklamveren Görünümü
          </button>
          <button
            type="button"
            onClick={() => setActiveRole("SUPERADMIN")}
            className={`rounded-xl px-4 py-2 text-xs font-bold ${
              activeRole === "SUPERADMIN"
                ? "bg-slate-950 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            Süperadmin ({SUPER_ADMIN_EMAIL})
          </button>
        </div>
      </div>

      {/* Interactive Order State Machine Visualizer */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Adım Adım Sipariş Yaşam Döngüsü (State Machine)
            </span>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Bir Durum Seçerek Sipariş ve Muhasebe Davranışını İnceleyin
            </h2>
          </div>
          <span className="rounded-lg bg-indigo-950 px-3 py-1 text-xs font-bold text-white">
            Seçili Durum: {orderStatus}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {ORDER_LIFECYCLE_STEPS.map((st) => {
            const active = orderStatus === st.code;
            return (
              <button
                key={st.code}
                type="button"
                onClick={() => setOrderStatus(st.code)}
                className={`rounded-xl border p-3 text-left text-xs transition ${
                  active
                    ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                    : "border-slate-200 bg-slate-50/70 hover:border-slate-400"
                }`}
              >
                <strong className="block font-bold text-slate-900">
                  {st.label}
                </strong>
                <span className="mt-1 block text-[11px] leading-4 text-slate-600">
                  {st.detail}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* LEFT COLUMN: BANK TRANSFER, ESCROW BLOCK & REFUND RULES */}
        <div className="space-y-6 lg:col-span-7">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-indigo-600">
                  Örnek Sipariş Kodu: INF-2026-000001
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Banka Havalesi / EFT / FAST, Bloke ve İade Kuralları
                </h2>
              </div>
              <span className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-900">
                Durum: {orderStatus}
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 text-xs sm:grid-cols-3">
              <div>
                <dt className="text-slate-500">
                  Toplam Hizmet Bedeli (Vergi Hariç Brüt)
                </dt>
                <dd className="mt-0.5 text-base font-extrabold text-slate-900">
                  {formatMinorUnits(sampleOrderBreakdown.grossAmountMinorUnits)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">%15 Platform Komisyonu</dt>
                <dd className="mt-0.5 text-base font-bold text-indigo-700">
                  {formatMinorUnits(
                    sampleOrderBreakdown.platformCommissionMinorUnits
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">
                  %85 Üretici Brüt Payı (Vergi/Stopaj Öncesi)
                </dt>
                <dd className="mt-0.5 text-base font-bold text-emerald-700">
                  {formatMinorUnits(
                    sampleOrderBreakdown.creatorNetPayoutMinorUnits
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
              <strong className="block text-slate-900">
                Tahsilat, Bloke, Hakediş Aktarımı ve İade Kuralları:
              </strong>
              <p>
                • <strong>1. Dekont Eşleştirme:</strong> Reklamveren havale/FAST
                açıklamasına tekil sipariş kodunu (<code>INF-2026-000001</code>)
                yazar. Süperadmin (<code>{SUPER_ADMIN_EMAIL}</code>) banka
                ekstresindeki tekil işlem referans numarasını (
                <code>bankTransactionRef</code>) kaydederek onaylar; aynı
                referans ikinci kez kullanılamaz.
              </p>
              <p>
                • <strong>2. Paranın Bloke Edilmesi:</strong> Ödeme
                onaylandığında (<code>PAID</code>) tutar üreticiye hemen
                aktarılmaz; içerik teslim edilip onaylanana kadar muhasebe
                defterinde bloke tutulur.
              </p>
              <p>
                • <strong>3. Üreticiye Aktarım Zamanı:</strong> Taslak
                onaylanıp (<code>CONTENT_APPROVED</code>) Ticaret Bakanlığı{" "}
                <code>#reklam</code> etiketiyle yayın doğrulandığında (
                <code>COMPLETED</code>), %85 brüt hakediş üretici ödeme
                kuyruğuna (<code>PAYOUT_PENDING</code>) alınır.
              </p>
              <p>
                • <strong>4. İptal ve İade Politikası:</strong> Üretici işe
                başlamadan veya teslim süresi aşıldığı için iptal edilen
                siparişlerde reklamverene ödediği tutarın{" "}
                <strong>%100&apos;ü</strong> iade edilir ve{" "}
                <strong>%0 komisyon</strong> uygulanır.
              </p>
            </div>

            {/* Receipt Upload Simulation Form */}
            <form onSubmit={handleReceiptUpload} className="mt-5 space-y-3">
              <label
                htmlFor="receipt-file"
                className="block text-xs font-bold text-slate-700"
              >
                Örnek Dekont Yükleme Simülasyonu (PDF, JPG, PNG • Maks. 5 MB •
                Magic-Byte Korumalı)
              </label>
              <input
                id="receipt-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(e) =>
                  setReceiptFileName(e.target.files?.[0]?.name || "")
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
              />
              <button
                type="submit"
                className="rounded-xl bg-indigo-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
              >
                Örnek Dekontu Doğrula (Simülasyon)
              </button>
            </form>

            {receiptStatusMsg ? (
              <p className="mt-3 rounded-xl bg-indigo-50 p-3 text-xs font-medium text-indigo-950">
                {receiptStatusMsg}
              </p>
            ) : null}
          </section>
        </div>

        {/* RIGHT COLUMN: AI CAMPAIGN DRAFT GENERATOR */}
        <div className="space-y-6 lg:col-span-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-800">
              SSRF Korumalı Yapay Zekâ Asistanı
            </span>
            <h2 className="mt-2 text-lg font-bold text-slate-900">
              AI Kampanya Brief Hazırlama Aracı
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Marka web sitenizi ve bütçenizi girin; AI kampanya başlığı, hedef
              kitle, reklam senaryosu ve #reklam bildirimi taslağı hazırlasın.
            </p>

            <form onSubmit={handleGenerateAiBrief} className="mt-4 space-y-3">
              <div>
                <label
                  htmlFor="ai-brand-name"
                  className="block text-xs font-bold text-slate-700"
                >
                  Marka Adı
                </label>
                <input
                  id="ai-brand-name"
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label
                  htmlFor="ai-brand-url"
                  className="block text-xs font-bold text-slate-700"
                >
                  Marka Web Sitesi (HTTPS zorunlu, SSRF korumalı)
                </label>
                <input
                  id="ai-brand-url"
                  type="url"
                  value={brandWebsite}
                  onChange={(e) => setBrandWebsite(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label
                  htmlFor="ai-prod-desc"
                  className="block text-xs font-bold text-slate-700"
                >
                  Ürün veya Hizmet Açıklaması
                </label>
                <textarea
                  id="ai-prod-desc"
                  rows={3}
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label
                  htmlFor="ai-budget"
                  className="block text-xs font-bold text-slate-700"
                >
                  Brüt Bütçe (TL)
                </label>
                <input
                  id="ai-budget"
                  type="number"
                  min={500}
                  value={budgetTl}
                  onChange={(e) => setBudgetTl(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
              >
                AI Kampanya Taslağı Oluştur
              </button>
            </form>

            {aiError ? (
              <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
                {aiError}
              </p>
            ) : null}

            {aiDraftResult ? (
              <div className="mt-4 space-y-2 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 text-xs text-slate-800">
                <p className="font-bold text-indigo-950">
                  {String(aiDraftResult.campaignTitle)}
                </p>
                <p>{String(aiDraftResult.campaignDescription)}</p>
                <p>
                  <strong>Senaryo Taslağı:</strong>{" "}
                  {String(aiDraftResult.adScriptDraft)}
                </p>
                <p>
                  <strong>Yasal İş Birliği Bildirimi:</strong>{" "}
                  <code>{String(aiDraftResult.disclosureDraft)}</code>
                </p>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
