"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Mail,
  MessageSquareShare,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
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

interface OutreachTemplate {
  id: string;
  label: string;
  subject: string;
  buildBody: (params: {
    name: string;
    handle: string;
    city: string;
    category: string;
  }) => string;
}

const OUTREACH_TEMPLATES: OutreachTemplate[] = [
  {
    id: "creator-85",
    label: "1. %85 Hakediş & Sıfır Ücret Influencer Daveti",
    subject:
      "InfluNex Marka İş Birlikleri Daveti — %85 Üretici Payı & %0 Üyelik Ücreti",
    buildBody: ({ name, handle, city, category }) =>
      `Merhaba ${name} (${handle}),

${city} ve Türkiye genelinde ${category} kategorisindeki içeriklerinizi beğeniyle takip ediyoruz.

Markalarla içerik üreticilerini şeffaf ve güvenli şekilde buluşturan yeni nesil pazaryerimiz InfluNex'te (https://www.influnex.com.tr) yerinizi almanız için sizi davet etmek istedik:

• %0 Üyelik, Listeleme ve Başvuru Ücreti (Abonelik veya jeton yok)
• Tamamlanan İş Birliklerinde %85 Brüt Üretici Hakedişi (%15 sabit platform komisyonu)
• Ödeme Bloke (Escrow) Güvencesi: Marka ödemesi bloke edilmeden çekime başlama riski yok
• 6 Boyutlu Telif & Kullanım Hakkı Koruması: Organik paylaşım ve Paid Ads reklam süreleri sipariş başında sabitlenir

Ücretsiz influencer ve UGC vitrininizi 2 dakikada oluşturmak için:
https://www.influnex.com.tr/tr/kayit?role=CREATOR

Sorularınız için bu mesaja doğrudan yanıt verebilirsiniz.
Sevgiler,
InfluNex Ekibi
https://www.influnex.com.tr`,
  },
  {
    id: "ugc-invite",
    label: "2. UGC & Performans Reklam Kreatifi Daveti",
    subject:
      "Markalar İçin UGC Video Üretimi & Reklam İş Birlikleri — InfluNex Daveti",
    buildBody: ({ name, handle, category }) =>
      `Merhaba ${name} (${handle}),

E-ticaret ve ${category} markalarının Meta, TikTok ve YouTube reklamlarında kullanabileceği doğal UGC videoları için InfluNex üzerinde doğrulanmış üretici ağımızı genişletiyoruz.

Kendi hesabınızda paylaşım şartı olmadan, yalnızca markalara video teslim ederek %85 brüt hakedişle gelir elde edebileceğiniz UGC paketlerinizi ücretsiz tanımlayabilirsiniz:

Hemen katılmak için:
https://www.influnex.com.tr/tr/kayit?role=CREATOR

İyi çalışmalar dileriz,
InfluNex Ekibi
https://www.influnex.com.tr`,
  },
  {
    id: "vip-leader",
    label: "3. Öncelikli Kategori Lideri & Doğrulanmış Rozet Daveti",
    subject:
      "InfluNex Kategori Lideri & Doğrulanmış Vitrin Rozeti Daveti",
    buildBody: ({ name, handle, city, category }) =>
      `Merhaba ${name} (${handle}),

InfluNex'te ${city} / ${category} kategorisinde öncelikli "Doğrulanmış İçerik Üreticisi" rozetiyle yer almanız için özel davetimizi iletiyoruz.

Google ve yapay zekâ aramalarında markaların sizi doğrudan bulabileceği kişisel SEO vitrininizi oluşturmak ve açık kampanya brieflerine teklif vermek tamamen ücretsizdir:

Kaydınızı oluşturun, Süperadmin ekibimiz doğrulama rozetinizi hemen tanımlasın:
https://www.influnex.com.tr/tr/kayit?role=CREATOR

Saygılarımızla,
InfluNex Yönetimi
https://www.influnex.com.tr`,
  },
];

export function ThousandCreatorsCrmSection({
  locale = "tr",
}: {
  locale?: string;
}) {
  const [queryText, setQueryText] = useState("");
  const [citySlug, setCitySlug] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [platform, setPlatform] = useState("");
  const [onlyWithRealEmail, setOnlyWithRealEmail] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Store only real external emails entered or imported by the admin (zero fake @creators.influnex.com.tr emails!)
  const [customEmails, setCustomEmails] = useState<Record<string, string>>({});
  const [bulkEmailInput, setBulkEmailInput] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<string>("creator-85");
  const [copiedId, setCopiedId] = useState<string>("");
  const [statusBanner, setStatusBanner] = useState<string>("");

  const activeTemplate =
    OUTREACH_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
    OUTREACH_TEMPLATES[0]!;

  const allContacts = useMemo(
    () => marketplaceStore.searchAdminCreatorContacts({ limit: 1000 }).items,
    []
  );

  const contactsWithRealEmailsCount = useMemo(
    () =>
      Object.values(customEmails).filter(
        (val) => val && val.includes("@") && val.includes(".")
      ).length,
    [customEmails]
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
        c.platforms.includes(
          platform as CreatorOutreachContactRecord["primaryPlatform"]
        )
      );
    }
    if (onlyWithRealEmail) {
      list = list.filter((c) => {
        const em = customEmails[c.creatorId]?.trim();
        return Boolean(em && em.includes("@"));
      });
    }
    if (queryText.trim()) {
      const q = queryText.trim().toLowerCase();
      list = list.filter((c) => {
        const em = (customEmails[c.creatorId] || "").toLowerCase();
        return (
          c.displayName.toLowerCase().includes(q) ||
          em.includes(q) ||
          c.socialHandle.toLowerCase().includes(q) ||
          c.cityNameTr.toLowerCase().includes(q) ||
          c.primaryCategoryNameTr.toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [
    allContacts,
    citySlug,
    categorySlug,
    platform,
    onlyWithRealEmail,
    queryText,
    customEmails,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const currentSlice = filteredContacts.slice(startIdx, startIdx + pageSize);

  function handleBulkImportRealEmails(e: React.FormEvent) {
    e.preventDefault();
    const lines = bulkEmailInput
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    const nextMap = { ...customEmails };
    let matchedCount = 0;

    lines.forEach((line, index) => {
      // Accepts either "username_or_handle,email@domain.com" or plain "email@domain.com" (mapped sequentially)
      const parts = line.split(/[;, \t]+/).filter(Boolean);
      const emailPart = parts.find((p) => p.includes("@") && p.includes("."));
      if (!emailPart) return;

      const handleOrNamePart = parts.find((p) => p !== emailPart);
      if (handleOrNamePart) {
        const cleanKey = handleOrNamePart.replace(/^@/, "").toLowerCase();
        const found = allContacts.find(
          (c) =>
            c.username.toLowerCase().includes(cleanKey) ||
            c.socialHandle.toLowerCase().includes(cleanKey) ||
            c.displayName.toLowerCase().includes(cleanKey)
        );
        if (found) {
          nextMap[found.creatorId] = emailPart.trim();
          matchedCount++;
          return;
        }
      }

      const fallbackTarget = allContacts[index];
      if (fallbackTarget) {
        nextMap[fallbackTarget.creatorId] = emailPart.trim();
        matchedCount++;
      }
    });

    setCustomEmails(nextMap);
    setBulkEmailInput("");
    setStatusBanner(
      `${matchedCount} gerçek influencer e-posta adresi profillerle eşleştirildi. Artık tek tıkla tanıtım maili gönderebilirsiniz.`
    );
  }

  function buildGmailComposeUrl(toEmail: string, subject: string, body: string) {
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      toEmail
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function handleCopyInviteText(item: CreatorOutreachContactRecord) {
    const body = activeTemplate.buildBody({
      name: item.displayName,
      handle: item.socialHandle,
      city: item.cityNameTr,
      category: item.primaryCategoryNameTr,
    });
    navigator.clipboard.writeText(body);
    setCopiedId(item.creatorId);
    setStatusBanner(
      `${item.displayName} (${item.socialHandle}) için kişiselleştirilmiş tanıtım mesajı panoya kopyalandı.`
    );
    setTimeout(() => setCopiedId(""), 2500);
  }

  function handleSendBulkBccGmail() {
    const validEmails = Object.values(customEmails).filter(
      (em) => em && em.includes("@") && em.includes(".")
    );
    if (validEmails.length === 0) {
      setStatusBanner(
        "Toplu tanıtım maili göndermek için önce tablodan veya toplu yapıştırma kutusundan influencer'ların kendi gerçek e-posta adreslerini ekleyin."
      );
      return;
    }
    const body = activeTemplate.buildBody({
      name: "Değerli İçerik Üreticisi",
      handle: "@influencer",
      city: "Türkiye",
      category: "Dijital İçerik & UGC",
    });
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&bcc=${encodeURIComponent(
      validEmails.join(",")
    )}&su=${encodeURIComponent(activeTemplate.subject)}&body=${encodeURIComponent(
      body
    )}`;
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
  }

  function handleDownloadCsv() {
    const header =
      "\uFEFFSira;CreatorID;AdSoyad;KullaniciAdi;GercekEposta;SosyalMedyaHandle;Sehir;Kategori;AnaPlatform;TakipciSayisi;EtkilesimOraniYuzde;BaslangicPaketiBrutTL;UreticiPayi85TL;DogrulamaKaynagi;ProfilURL\n";
    const rows = filteredContacts
      .map((c, idx) => {
        const b = calculateCommissionBreakdown(c.startingPriceMinorUnits, "TRY");
        return [
          idx + 1,
          c.creatorId,
          c.displayName,
          c.username,
          customEmails[c.creatorId] || "",
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
    a.download = `influnex-1000-influencer-profil-ve-iletisim-listesi.csv`;
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
              <Send size={14} />
              1.000 Influencer Profil Rehberi & Tanıtım Mesajı Gönderici
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
              <ShieldCheck size={13} />
              Sıfır Sahte E-Posta • Yalnızca Kendi Gerçek Maillerine Gönderim
            </span>
          </div>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            Influencer Tanıtım, Davet & Outreach Merkezi ({allContacts.length}{" "}
            Profil)
          </h2>
          <p className="mt-1 max-w-3xl text-xs text-slate-600">
            Profillere sistem tarafından uydurma e-posta atanmaz. Influencer&apos;ın
            kendi biyografisindeki gerçek e-posta adresini tabloya girebilir
            veya topluca yapıştırabilirsiniz; e-postası girilen profillere tek
            tıkla <strong>Gmail / E-Posta Tanıtım Daveti</strong> gönderebilir,
            e-postası olmayanlara ise <strong>Instagram DM Tanıtım Mesajını</strong>{" "}
            kopyalayarak iletebilirsiniz.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSendBulkBccGmail}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-indigo-700"
          >
            <Mail size={15} />
            Gerçek Maili Olanlara Toplu Tanıtım Gönder ({contactsWithRealEmailsCount})
          </button>
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
          >
            <Download size={15} />
            Listeyi İndir (CSV)
          </button>
        </div>
      </div>

      {/* Outreach Template Selector + Bulk Real Email Import Box */}
      <div className="mt-5 grid grid-cols-1 gap-4 rounded-2xl border border-indigo-100 bg-slate-50 p-4 lg:grid-cols-12">
        <div className="space-y-2 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="outreach-tpl-select"
              className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-950"
            >
              <Sparkles size={14} className="text-indigo-600" />
              Gönderilecek Tanıtım & Davet Şablonu Seçin
            </label>
            <span className="text-[11px] font-semibold text-slate-500">
              Otomatik Kişiselleştirme: Ad Soyad, @handle, Şehir, Kategori
            </span>
          </div>
          <select
            id="outreach-tpl-select"
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900"
          >
            {OUTREACH_TEMPLATES.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.label} — Konu: {tpl.subject}
              </option>
            ))}
          </select>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-[11px] leading-relaxed text-slate-700">
            <strong className="block text-slate-900">
              Konu: {activeTemplate.subject}
            </strong>
            <p className="mt-1 whitespace-pre-line">
              {activeTemplate.buildBody({
                name: "{Influencer Adı}",
                handle: "{@handle}",
                city: "{Şehir}",
                category: "{Kategori}",
              })}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleBulkImportRealEmails}
          className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 lg:col-span-5"
        >
          <div>
            <label
              htmlFor="bulk-real-emails"
              className="block text-xs font-extrabold text-slate-900"
            >
              Influencer&apos;ların Kendi Gerçek E-Posta Listesini Yapıştır
            </label>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Her satıra <code>@kullaniciadi eposta@gmail.com</code> veya
              doğrudan gerçek e-posta adreslerini yapıştırın:
            </p>
            <textarea
              id="bulk-real-emails"
              rows={5}
              value={bulkEmailInput}
              onChange={(e) => setBulkEmailInput(e.target.value)}
              placeholder={`Örn:\n@emretorosauto iletisim@emretoros.com\n@selinakalin pr@selinakalin.com\ninfo@creatorajans.com`}
              className="mt-2 w-full rounded-xl border border-slate-300 p-2.5 font-mono text-xs"
            />
          </div>
          <button
            type="submit"
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-700"
          >
            <Plus size={15} />
            Gerçek E-Postaları Profillere Eşleştir
          </button>
        </form>
      </div>

      {statusBanner ? (
        <div
          role="status"
          className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-950"
        >
          ✓ {statusBanner}
        </div>
      ) : null}

      {/* Filters Row */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-12">
        <div className="relative sm:col-span-4">
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
            placeholder="1.000 profil içinde ara (isim, @handle, şehir)..."
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
            <option value="">Tüm Şehirler</option>
            {INITIAL_CITIES.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.nameTr}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={categorySlug}
            onChange={(e) => {
              setCategorySlug(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold"
          >
            <option value="">Tüm Kategoriler</option>
            {INITIAL_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.slugTr}>
                {cat.nameTr}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={onlyWithRealEmail}
              onChange={(e) => {
                setOnlyWithRealEmail(e.target.checked);
                setPage(1);
              }}
              className="rounded border-slate-300 text-indigo-600"
            />
            Sadece Maili Olanlar ({contactsWithRealEmailsCount})
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 uppercase text-slate-500">
              <th className="px-3 py-2.5">#</th>
              <th className="px-3 py-2.5">Influencer & Handle</th>
              <th className="px-3 py-2.5">Şehir & Kategori</th>
              <th className="px-3 py-2.5">Takipçi & ER</th>
              <th className="px-3 py-2.5">
                Influencer&apos;ın Kendi E-Postası (Varsa Girin)
              </th>
              <th className="px-3 py-2.5">Tanıtım & Davet Gönder</th>
              <th className="px-3 py-2.5">Profil</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentSlice.map((item, idx) => {
              const realEmail = (customEmails[item.creatorId] || "").trim();
              const hasValidRealEmail =
                realEmail.includes("@") && realEmail.includes(".");
              const personalizedBody = activeTemplate.buildBody({
                name: item.displayName,
                handle: item.socialHandle,
                city: item.cityNameTr,
                category: item.primaryCategoryNameTr,
              });
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
                      {item.socialHandle} • {item.primaryPlatform}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-semibold text-slate-800">
                      {item.cityNameTr}
                    </span>{" "}
                    •{" "}
                    <span className="text-slate-600">
                      {item.primaryCategoryNameTr}
                    </span>
                    <span className="block text-[11px] text-emerald-700">
                      Paket:{" "}
                      {formatMinorUnits(breakdown.grossAmountMinorUnits)} (%85:{" "}
                      {formatMinorUnits(breakdown.creatorNetPayoutMinorUnits)})
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
                    <input
                      type="email"
                      value={realEmail}
                      onChange={(e) =>
                        setCustomEmails((prev) => ({
                          ...prev,
                          [item.creatorId]: e.target.value,
                        }))
                      }
                      placeholder="Kendi maili varsa girin..."
                      className="w-52 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs focus:border-indigo-600"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {hasValidRealEmail ? (
                        <>
                          <a
                            href={buildGmailComposeUrl(
                              realEmail,
                              activeTemplate.subject,
                              personalizedBody
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 font-bold text-white hover:bg-emerald-700"
                          >
                            <Mail size={12} />
                            Gmail ile Tanıtım Yolla
                          </a>
                          <a
                            href={`mailto:${realEmail}?subject=${encodeURIComponent(
                              activeTemplate.subject
                            )}&body=${encodeURIComponent(personalizedBody)}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1.5 font-bold text-emerald-900 hover:bg-emerald-100"
                          >
                            Mail Uygulaması
                          </a>
                        </>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleCopyInviteText(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 font-bold text-indigo-900 hover:bg-indigo-100"
                      >
                        {copiedId === item.creatorId ? (
                          <>
                            <Check size={12} />
                            Kopyalandı
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            DM Tanıtım Kopyala
                          </>
                        )}
                      </button>
                      <a
                        href={`https://www.instagram.com/${item.socialHandle.replace(
                          /^@/,
                          ""
                        )}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Instagram profilini kontrol et"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-semibold text-slate-700 hover:border-pink-300 hover:text-pink-700"
                      >
                        <MessageSquareShare size={12} />
                        IG
                      </a>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/${locale}/influencer/${item.username}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-bold text-indigo-700 hover:border-indigo-400"
                    >
                      Vitrin
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
          influencer profilinden{" "}
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
