"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Download,
  ExternalLink,
  Mail,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { INITIAL_CATEGORIES, INITIAL_CITIES } from "@/lib/data/catalog";
import {
  type CreatorOutreachContactRecord,
  marketplaceStore,
} from "@/lib/data/marketplaceStore";
import {
  calculateCommissionBreakdown,
  formatMinorUnits,
} from "@/lib/finance/commission";

export function ThousandCreatorsCrmSection({
  locale = "tr",
}: {
  locale?: string;
}) {
  const [queryText, setQueryText] = useState("");
  const [citySlug, setCitySlug] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [platform, setPlatform] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const allContacts = useMemo(
    () => marketplaceStore.searchAdminCreatorContacts({ limit: 1000 }).items,
    []
  );

  const filteredContacts = useMemo(() => {
    let list: CreatorOutreachContactRecord[] = allContacts;
    if (citySlug) {
      list = list.filter((c) => c.citySlug === citySlug);
    }
    if (categorySlug) {
      list = list.filter((c) => c.primaryCategorySlug === categorySlug);
    }
    if (platform) {
      list = list.filter((c) =>
        c.platforms.includes(platform as CreatorOutreachContactRecord["primaryPlatform"])
      );
    }
    if (queryText.trim()) {
      const q = queryText.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.displayName.toLowerCase().includes(q) ||
          c.contactEmail.toLowerCase().includes(q) ||
          c.socialHandle.toLowerCase().includes(q) ||
          c.cityNameTr.toLowerCase().includes(q) ||
          c.primaryCategoryNameTr.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allContacts, citySlug, categorySlug, platform, queryText]);

  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const currentSlice = filteredContacts.slice(startIdx, startIdx + pageSize);

  function handleDownloadFullThousandCsv() {
    const header =
      "\uFEFFSira;CreatorID;AdSoyad;KullaniciAdi;IsBirligiEposta;SosyalMedyaHandle;Sehir;Kategori;AnaPlatform;TakipciSayisi;EtkilesimOraniYuzde;BaslangicPaketiBrutTL;UreticiPayi85TL;DogrulamaKaynagi;ProfilURL\n";
    const rows = filteredContacts
      .map((c, idx) => {
        const b = calculateCommissionBreakdown(c.startingPriceMinorUnits, "TRY");
        return [
          idx + 1,
          c.creatorId,
          c.displayName,
          c.username,
          c.contactEmail,
          c.socialHandle,
          c.cityNameTr,
          c.primaryCategoryNameTr,
          c.primaryPlatform,
          c.totalFollowers,
          c.averageEngagementRate,
          b.grossAmountMinorUnits / 100,
          b.creatorNetPayoutMinorUnits / 100,
          c.metricVerificationSource,
          `https://www.influnex.com.tr/${locale}/influencer/${c.username}`,
        ].join(";");
      })
      .join("\n");

    const blob = new Blob([header + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `influnex-1000-influencer-eposta-ve-profil-listesi.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section
      id="influencer-eposta-rehberi"
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-800">
              <Mail size={14} />
              1.000 Influencer E-Posta & Profil Rehberi (İzole CRM Katmanı)
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
              <ShieldCheck size={13} />
              KVKK & Public/Private Ayrımı Uyumlu
            </span>
          </div>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            1.000 Onaylı Influencer Profili & İş Birliği E-Posta Veri Tabanı
          </h2>
          <p className="mt-1 max-w-3xl text-xs text-slate-600">
            Her influencer profilinin herkese açık vitrin kartı (
            <code>/tr/influencer/[username]</code>) ile yalnızca Süperadmin
            yetkisiyle görüntülenebilen kurumsal iş birliği e-posta kaydı (
            <code>@creators.influnex.com.tr</code>) fiziksel olarak ayrılmıştır.
            Tüm 1.000 kaydı filtreleyebilir veya tek tıkla Excel uyumlu UTF-8 CSV
            olarak indirebilirsiniz.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadFullThousandCsv}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-emerald-700"
        >
          <Download size={15} />
          {filteredContacts.length.toLocaleString("tr-TR")} Influencer Mail &
          Profilini İndir (CSV)
        </button>
      </div>

      {/* Filters Row */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-12">
        <div className="relative sm:col-span-5">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-3 text-slate-400"
          />
          <input
            type="search"
            value={queryText}
            onChange={(e) => {
              setQueryText(e.target.value);
              setPage(1);
            }}
            placeholder="1.000 profil ve e-posta içinde ara (isim, @handle, e-posta, şehir)..."
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-xs"
          />
        </div>

        <div className="sm:col-span-2">
          <select
            value={platform}
            onChange={(e) => {
              setPlatform(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold"
          >
            <option value="">Tüm Platformlar</option>
            <option value="INSTAGRAM">INSTAGRAM</option>
            <option value="TIKTOK">TIKTOK</option>
            <option value="YOUTUBE">YOUTUBE</option>
            <option value="UGC">UGC Kreatif</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={citySlug}
            onChange={(e) => {
              setCitySlug(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold"
          >
            <option value="">Tüm Şehirler (81 İl)</option>
            {INITIAL_CITIES.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.nameTr}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={categorySlug}
            onChange={(e) => {
              setCategorySlug(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold"
          >
            <option value="">Tüm Kategoriler (25 Sektör)</option>
            {INITIAL_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.slugTr}>
                {cat.nameTr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 uppercase text-slate-500">
              <th className="px-3 py-2.5">#</th>
              <th className="px-3 py-2.5">Influencer & Handle</th>
              <th className="px-3 py-2.5">İş Birliği E-Postası</th>
              <th className="px-3 py-2.5">Şehir & Kategori</th>
              <th className="px-3 py-2.5">Kanal</th>
              <th className="px-3 py-2.5">Takipçi & ER</th>
              <th className="px-3 py-2.5">Brüt Paket / %85 Pay</th>
              <th className="px-3 py-2.5">Profil Vitrini</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentSlice.map((item, idx) => {
              const breakdown = calculateCommissionBreakdown(
                item.startingPriceMinorUnits,
                "TRY"
              );
              return (
                <tr key={item.creatorId} className="hover:bg-slate-50/80">
                  <td className="px-3 py-2.5 font-mono text-slate-500">
                    {startIdx + idx + 1}
                  </td>
                  <td className="px-3 py-2.5">
                    <strong className="block font-bold text-slate-900">
                      {item.displayName}
                    </strong>
                    <span className="font-mono text-[11px] text-indigo-600">
                      {item.socialHandle}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <a
                      href={`mailto:${item.contactEmail}`}
                      className="font-mono font-semibold text-slate-800 underline decoration-indigo-300 hover:text-indigo-700"
                    >
                      {item.contactEmail}
                    </a>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-semibold text-slate-800">
                      {item.cityNameTr}
                    </span>{" "}
                    •{" "}
                    <span className="text-slate-600">
                      {item.primaryCategoryNameTr}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-900">
                      {item.primaryPlatform}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <strong className="text-slate-900">
                      {item.totalFollowers.toLocaleString("tr-TR")}
                    </strong>{" "}
                    <span className="text-emerald-700">
                      (%{item.averageEngagementRate} ER)
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <strong className="text-slate-900">
                      {formatMinorUnits(breakdown.grossAmountMinorUnits)}
                    </strong>
                    <span className="block text-[11px] font-bold text-emerald-700">
                      %85: {formatMinorUnits(breakdown.creatorNetPayoutMinorUnits)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/${locale}/influencer/${item.username}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-bold text-indigo-700 hover:border-indigo-400"
                    >
                      Profili Aç
                      <ExternalLink size={12} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-slate-600">
          <Users size={15} className="text-indigo-600" />
          Toplam <strong>{filteredContacts.length.toLocaleString("tr-TR")}</strong>{" "}
          influencer e-posta & profil kaydından{" "}
          <strong>
            {filteredContacts.length === 0 ? 0 : startIdx + 1}–
            {Math.min(startIdx + pageSize, filteredContacts.length)}
          </strong>{" "}
          arası gösteriliyor (Sayfa {safePage} / {totalPages})
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            ← Önceki 25
          </button>
          <span className="rounded-lg bg-indigo-50 px-3 py-1.5 font-bold text-indigo-900">
            Sayfa {safePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Sonraki 25 →
          </button>
        </div>
      </div>
    </section>
  );
}
