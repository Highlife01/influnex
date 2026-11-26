"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  Award,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Compass,
  CreditCard,
  Crown,
  Database,
  Download,
  FileCheck2,
  Globe,
  LayoutDashboard,
  Lock,
  LogOut,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import type { UserRole } from "@/lib/types/domain";
import { SUPER_ADMIN_EMAIL, isSuperAdminEmail } from "@/lib/auth/roles";
import {
  calculateCommissionBreakdown,
  formatMinorUnits,
} from "@/lib/finance/commission";
import { getInfluNexAuth } from "@/lib/firebase/client";
import { INITIAL_CATEGORIES, INITIAL_CITIES } from "@/lib/data/catalog";

type WorkspaceRole = UserRole;

interface RoleDashboardProps {
  locale: string;
  role: WorkspaceRole;
}

interface CreatorDraftService {
  id: string;
  title: string;
  platform: "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "UGC";
  priceTl: number;
  deliveryDays: number;
  revisions: number;
  usageScope: string;
}

interface AdminVerificationItem {
  id: string;
  name: string;
  handle: string;
  city: string;
  category: string;
  followers: string;
  er: string;
  badge: "API_VERIFIED" | "ADMIN_VERIFIED" | "USER_DECLARED";
  status: "APPROVED" | "PENDING_REVIEW";
}

interface AdminLedgerOrder {
  orderCode: string;
  brandName: string;
  creatorName: string;
  serviceTitle: string;
  grossTl: number;
  bankTransactionRef: string;
  state: "PAYMENT_REVIEW" | "PAID" | "COMPLETED" | "PAYOUT_COMPLETED";
  adDisclosureVerified: boolean;
}

const INITIAL_ADMIN_CREATORS: AdminVerificationItem[] = [
  {
    id: "cr-adana-guzellik-guldkoc",
    name: "Gül Koç (👑 Influencer Lideri)",
    handle: "@guldkoc",
    city: "Adana",
    category: "Güzellik, Moda & UGC",
    followers: "10.398",
    er: "%5.80",
    badge: "ADMIN_VERIFIED",
    status: "APPROVED",
  },
  {
    id: "cr-adana-oto-emre",
    name: "Emre Toros",
    handle: "@emretorosauto",
    city: "Adana",
    category: "Otomotiv",
    followers: "148.000",
    er: "%4.25",
    badge: "ADMIN_VERIFIED",
    status: "APPROVED",
  },
  {
    id: "cr-ist-moda-selin",
    name: "Selin Aksoy",
    handle: "@selinaksoystyle",
    city: "İstanbul",
    category: "Moda & Stil",
    followers: "290.000",
    er: "%4.38",
    badge: "API_VERIFIED",
    status: "APPROVED",
  },
  {
    id: "cr-ank-tech-mert",
    name: "Mert Kaya",
    handle: "@mertkayatech",
    city: "Ankara",
    category: "Teknoloji",
    followers: "210.000",
    er: "%5.12",
    badge: "ADMIN_VERIFIED",
    status: "APPROVED",
  },
  {
    id: "cr-izm-ugc-zeynep",
    name: "Zeynep Demir",
    handle: "@zeynepugcstudio",
    city: "İzmir",
    category: "Güzellik & UGC",
    followers: "42.500",
    er: "%6.40",
    badge: "USER_DECLARED",
    status: "PENDING_REVIEW",
  },
];

const INITIAL_LEDGER_ORDERS: AdminLedgerOrder[] = [
  {
    orderCode: "INF-2026-000001",
    brandName: "Toros Auto Care",
    creatorName: "Emre Toros",
    serviceTitle: "1 Adet 60 sn Otomotiv Reels + 2 Story",
    grossTl: 10000,
    bankTransactionRef: "TR-FAST-9081421",
    state: "PAID",
    adDisclosureVerified: true,
  },
  {
    orderCode: "INF-2026-000002",
    brandName: "Natura Derm Kozmetik",
    creatorName: "Selin Aksoy",
    serviceTitle: "Instagram Reels + 30 Gün Meta Paid Ads",
    grossTl: 14500,
    bankTransactionRef: "TR-EFT-7745120",
    state: "PAYMENT_REVIEW",
    adDisclosureVerified: false,
  },
  {
    orderCode: "INF-2026-000003",
    brandName: "NovaTech Türkiye",
    creatorName: "Mert Kaya",
    serviceTitle: "YouTube 90 sn Entegre Ürün İncelemesi",
    grossTl: 18000,
    bankTransactionRef: "TR-FAST-6629018",
    state: "COMPLETED",
    adDisclosureVerified: true,
  },
];

export function RoleDashboard({ locale, role }: RoleDashboardProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [activeViewRole, setActiveViewRole] = useState<WorkspaceRole>(role);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // SuperAdmin state
  const [adminCreators, setAdminCreators] = useState<AdminVerificationItem[]>(
    INITIAL_ADMIN_CREATORS
  );
  const [ledgerOrders, setLedgerOrders] =
    useState<AdminLedgerOrder[]>(INITIAL_LEDGER_ORDERS);
  const [adminNotice, setAdminNotice] = useState<string>("");

  // Creator state
  const [creatorServices, setCreatorServices] = useState<CreatorDraftService[]>([
    {
      id: "srv-1",
      title: "1 Adet 60 sn Instagram Reels + 2 Story (Organik #reklam)",
      platform: "INSTAGRAM",
      priceTl: 8500,
      deliveryDays: 4,
      revisions: 2,
      usageScope: "Organik Paylaşım + 30 Gün Profilde Sabit",
    },
    {
      id: "srv-2",
      title: "UGC 9:16 Performans Reklam Videosu (3 Kanca Varyasyonlu)",
      platform: "UGC",
      priceTl: 5500,
      deliveryDays: 3,
      revisions: 2,
      usageScope: "Marka Meta & TikTok Paid Ads (90 Gün)",
    },
  ]);
  const [newPkgTitle, setNewPkgTitle] = useState("");
  const [newPkgPlatform, setNewPkgPlatform] = useState<
    "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "UGC"
  >("INSTAGRAM");
  const [newPkgPriceTl, setNewPkgPriceTl] = useState(10000);
  const [newPkgDeliveryDays, setNewPkgDeliveryDays] = useState(4);
  const [newPkgRevisions, setNewPkgRevisions] = useState(2);
  const [newPkgUsage, setNewPkgUsage] = useState(
    "Organik Paylaşım + 30 Gün Dijital Kullanım"
  );
  const [creatorPublishUrl, setCreatorPublishUrl] = useState(
    "https://www.instagram.com/guldkoc/reel/DdTk6LpOFws/?caption=%23reklam"
  );
  const [creatorDeliveryMsg, setCreatorDeliveryMsg] = useState("");

  // Advertiser state
  const [advBrandName, setAdvBrandName] = useState("Toros Auto Care");
  const [advWebsite, setAdvWebsite] = useState("https://torosautocare.com.tr");
  const [advBriefDesc, setAdvBriefDesc] = useState(
    "Nano seramik hızlı cila ve su itici araç bakım kiti için 60 sn uygulama videosu"
  );
  const [advBudgetTl, setAdvBudgetTl] = useState(12000);
  const [advAiResult, setAdvAiResult] = useState<Record<string, unknown> | null>(
    null
  );

  useEffect(() => {
    setActiveViewRole(role);
  }, [role]);

  useEffect(() => {
    const auth = getInfluNexAuth();
    return onAuthStateChanged(
      auth,
      async (nextUser) => {
        if (!nextUser) {
          setUser(null);
          setChecking(false);
          return;
        }

        try {
          const token = await nextUser.getIdTokenResult();
          const superAdminMatch = isSuperAdminEmail(nextUser.email);
          const claimRole = token.claims.role as WorkspaceRole | undefined;
          const effectiveRole: WorkspaceRole = superAdminMatch
            ? "ADMIN"
            : claimRole === "ADMIN" ||
                claimRole === "CREATOR" ||
                claimRole === "ADVERTISER"
              ? claimRole
              : role;

          setUser(nextUser);

          // If non-superadmin tries to open /yonetim, route them to their own role dashboard
          if (!superAdminMatch && role === "ADMIN" && effectiveRole !== "ADMIN") {
            const destination =
              effectiveRole === "CREATOR"
                ? `/${locale}/yayinci/panel`
                : `/${locale}/reklamveren/panel`;
            router.replace(destination);
            return;
          }

          setChecking(false);
        } catch {
          setUser(nextUser);
          setChecking(false);
        }
      },
      () => {
        setChecking(false);
      }
    );
  }, [locale, role, router]);

  async function handleSignOut() {
    await signOut(getInfluNexAuth());
    router.replace(`/${locale}/giris`);
  }

  function handleAddCreatorPackage(e: React.FormEvent) {
    e.preventDefault();
    if (!newPkgTitle.trim()) return;
    setCreatorServices((prev) => [
      {
        id: `srv-${Date.now()}`,
        title: newPkgTitle.trim(),
        platform: newPkgPlatform,
        priceTl: Number(newPkgPriceTl),
        deliveryDays: Number(newPkgDeliveryDays),
        revisions: Number(newPkgRevisions),
        usageScope: newPkgUsage,
      },
      ...prev,
    ]);
    setNewPkgTitle("");
  }

  function handleApproveCreator(id: string) {
    setAdminCreators((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: "APPROVED", badge: "ADMIN_VERIFIED" }
          : c
      )
    );
    setAdminNotice(
      "Influencer profili ADMIN_VERIFIED rozetiyle onaylandı ve vitrine açıldı."
    );
  }

  function handleAdvanceOrderState(orderCode: string) {
    setLedgerOrders((prev) =>
      prev.map((ord) => {
        if (ord.orderCode !== orderCode) return ord;
        if (ord.state === "PAYMENT_REVIEW") {
          setAdminNotice(
            `${orderCode} dekontu (${ord.bankTransactionRef}) doğrulandı ve tutar PAID (Bloke) durumuna alındı.`
          );
          return { ...ord, state: "PAID" };
        }
        if (ord.state === "PAID") {
          setAdminNotice(
            `${orderCode} içeriği ve #reklam etiketi doğrulandı; sipariş COMPLETED durumuna geçti.`
          );
          return { ...ord, state: "COMPLETED", adDisclosureVerified: true };
        }
        if (ord.state === "COMPLETED") {
          setAdminNotice(
            `${orderCode} için %85 üretici hakedişi banka referansıyla ödendi (PAYOUT_COMPLETED).`
          );
          return { ...ord, state: "PAYOUT_COMPLETED" };
        }
        return ord;
      })
    );
  }

  function handleExportLedgerCsv() {
    const header =
      "\uFEFFSiparisKodu;Marka;Influencer;BrutTutarTL;Komisyon15TL;UreticiPayi85TL;BankaRef;Durum\n";
    const rows = ledgerOrders
      .map((o) => {
        const b = calculateCommissionBreakdown(o.grossTl * 100, "TRY");
        return `${o.orderCode};${o.brandName};${o.creatorName};${o.grossTl};${b.platformCommissionMinorUnits / 100};${b.creatorNetPayoutMinorUnits / 100};${o.bankTransactionRef};${o.state}`;
      })
      .join("\n");
    const blob = new Blob([header + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `influnex-muhasebe-defteri-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleGenerateAdvAiBrief(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/campaigns/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: advBrandName,
          brandWebsite: advWebsite,
          productDescription: advBriefDesc,
          budgetMinorUnits: Math.round(advBudgetTl * 100),
          locale: "tr",
        }),
      });
      const data = await res.json();
      if (res.ok) setAdvAiResult(data);
    } catch {
      // ignore
    }
  }

  const totalLedgerGrossMinor = ledgerOrders.reduce(
    (acc, o) => acc + o.grossTl * 100,
    0
  );
  const totalLedgerBreakdown = calculateCommissionBreakdown(
    totalLedgerGrossMinor,
    "TRY"
  );

  const isCurrentUserSuperAdmin =
    isSuperAdminEmail(user?.email) || activeViewRole === "ADMIN";

  if (checking) {
    return (
      <main className="grid min-h-[65vh] place-items-center px-4">
        <p className="text-sm font-semibold text-slate-600" role="status">
          Kontrol paneli yükleniyor…
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-[82vh] bg-slate-100/80 pb-16">
      {/* Top Executive Identity & SuperAdmin Switcher Bar */}
      <div className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 font-bold text-indigo-300">
              <Crown size={14} />
              Süperadmin Yetkili Hesap: {SUPER_ADMIN_EMAIL}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 font-bold text-emerald-300">
              <Database size={13} />
              4-Katmanlı Veri İzolasyonu: influnex-db
            </span>
            {user ? (
              <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-slate-200">
                Aktif Oturum: {user.email}
              </span>
            ) : (
              <Link
                href={`/${locale}/giris`}
                className="rounded-full bg-amber-400/20 px-3 py-1 font-bold text-amber-200 hover:bg-amber-400/30"
              >
                Canlı Etkileşimli Kokpit • Google ile Giriş Yap →
              </Link>
            )}
          </div>

          {/* 1-Click Role Cockpit Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">
              Kokpit Görünümü:
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveViewRole("ADMIN");
                setActiveTab("overview");
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                activeViewRole === "ADMIN"
                  ? "bg-indigo-600 text-white"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              Süperadmin
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveViewRole("CREATOR");
                setActiveTab("overview");
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                activeViewRole === "CREATOR"
                  ? "bg-emerald-600 text-white"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              Influencer / UGC (%85)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveViewRole("ADVERTISER");
                setActiveTab("overview");
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                activeViewRole === "ADVERTISER"
                  ? "bg-violet-600 text-white"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              Reklamveren
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 pt-8 lg:grid-cols-[260px_1fr] lg:px-8">
        {/* Sidebar Navigation */}
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <img
              src="/icon-mark.png?v=2"
              alt="InfluNex"
              width={44}
              height={44}
              className="size-11 rounded-xl object-contain"
            />
            <div>
              <p className="font-black tracking-tight text-slate-950">
                InfluNex Pro
              </p>
              <p className="text-[11px] font-bold text-indigo-600">
                {activeViewRole === "ADMIN"
                  ? "Süperadmin Yönetim Merkezi"
                  : activeViewRole === "CREATOR"
                    ? "Influencer & UGC Stüdyosu"
                    : "Marka & Kampanya Kokpiti"}
              </p>
            </div>
          </div>

          <nav aria-label="Panel menüsü" className="grid gap-1.5">
            {activeViewRole === "ADMIN" ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold ${
                    activeTab === "overview"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <LayoutDashboard size={17} />
                  Yönetici & Gelir Özeti
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("verifications")}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold ${
                    activeTab === "verifications"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Users size={17} />
                  Influencer Doğrulama & Rozet
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ledger")}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold ${
                    activeTab === "ledger"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <CreditCard size={17} />
                  Dekont & %85 Hakediş Defteri
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("seo")}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold ${
                    activeTab === "seo"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Globe size={17} />
                  SEO & GEO Kalite Kapısı
                </button>
              </>
            ) : activeViewRole === "CREATOR" ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold ${
                    activeTab === "overview"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <LayoutDashboard size={17} />
                  Kazanç & Performans Özeti
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("packages")}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold ${
                    activeTab === "packages"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <PlusCircle size={17} />
                  Hizmet Paketlerim (%85 Pay)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("delivery")}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold ${
                    activeTab === "delivery"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <FileCheck2 size={17} />
                  Sipariş Odası & #reklam Teslimi
                </button>
                <Link
                  href={`/${locale}/kampanyalar`}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  <Compass size={17} />
                  Açık Kampanyaları Keşfet
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold ${
                    activeTab === "overview"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <LayoutDashboard size={17} />
                  Kampanya & Sipariş Özeti
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("aibrief")}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold ${
                    activeTab === "aibrief"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Sparkles size={17} />
                  AI Kampanya Brief Asistanı
                </button>
                <Link
                  href={`/${locale}/influencer`}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  <Compass size={17} />
                  Influencer & UGC Keşfet
                </Link>
              </>
            )}
          </nav>

          {/* Account Identity Box */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-indigo-700">
                {isCurrentUserSuperAdmin ? "Süperadmin" : activeViewRole}
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-900">
                Aktif
              </span>
            </div>
            <p className="mt-1 truncate text-xs font-extrabold text-slate-900">
              {user?.displayName ||
                (activeViewRole === "ADMIN"
                  ? "Cebrail Kara (Süperadmin)"
                  : activeViewRole === "CREATOR"
                    ? "Gül Koç (@guldkoc • 👑 Influencer Lideri)"
                    : "Toros Auto Care (Marka)")}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-slate-500">
              {user?.email || SUPER_ADMIN_EMAIL}
            </p>
          </div>

          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              <LogOut size={15} />
              Oturumu Kapat
            </button>
          ) : (
            <Link
              href={`/${locale}/giris`}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
            >
              Google Hesabımla Bağlan
            </Link>
          )}
        </aside>

        {/* Main Workspace Content */}
        <section className="space-y-6">
          {/* ================================================================
              1. SUPERADMIN COCKPIT (cebrailkara@gmail.com)
             ================================================================ */}
          {activeViewRole === "ADMIN" ? (
            <>
              <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-6 text-white shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                      <Crown size={14} />
                      Süperadmin Yetkisi: {SUPER_ADMIN_EMAIL}
                    </span>
                    <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                      InfluNex Süperadmin, Muhasebe & SEO Komuta Merkezi
                    </h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-300">
                      4-Katmanlı Veri İzolasyonu (<code>influnex-db</code>),
                      kuruş hassasiyetli %15 komisyon / %85 üretici hakediş
                      defteri, tekil <code>bankTransactionRef</code> dekont
                      onayı ve 81 İl × 25 Kategori SEO kalite kontrolü.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportLedgerCsv}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-slate-950 shadow-sm hover:bg-emerald-400"
                  >
                    <Download size={15} />
                    Muhasebe Defterini İndir (UTF-8 CSV)
                  </button>
                </div>

                {/* 4 Executive Financial & Operational KPIs */}
                <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-slate-300">
                      Toplam Brüt İşlem Hacmi
                    </span>
                    <p className="mt-1 text-2xl font-black text-white">
                      {formatMinorUnits(
                        totalLedgerBreakdown.grossAmountMinorUnits
                      )}
                    </p>
                    <span className="text-[11px] text-emerald-300">
                      {ledgerOrders.length} Kayıtlı Sipariş Snapshot
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-indigo-300">
                      %15 Platform Komisyon Geliri
                    </span>
                    <p className="mt-1 text-2xl font-black text-indigo-300">
                      {formatMinorUnits(
                        totalLedgerBreakdown.platformCommissionMinorUnits
                      )}
                    </p>
                    <span className="text-[11px] text-slate-300">
                      1500 BPS Sabit Kesinti
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-emerald-300">
                      %85 Influencer Hakediş Havuzu
                    </span>
                    <p className="mt-1 text-2xl font-black text-emerald-400">
                      {formatMinorUnits(
                        totalLedgerBreakdown.creatorNetPayoutMinorUnits
                      )}
                    </p>
                    <span className="text-[11px] text-slate-300">
                      8500 BPS Brüt Üretici Payı
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-amber-300">
                      Onaylı & Bekleyen Üretici
                    </span>
                    <p className="mt-1 text-2xl font-black text-white">
                      {
                        adminCreators.filter((c) => c.status === "APPROVED")
                          .length
                      }{" "}
                      / {adminCreators.length}
                    </p>
                    <span className="text-[11px] text-amber-300">
                      18+ & Rozet Denetimli
                    </span>
                  </div>
                </div>
              </div>

              {adminNotice ? (
                <div
                  role="status"
                  className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-950"
                >
                  ✓ {adminNotice}
                </div>
              ) : null}

              {/* SuperAdmin Section A: Order Escrow, Bank Ref Verification & 85% Payout Table */}
              {(activeTab === "overview" || activeTab === "ledger") && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Havale / EFT / FAST Dekont & Hakediş Motoru
                      </span>
                      <h2 className="mt-0.5 text-lg font-black text-slate-950">
                        Sipariş Bloke, #reklam Kontrolü ve %85 Hakediş Dağıtım Tablosu
                      </h2>
                    </div>
                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      Mükerrer bankTransactionRef Engelli
                    </span>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 uppercase text-slate-500">
                          <th className="py-2.5">Sipariş Kodu</th>
                          <th className="py-2.5">Marka & Influencer</th>
                          <th className="py-2.5">Brüt Tutar</th>
                          <th className="py-2.5">%15 Komisyon</th>
                          <th className="py-2.5">%85 Üretici Payı</th>
                          <th className="py-2.5">Banka Ref</th>
                          <th className="py-2.5">Durum</th>
                          <th className="py-2.5">Süperadmin Aksiyonu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ledgerOrders.map((ord) => {
                          const b = calculateCommissionBreakdown(
                            ord.grossTl * 100,
                            "TRY"
                          );
                          return (
                            <tr key={ord.orderCode}>
                              <td className="py-3 font-mono font-bold text-indigo-950">
                                {ord.orderCode}
                              </td>
                              <td className="py-3">
                                <strong className="block text-slate-900">
                                  {ord.brandName} → {ord.creatorName}
                                </strong>
                                <span className="text-[11px] text-slate-500">
                                  {ord.serviceTitle}
                                </span>
                              </td>
                              <td className="py-3 font-bold text-slate-900">
                                {formatMinorUnits(b.grossAmountMinorUnits)}
                              </td>
                              <td className="py-3 font-bold text-indigo-700">
                                {formatMinorUnits(
                                  b.platformCommissionMinorUnits
                                )}
                              </td>
                              <td className="py-3 font-extrabold text-emerald-700">
                                {formatMinorUnits(b.creatorNetPayoutMinorUnits)}
                              </td>
                              <td className="py-3 font-mono text-[11px] text-slate-600">
                                {ord.bankTransactionRef}
                              </td>
                              <td className="py-3">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-0.5 font-bold ${
                                    ord.state === "PAYOUT_COMPLETED"
                                      ? "bg-emerald-100 text-emerald-900"
                                      : ord.state === "COMPLETED"
                                        ? "bg-indigo-100 text-indigo-900"
                                        : ord.state === "PAID"
                                          ? "bg-cyan-100 text-cyan-900"
                                          : "bg-amber-100 text-amber-900"
                                  }`}
                                >
                                  {ord.state}
                                </span>
                              </td>
                              <td className="py-3">
                                {ord.state !== "PAYOUT_COMPLETED" ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAdvanceOrderState(ord.orderCode)
                                    }
                                    className="rounded-lg bg-indigo-600 px-3 py-1.5 font-bold text-white hover:bg-indigo-700"
                                  >
                                    {ord.state === "PAYMENT_REVIEW"
                                      ? "Dekontu Onayla (PAID)"
                                      : ord.state === "PAID"
                                        ? "#reklam & Teslim Onayla"
                                        : "%85 Hakedişi Öde"}
                                  </button>
                                ) : (
                                  <span className="font-bold text-emerald-700">
                                    ✓ Hakediş Aktarıldı
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SuperAdmin Section B: Creator Verification & Badge Queue */}
              {(activeTab === "overview" || activeTab === "verifications") && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        3 Katmanlı Metrik & Kimlik Doğrulama
                      </span>
                      <h2 className="mt-0.5 text-lg font-black text-slate-950">
                        Influencer & UGC Üretici Doğrulama Kuyruğu
                      </h2>
                    </div>
                    <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                      PII / IBAN İzole: influnex_privateCreatorProfiles
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {adminCreators.map((cr) => (
                      <div
                        key={cr.id}
                        className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-sm font-black text-slate-950">
                                {cr.name}
                              </strong>
                              <span className="text-xs text-slate-500">
                                {cr.handle}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-600">
                              {cr.city} • {cr.category} • Takipçi:{" "}
                              <strong>{cr.followers}</strong> • ER:{" "}
                              <strong className="text-emerald-700">
                                {cr.er}
                              </strong>
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              cr.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-900"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            {cr.badge}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-xs">
                          <span className="text-slate-500">
                            Durum: <strong>{cr.status}</strong>
                          </span>
                          {cr.status === "PENDING_REVIEW" ? (
                            <button
                              type="button"
                              onClick={() => handleApproveCreator(cr.id)}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-700"
                            >
                              ADMIN_VERIFIED Onayla & Vitrine Aç
                            </button>
                          ) : (
                            <span className="font-bold text-emerald-700">
                              ✓ Vitrinde Yayında
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SuperAdmin Section C: SEO & GEO Quality Gate Status */}
              {(activeTab === "overview" || activeTab === "seo") && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Googlebot & LLM / GEO İndeksleme Denetimi
                      </span>
                      <h2 className="mt-0.5 text-lg font-black text-slate-950">
                        SEO & GEO Programatik Kalite Kapısı (Index Quality Gate)
                      </h2>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href="/sitemap.xml"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        /sitemap.xml Aç ↗
                      </a>
                      <a
                        href="/robots.txt"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        /robots.txt Aç ↗
                      </a>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    Canlı domain <code>https://www.influnex.com.tr</code>{" "}
                    üzerinde <code>/robots.txt</code> ve{" "}
                    <code>/sitemap.xml</code> Googlebot taramasına tamamen
                    açıktır (Allow: /). Minimum 3 onaylı profil eşiğinin
                    altındaki kombinasyonlar otomatik <code>noindex, follow</code>{" "}
                    korumasındadır.
                  </p>
                </div>
              )}
            </>
          ) : null}

          {/* ================================================================
              2. CREATOR / INFLUENCER & UGC COCKPIT (%85 Payout)
             ================================================================ */}
          {activeViewRole === "CREATOR" ? (
            <>
              <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 p-6 text-white shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300">
                      <Crown size={14} />
                      👑 Influencer Lideri: Gül Koç (@guldkoc) • %85 Brüt Hakediş (8500 BPS)
                    </span>
                    <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                      Hoş Geldin Gül Koç, Influencer Lideri Kokpiti
                    </h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-emerald-100">
                      Hizmet paketlerini oluştur, kendi fiyatını ve 6 boyutlu
                      telif/kullanım hakkı sınırlarını belirle. Ödeme bloke
                      edilmeden çekime başlama riski olmadan %85 hakedişle kazan.
                    </p>
                  </div>
                  <Link
                    href={`/${locale}/influencer/guldkoc`}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-950 shadow-sm hover:bg-emerald-50"
                  >
                    <Globe size={15} />
                    Canlı SEO Vitrinimi Gör (@guldkoc) ↗
                  </Link>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-emerald-200">
                      Tamamlanan İş Hakedişi (%85)
                    </span>
                    <p className="mt-1 text-2xl font-black text-emerald-300">
                      23.800,00 TL
                    </p>
                    <span className="text-[11px] text-slate-300">
                      Brüt 28.000 TL üzerinden
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-cyan-200">
                      Bloke Güvencedeki Sipariş
                    </span>
                    <p className="mt-1 text-2xl font-black text-white">
                      8.500,00 TL
                    </p>
                    <span className="text-[11px] text-cyan-300">
                      INF-2026-000001 (PAID)
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-amber-200">
                      Aktif Hizmet Paketim
                    </span>
                    <p className="mt-1 text-2xl font-black text-white">
                      {creatorServices.length} Paket
                    </p>
                    <span className="text-[11px] text-slate-300">
                      Instagram & UGC
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-indigo-200">
                      Doğrulanmış Etkileşim (ER)
                    </span>
                    <p className="mt-1 text-2xl font-black text-white">%4.25</p>
                    <span className="text-[11px] text-emerald-300">
                      ADMIN_VERIFIED Rozetli
                    </span>
                  </div>
                </div>
              </div>

              {/* Creator Service Package Builder */}
              {(activeTab === "overview" || activeTab === "packages") && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs lg:col-span-7">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Vitrin Hizmet Paketlerim
                    </span>
                    <h2 className="mt-1 text-lg font-black text-slate-950">
                      Aktif Influencer & UGC Paketlerim
                    </h2>
                    <div className="mt-4 space-y-3">
                      {creatorServices.map((srv) => {
                        const b = calculateCommissionBreakdown(
                          srv.priceTl * 100,
                          "TRY"
                        );
                        return (
                          <div
                            key={srv.id}
                            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-900">
                                  {srv.platform}
                                </span>
                                <h3 className="mt-1.5 text-sm font-black text-slate-950">
                                  {srv.title}
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-600">
                                  Teslim: {srv.deliveryDays} Gün •{" "}
                                  {srv.revisions} Revizyon • {srv.usageScope}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="block text-[11px] text-slate-500">
                                  Marka Brüt Bedeli
                                </span>
                                <strong className="text-base font-black text-slate-950">
                                  {formatMinorUnits(b.grossAmountMinorUnits)}
                                </strong>
                                <span className="mt-0.5 block text-xs font-extrabold text-emerald-700">
                                  Senin %85 Payın:{" "}
                                  {formatMinorUnits(
                                    b.creatorNetPayoutMinorUnits
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add New Service Package Form */}
                  <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-2xs lg:col-span-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Yeni Paket Tanımla
                    </span>
                    <h2 className="mt-1 text-lg font-black text-slate-950">
                      Hizmet Paketi & %85 Pay Hesaplayıcı
                    </h2>
                    <form
                      onSubmit={handleAddCreatorPackage}
                      className="mt-4 space-y-3 text-xs"
                    >
                      <div>
                        <label
                          htmlFor="pkg-title"
                          className="block font-bold text-slate-700"
                        >
                          Paket Başlığı
                        </label>
                        <input
                          id="pkg-title"
                          type="text"
                          required
                          value={newPkgTitle}
                          onChange={(e) => setNewPkgTitle(e.target.value)}
                          placeholder="Örn: 1 Adet 60 sn TikTok + Spark Ads Kodu"
                          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="pkg-plat"
                            className="block font-bold text-slate-700"
                          >
                            Kanal
                          </label>
                          <select
                            id="pkg-plat"
                            value={newPkgPlatform}
                            onChange={(e) =>
                              setNewPkgPlatform(
                                e.target.value as
                                  | "INSTAGRAM"
                                  | "TIKTOK"
                                  | "YOUTUBE"
                                  | "UGC"
                              )
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                          >
                            <option value="INSTAGRAM">INSTAGRAM</option>
                            <option value="TIKTOK">TIKTOK</option>
                            <option value="YOUTUBE">YOUTUBE</option>
                            <option value="UGC">UGC Kreatif</option>
                          </select>
                        </div>
                        <div>
                          <label
                            htmlFor="pkg-price"
                            className="block font-bold text-slate-700"
                          >
                            Brüt Paket Fiyatı (TL)
                          </label>
                          <input
                            id="pkg-price"
                            type="number"
                            min={500}
                            step={250}
                            value={newPkgPriceTl}
                            onChange={(e) =>
                              setNewPkgPriceTl(Number(e.target.value))
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="pkg-days"
                            className="block font-bold text-slate-700"
                          >
                            Teslim Süresi (Gün)
                          </label>
                          <input
                            id="pkg-days"
                            type="number"
                            min={1}
                            max={30}
                            value={newPkgDeliveryDays}
                            onChange={(e) =>
                              setNewPkgDeliveryDays(Number(e.target.value))
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="pkg-rev"
                            className="block font-bold text-slate-700"
                          >
                            Revizyon Hakkı
                          </label>
                          <input
                            id="pkg-rev"
                            type="number"
                            min={0}
                            max={5}
                            value={newPkgRevisions}
                            onChange={(e) =>
                              setNewPkgRevisions(Number(e.target.value))
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="pkg-usage"
                          className="block font-bold text-slate-700"
                        >
                          6 Boyutlu Telif & Kullanım Hakkı Kapsamı
                        </label>
                        <input
                          id="pkg-usage"
                          type="text"
                          value={newPkgUsage}
                          onChange={(e) => setNewPkgUsage(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                        />
                      </div>

                      <div className="rounded-xl bg-emerald-50 p-3 text-emerald-950">
                        <div className="flex justify-between">
                          <span>Platform Komisyonu (%15):</span>
                          <strong>
                            {(newPkgPriceTl * 0.15).toLocaleString("tr-TR")} TL
                          </strong>
                        </div>
                        <div className="mt-1 flex justify-between text-sm font-black text-emerald-800">
                          <span>Senin %85 Brüt Hakedişin:</span>
                          <span>
                            {(newPkgPriceTl * 0.85).toLocaleString("tr-TR")} TL
                          </span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-white hover:bg-emerald-700"
                      >
                        + Hizmet Paketini Vitrine Ekle
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Creator Order Room & #reklam Disclosure Submission */}
              {(activeTab === "overview" || activeTab === "delivery") && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Aktif Sipariş Odası • INF-2026-000001 (Bloke: 10.000 TL)
                  </span>
                  <h2 className="mt-1 text-lg font-black text-slate-950">
                    İçerik Teslimi & Ticaret Bakanlığı #reklam Yayın Doğrulaması
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">
                    Yayın bağlantınızda <code>#reklam</code> veya{" "}
                    <code>#işbirliği</code> açıklaması doğrulandığında sipariş{" "}
                    <code>COMPLETED</code> durumuna geçer ve{" "}
                    <strong>8.500,00 TL (%85)</strong> hakedişiniz ödeme
                    kuyruğuna alınır.
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="url"
                      value={creatorPublishUrl}
                      onChange={(e) => setCreatorPublishUrl(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setCreatorDeliveryMsg(
                          "Yayın bağlantısı ve #reklam etiketi doğrulandı! 8.500,00 TL (%85) brüt hakedişiniz PAYOUT_PENDING ödeme kuyruğuna aktarıldı."
                        )
                      }
                      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
                    >
                      Yayın Linkini & #reklam Etiketini Doğrula
                    </button>
                  </div>
                  {creatorDeliveryMsg ? (
                    <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-900">
                      ✓ {creatorDeliveryMsg}
                    </p>
                  ) : null}
                </div>
              )}
            </>
          ) : null}

          {/* ================================================================
              3. ADVERTISER / BRAND COCKPIT
             ================================================================ */}
          {activeViewRole === "ADVERTISER" ? (
            <>
              <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-950 via-violet-950 to-slate-950 p-6 text-white shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-400/20 px-3 py-1 text-xs font-bold text-indigo-200">
                      <BriefcaseBusiness size={14} />
                      Marka & Ajans Kokpiti • %0 Üyelik & İlan Ücreti
                    </span>
                    <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                      Reklamveren Kampanya, Teklif & Bloke Sipariş Merkezi
                    </h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-indigo-100">
                      AI asistanıyla saniyeler içinde brief oluşturun,
                      doğrulanmış influencer tekliflerini karşılaştırın ve
                      içerik onaylanana kadar bloke güvencesiyle çalışın.
                    </p>
                  </div>
                  <Link
                    href={`/${locale}/influencer`}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-950 shadow-sm hover:bg-indigo-50"
                  >
                    <Compass size={15} />
                    Influencer & UGC Keşfet →
                  </Link>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-indigo-200">
                      Aktif Kampanyalarım
                    </span>
                    <p className="mt-1 text-2xl font-black text-white">3 Brief</p>
                    <span className="text-[11px] text-emerald-300">
                      14 Influencer Teklifi
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-cyan-200">
                      Bloke Güvencedeki Sipariş
                    </span>
                    <p className="mt-1 text-2xl font-black text-white">
                      10.000,00 TL
                    </p>
                    <span className="text-[11px] text-cyan-300">
                      INF-2026-000001 (PAID)
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-emerald-200">
                      Marka Ek Hizmet Bedeli
                    </span>
                    <p className="mt-1 text-2xl font-black text-emerald-300">
                      %0
                    </p>
                    <span className="text-[11px] text-slate-300">
                      Gizli ücret veya abonelik yok
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-amber-200">
                      Telif & Lisans Koruması
                    </span>
                    <p className="mt-1 text-2xl font-black text-white">
                      6 Boyutlu
                    </p>
                    <span className="text-[11px] text-amber-300">
                      Sabit Sipariş Snapshot
                    </span>
                  </div>
                </div>
              </div>

              {/* Advertiser AI Campaign Brief Assistant */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
                  SSRF Korumalı Yapay Zekâ Brief Motoru
                </span>
                <h2 className="mt-1 text-lg font-black text-slate-950">
                  AI Kampanya Brief & #reklam Senaryo Oluşturucu
                </h2>
                <form
                  onSubmit={handleGenerateAdvAiBrief}
                  className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-3"
                >
                  <div>
                    <label
                      htmlFor="adv-brand"
                      className="block font-bold text-slate-700"
                    >
                      Marka Adı
                    </label>
                    <input
                      id="adv-brand"
                      type="text"
                      value={advBrandName}
                      onChange={(e) => setAdvBrandName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="adv-url"
                      className="block font-bold text-slate-700"
                    >
                      Web Sitesi (HTTPS)
                    </label>
                    <input
                      id="adv-url"
                      type="url"
                      value={advWebsite}
                      onChange={(e) => setAdvWebsite(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="adv-budget"
                      className="block font-bold text-slate-700"
                    >
                      Brüt Kampanya Bütçesi (TL)
                    </label>
                    <input
                      id="adv-budget"
                      type="number"
                      min={1000}
                      value={advBudgetTl}
                      onChange={(e) => setAdvBudgetTl(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="adv-desc"
                      className="block font-bold text-slate-700"
                    >
                      Ürün / Kampanya Hedefi
                    </label>
                    <input
                      id="adv-desc"
                      type="text"
                      value={advBriefDesc}
                      onChange={(e) => setAdvBriefDesc(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-indigo-600 py-2.5 font-bold text-white hover:bg-indigo-700"
                    >
                      AI Kampanya Briefi Üret
                    </button>
                  </div>
                </form>

                {advAiResult ? (
                  <div className="mt-4 space-y-2 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 text-xs text-slate-800">
                    <strong className="block text-sm font-black text-indigo-950">
                      {String(advAiResult.campaignTitle)}
                    </strong>
                    <p>{String(advAiResult.campaignDescription)}</p>
                    <p>
                      <strong>Önerilen Senaryo:</strong>{" "}
                      {String(advAiResult.adScriptDraft)}
                    </p>
                    <p>
                      <strong>Zorunlu Etiket:</strong>{" "}
                      <code>{String(advAiResult.disclosureDraft)}</code>
                    </p>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
