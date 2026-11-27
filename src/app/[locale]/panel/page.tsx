"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SUPER_ADMIN_EMAIL } from "@/lib/auth/roles";
import {
  calculateCommissionBreakdown,
  formatMinorUnits,
} from "@/lib/finance/commission";
import {
  REAL_STORAGE_KEYS,
  type RealLedgerOrder,
} from "@/components/dashboard/RoleDashboard";

const ORDER_LIFECYCLE_STEPS = [
  {
    code: "PAYMENT_PENDING",
    label: "1. Ödeme Bekleniyor",
    detail: "Sipariş koşulları kaydedildi; banka havalesi / EFT / FAST bekleniyor.",
  },
  {
    code: "PAYMENT_REVIEW",
    label: "2. Dekont İncelemede",
    detail: "Dekont yüklendi; yönetici banka hareketiyle eşleştiriyor.",
  },
  {
    code: "PAID",
    label: "3. Ödeme Onaylandı (Bloke)",
    detail: "Tahsilat doğrulandı ve tutar iş tamamlanana kadar güvenceye alındı.",
  },
  {
    code: "IN_PROGRESS",
    label: "4. Üretimde",
    detail: "İçerik üreticisi çekim ve kurgu sürecine başladı.",
  },
  {
    code: "CONTENT_SUBMITTED",
    label: "5. Taslak Teslim Edildi",
    detail: "İçerik önizlemesi sipariş odasına yüklendi.",
  },
  {
    code: "REVISION_REQUESTED",
    label: "6. Revizyon İstendi",
    detail: "Paketteki revizyon hakkı dahilinde düzeltme talep edildi.",
  },
  {
    code: "CONTENT_APPROVED",
    label: "7. İçerik Onaylandı",
    detail: "Marka taslağı onayladı; yayına hazır.",
  },
  {
    code: "PUBLISHED",
    label: "8. Yayında (#reklam Doğrulandı)",
    detail: "Yayın bağlantısı ve #reklam / #işbirliği etiketi doğrulandı.",
  },
  {
    code: "COMPLETED",
    label: "9. Tamamlandı & %85 Hakediş",
    detail: "%15 platform hizmet bedeli ayrıldı, %85 üretici hakedişi ödeme sırasına alındı.",
  },
  {
    code: "PAYOUT_COMPLETED",
    label: "10. Hakediş Ödendi",
    detail: "Üretici hakedişi banka işlem referans numarasıyla aktarıldı.",
  },
] as const;

export default function UserDashboardPanelPage() {
  const [realOrders, setRealOrders] = useState<RealLedgerOrder[]>([]);
  const [orderStatus, setOrderStatus] = useState<string>("PAYMENT_PENDING");
  const [calcAmountTl, setCalcAmountTl] = useState<number>(3500);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(REAL_STORAGE_KEYS.ORDERS);
      if (raw) {
        const parsed = JSON.parse(raw) as RealLedgerOrder[];
        if (Array.isArray(parsed)) {
          setRealOrders(parsed);
          if (parsed[0]) {
            setOrderStatus(parsed[0].state);
            setCalcAmountTl(parsed[0].grossTl);
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const safeAmountMinor = Math.max(0, Math.round((Number(calcAmountTl) || 0) * 100));
  const breakdown =
    safeAmountMinor > 0
      ? calculateCommissionBreakdown(safeAmountMinor, "TRY")
      : {
          grossAmountMinorUnits: 0,
          platformCommissionMinorUnits: 0,
          creatorNetPayoutMinorUnits: 0,
        };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Top Executive Navigation Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-slate-950 p-4 text-xs text-white">
        <div>
          <strong className="text-emerald-400">
            Sipariş Durum ve Hakediş Hesaplama Merkezi:
          </strong>{" "}
          Süperadmin (<code>{SUPER_ADMIN_EMAIL}</code>), Influencer (%85 Pay)
          ve Marka panellerine doğrudan geçiş yapabilirsiniz.
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/tr/yonetim"
            className="rounded-lg bg-amber-400 px-3 py-1.5 font-black text-slate-950 hover:bg-amber-300"
          >
            👑 Süperadmin Paneli →
          </Link>
          <Link
            href="/tr/yayinci/panel"
            className="rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-500"
          >
            Yayıncı Paneli →
          </Link>
          <Link
            href="/tr/reklamveren/panel"
            className="rounded-lg bg-white/15 px-3 py-1.5 font-bold text-white hover:bg-white/25"
          >
            Marka Paneli →
          </Link>
        </div>
      </div>

      <div className="border-b border-slate-200 pb-6">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
          Canlı Sistem • Güvenli Sipariş Takibi
        </span>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Sipariş Aşamaları, Güvenli Ödeme Blokesi ve %85 Hakediş Rehberi
        </h1>
      </div>

      {/* Real Orders List */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Gerçek Sipariş Kayıtları
            </span>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Aktif Siparişler ({realOrders.length})
            </h2>
          </div>
          <Link
            href="/tr/yonetim"
            className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700"
          >
            Süperadmin Panelinden Sipariş Ekle / Yönet →
          </Link>
        </div>

        {realOrders.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-xs text-slate-600">
            Henüz kayıtlı sipariş bulunmuyor. Süperadmin panelinden oluşturduğunuz
            gerçek siparişler otomatik olarak burada listelenir.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {realOrders.map((ord) => {
              const b =
                ord.grossTl > 0
                  ? calculateCommissionBreakdown(ord.grossTl * 100, "TRY")
                  : {
                      grossAmountMinorUnits: 0,
                      platformCommissionMinorUnits: 0,
                      creatorNetPayoutMinorUnits: 0,
                    };
              return (
                <div
                  key={ord.orderCode}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <strong className="font-mono text-indigo-950">
                      {ord.orderCode}
                    </strong>
                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 font-bold text-indigo-900">
                      {ord.state}
                    </span>
                  </div>
                  <p className="mt-1 font-bold text-slate-900">
                    {ord.brandName} → {ord.creatorName}
                  </p>
                  <p className="text-slate-600">{ord.serviceTitle}</p>
                  <p className="mt-2 font-bold text-emerald-700">
                    Brüt: {formatMinorUnits(b.grossAmountMinorUnits)} • %85
                    Üretici Payı: {formatMinorUnits(b.creatorNetPayoutMinorUnits)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Interactive Order Lifecycle Visualizer */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              10 Adımda Sipariş İşleyişi
            </span>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Sipariş ve Ödeme Bloke Aşamaları
            </h2>
          </div>
          <span className="rounded-lg bg-indigo-950 px-3 py-1 text-xs font-bold text-white">
            Seçili Aşama: {orderStatus}
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

      {/* Real Commission & Payout Calculator */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
          Canlı Hakediş Hesaplayıcı
        </span>
        <h2 className="mt-1 text-lg font-bold text-slate-900">
          %15 Platform Hizmet Bedeli ve %85 Üretici Hakediş Hesaplama
        </h2>
        <div className="mt-4 max-w-xs">
          <label
            htmlFor="calc-gross-tl"
            className="block text-xs font-bold text-slate-700"
          >
            Hizmet Paketi Tutarı (TL)
          </label>
          <input
            id="calc-gross-tl"
            type="number"
            min={0}
            step={250}
            value={calcAmountTl}
            onChange={(e) => setCalcAmountTl(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold"
          />
        </div>
        <dl className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 text-xs sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">Toplam Hizmet Bedeli</dt>
            <dd className="mt-0.5 text-base font-extrabold text-slate-900">
              {formatMinorUnits(breakdown.grossAmountMinorUnits)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">%15 Platform Hizmet Komisyonu</dt>
            <dd className="mt-0.5 text-base font-bold text-indigo-700">
              {formatMinorUnits(breakdown.platformCommissionMinorUnits)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">%85 Üretici Net Hakedişi</dt>
            <dd className="mt-0.5 text-base font-bold text-emerald-700">
              {formatMinorUnits(breakdown.creatorNetPayoutMinorUnits)}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
