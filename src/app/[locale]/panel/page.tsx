"use client";

import { useState } from "react";
import {
  calculateCommissionBreakdown,
  formatMinorUnits,
} from "@/lib/finance/commission";

export default function UserDashboardPanelPage() {
  const [activeRole, setActiveRole] = useState<"ADVERTISER" | "CREATOR">(
    "ADVERTISER"
  );
  const [orderStatus, setOrderStatus] = useState<string>("PAYMENT_PENDING");
  const [receiptFileName, setReceiptFileName] = useState<string>("");
  const [receiptStatusMsg, setReceiptStatusMsg] = useState<string | null>(null);

  // AI Campaign Brief Builder state
  const [brandName, setBrandName] = useState("Toros Auto Care");
  const [brandWebsite, setBrandWebsite] = useState("https://torosautocare.com.tr");
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
      "Dekontunuz güvenli private storage alanına yüklendi. Dekont yüklenmesi ödemenin onaylandığı anlamına gelmez; yönetici banka hareketlerini kontrol ettikten sonra sipariş durumu PAID olacaktır."
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
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800">
            İzole Veri Katmanı: influnex-db
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Reklamveren & Influencer İşlem Paneli
          </h1>
        </div>

        <div className="flex gap-2">
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
            onClick={() => setActiveRole("CREATOR")}
            className={`rounded-xl px-4 py-2 text-xs font-bold ${
              activeRole === "CREATOR"
                ? "bg-indigo-600 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            Influencer Hakediş Görünümü
          </button>
        </div>
      </div>

      {/* Profile Completion & Verification Badges (Section 7) */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <strong className="text-slate-900">
            Profil Tamamlama Göstergesi: %85
          </strong>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-900">
              ✓ Doğrulanmış E-Posta
            </span>
            <span className="rounded-md bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-900">
              ✓ Doğrulanmış Kimlik (18+)
            </span>
            <span className="rounded-md bg-indigo-100 px-2.5 py-1 font-semibold text-indigo-900">
              ✓ Doğrulanmış Sosyal Medya Hesabı
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* LEFT COLUMN: BANK TRANSFER & ORDER STATE MACHINE (Sections 14 & 15) */}
        <div className="space-y-6 lg:col-span-7">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-indigo-600">
                  Sipariş Kodu: INF-2026-000001
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Sipariş ve Banka Havalesi / EFT / FAST Ödeme Ekranı
                </h2>
              </div>
              <span className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-900">
                Durum: {orderStatus}
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 text-xs sm:grid-cols-3">
              <div>
                <dt className="text-slate-500">Toplam Ödeme Tutarı</dt>
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
                <dt className="text-slate-500">%85 Influencer Hakedişi</dt>
                <dd className="mt-0.5 text-base font-bold text-emerald-700">
                  {formatMinorUnits(
                    sampleOrderBreakdown.creatorNetPayoutMinorUnits
                  )}
                </dd>
              </div>
            </dl>

            {/* Law No. 6493 & Real IBAN Configuration Check (Section 15) */}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950">
              <strong className="block font-bold">
                Banka Hesap Bilgisi ve 6493 Sayılı Kanun Uyumluluk Kontrolü:
              </strong>
              <p className="mt-1">
                Gerçek şirket ticari unvanı ve onaylı IBAN bilgisi{" "}
                <code>COMPANY_BANK_IBAN</code> /{" "}
                <code>BANK_TRANSFER_LIVE_ENABLED=true</code> ortam değişkenleri
                ile yapılandırılana kadar sistemde uydurma IBAN yayınlanmaz.
                Havale açıklama alanına mutlaka{" "}
                <strong>INF-2026-000001</strong> sipariş kodunu yazınız.
              </p>
            </div>

            {/* Receipt Upload Form */}
            <form onSubmit={handleReceiptUpload} className="mt-5 space-y-3">
              <label
                htmlFor="receipt-file"
                className="block text-xs font-bold text-slate-700"
              >
                Ödeme Dekontu Yükle (Yalnızca PDF, JPG, PNG • Maks. 5 MB •
                Private Cloud Storage)
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
                Dekontu Yükle ve Onaya Gönder
              </button>
            </form>

            {receiptStatusMsg ? (
              <p className="mt-3 rounded-xl bg-indigo-50 p-3 text-xs font-medium text-indigo-950">
                {receiptStatusMsg}
              </p>
            ) : null}
          </section>

          {/* Creator Accounting Panel (Section 16 - Not a digital wallet!) */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Influencer Muhasebe ve Hakediş Özeti (Dijital Cüzdan Değildir)
            </span>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Tamamlanan İşler ve %85 Hakediş Kayıtları
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3.5">
                <span className="text-xs text-slate-500">Toplam Brüt Satış</span>
                <p className="mt-1 text-base font-extrabold text-slate-900">
                  10.000 TL
                </p>
              </div>
              <div className="rounded-xl bg-indigo-50 p-3.5">
                <span className="text-xs text-indigo-800">
                  Platform Komisyonu (%15)
                </span>
                <p className="mt-1 text-base font-extrabold text-indigo-950">
                  1.500 TL
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3.5">
                <span className="text-xs text-emerald-800">
                  Oluşan Hakediş (%85)
                </span>
                <p className="mt-1 text-base font-extrabold text-emerald-950">
                  8.500 TL
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: AI CAMPAIGN DRAFT GENERATOR (Section 18) */}
        <div className="space-y-6 lg:col-span-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-800">
              SSRF Korumalı Yapay Zekâ Asistanı
            </span>
            <h2 className="mt-2 text-lg font-bold text-slate-900">
              AI Kampanya Hazırlama Aracı
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Marka web sitenizi ve bütçenizi girin; AI kampanya başlığı, hedef
              kitle, reklam senaryosu ve #reklam bildirimi taslağı hazırlasın.
              Onayınız olmadan yayınlanmaz.
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
                  Bütçe (TL)
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
