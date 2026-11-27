"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  CreditCard,
  Crown,
  Database,
  Download,
  ExternalLink,
  FileCheck2,
  Globe,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import type { UserRole } from "@/lib/types/domain";
import { SUPER_ADMIN_EMAIL, isSuperAdminEmail } from "@/lib/auth/roles";
import {
  calculateCommissionBreakdown,
  formatMinorUnits,
} from "@/lib/finance/commission";
import { getInfluNexAuth } from "@/lib/firebase/client";
import {
  INITIAL_CATEGORIES,
  INITIAL_CITIES,
  TURKIYE_REGIONS,
} from "@/lib/data/catalog";
import {
  INFLUNEX_SESSION_STORAGE_KEY,
  type StoredInfluNexSession,
} from "@/components/auth/NavbarAuthActions";
import { ThousandCreatorsCrmSection } from "./ThousandCreatorsCrmSection";

type WorkspaceRole = UserRole;

interface RoleDashboardProps {
  locale: string;
  role: WorkspaceRole;
}

interface CreatorDraftService {
  id: string;
  title: string;
  creatorName: string;
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
  platform: "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "UGC";
  followers: string;
  er: string;
  isLeader: boolean;
  badge: "Doğrulanmış Profil" | "Resmi Onaylı" | "İnceleme Bekliyor";
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
  createdAt: string;
}

interface AdminCampaignItem {
  id: string;
  brandName: string;
  title: string;
  city: string;
  category: string;
  platform: "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "UGC";
  budgetTl: number;
  proposalCount: number;
  status: "OPEN" | "COMPLETED";
}

const INITIAL_ADMIN_CREATORS: AdminVerificationItem[] = [
  {
    id: "cr-adana-guzellik-guldkoc",
    name: "Gül Koç",
    handle: "@guldkoc",
    city: "Adana",
    category: "Güzellik & Kozmetik",
    platform: "INSTAGRAM",
    followers: "10.398",
    er: "%5.80",
    isLeader: true,
    badge: "Doğrulanmış Profil",
    status: "APPROVED",
  },
  {
    id: "cr-adana-oto-emre",
    name: "Emre Toros",
    handle: "@emretorosauto",
    city: "Adana",
    category: "Otomotiv",
    platform: "INSTAGRAM",
    followers: "148.000",
    er: "%4.25",
    isLeader: false,
    badge: "Doğrulanmış Profil",
    status: "APPROVED",
  },
  {
    id: "cr-ist-moda-selin",
    name: "Selin Aksoy",
    handle: "@selinaksoystyle",
    city: "İstanbul",
    category: "Moda & Stil",
    platform: "INSTAGRAM",
    followers: "290.000",
    er: "%4.38",
    isLeader: false,
    badge: "Resmi Onaylı",
    status: "APPROVED",
  },
  {
    id: "cr-ank-tech-mert",
    name: "Mert Kaya",
    handle: "@mertkayatech",
    city: "Ankara",
    category: "Teknoloji",
    platform: "YOUTUBE",
    followers: "210.000",
    er: "%5.12",
    isLeader: false,
    badge: "Doğrulanmış Profil",
    status: "APPROVED",
  },
  {
    id: "cr-izm-ugc-zeynep",
    name: "Zeynep Demir",
    handle: "@zeynepugcstudio",
    city: "İzmir",
    category: "UGC İçerik Üretimi",
    platform: "UGC",
    followers: "42.500",
    er: "%6.40",
    isLeader: false,
    badge: "İnceleme Bekliyor",
    status: "PENDING_REVIEW",
  },
  {
    id: "cr-bur-gastro-kaan",
    name: "Kaan Şef",
    handle: "@kaanseflezzet",
    city: "Bursa",
    category: "Yeme & İçme (Gastronomi)",
    platform: "TIKTOK",
    followers: "115.000",
    er: "%5.95",
    isLeader: false,
    badge: "İnceleme Bekliyor",
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
    createdAt: "Bugün 10:15",
  },
  {
    orderCode: "INF-2026-000002",
    brandName: "Natura Derm Kozmetik",
    creatorName: "Gül Koç (@guldkoc)",
    serviceTitle: "Instagram Reels + Hikâye Seti & 30 Gün Reklam İzni",
    grossTl: 14500,
    bankTransactionRef: "TR-EFT-7745120",
    state: "PAYMENT_REVIEW",
    adDisclosureVerified: false,
    createdAt: "Bugün 11:40",
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
    createdAt: "Dün 16:20",
  },
  {
    orderCode: "INF-2026-000004",
    brandName: "Maison Luna Moda",
    creatorName: "Selin Aksoy",
    serviceTitle: "Yeni Sezon Kombin Reels + Linkli Story",
    grossTl: 22000,
    bankTransactionRef: "TR-FAST-5518044",
    state: "PAYOUT_COMPLETED",
    adDisclosureVerified: true,
    createdAt: "2 Gün Önce",
  },
];

const INITIAL_ADMIN_CAMPAIGNS: AdminCampaignItem[] = [
  {
    id: "cmp-1",
    brandName: "Natura Derm Kozmetik",
    title: "Cilt Bakım Serumu İçin 60 sn Instagram Reels & UGC Video",
    city: "Adana",
    category: "Güzellik & Kozmetik",
    platform: "INSTAGRAM",
    budgetTl: 15000,
    proposalCount: 12,
    status: "OPEN",
  },
  {
    id: "cmp-2",
    brandName: "Toros Auto Care",
    title: "Seramik Kaplama & Araç Bakım Kiti Uygulama Videosu",
    city: "Adana",
    category: "Otomotiv",
    platform: "INSTAGRAM",
    budgetTl: 12000,
    proposalCount: 8,
    status: "OPEN",
  },
  {
    id: "cmp-3",
    brandName: "NovaTech Türkiye",
    title: "Kablosuz Oyuncu Kulaklığı Kutu Açılımı & İnceleme",
    city: "İstanbul",
    category: "Teknoloji",
    platform: "YOUTUBE",
    budgetTl: 25000,
    proposalCount: 19,
    status: "OPEN",
  },
  {
    id: "cmp-4",
    brandName: "Anadolu Gurme Kahve",
    title: "3. Nesil Kahve Demleme Kiti TikTok & Reels Tanıtımı",
    city: "Ankara",
    category: "Yeme & İçme (Gastronomi)",
    platform: "TIKTOK",
    budgetTl: 9500,
    proposalCount: 14,
    status: "OPEN",
  },
];

export function RoleDashboard({ locale, role }: RoleDashboardProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [storedSession, setStoredSession] =
    useState<StoredInfluNexSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [activeViewRole, setActiveViewRole] = useState<WorkspaceRole>(role);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // SuperAdmin state
  const [adminCreators, setAdminCreators] = useState<AdminVerificationItem[]>(
    INITIAL_ADMIN_CREATORS
  );
  const [ledgerOrders, setLedgerOrders] =
    useState<AdminLedgerOrder[]>(INITIAL_LEDGER_ORDERS);
  const [ ledgerFilter, setLedgerFilter ] = useState<string>("ALL");
  const [adminCampaigns, setAdminCampaigns] = useState<AdminCampaignItem[]>(
    INITIAL_ADMIN_CAMPAIGNS
  );
  const [adminNotice, setAdminNotice] = useState<string>("");
  const [activityLogs, setActivityLogs] = useState<string[]>([
    "Süperadmin oturumu (cebrailkara@gmail.com) tam yetkiyle doğrulandı.",
    "Türkiye 81 İl × 25 Kategori SEO dizini ve 1.000 onaylı profil aktif.",
    "INF-2026-000002 siparişi için banka havale dekontu incelemeye alındı.",
  ]);

  // SuperAdmin: New Creator Form
  const [newCrName, setNewCrName] = useState("");
  const [newCrHandle, setNewCrHandle] = useState("");
  const [newCrCity, setNewCrCity] = useState("Adana");
  const [newCrCategory, setNewCrCategory] = useState("Güzellik & Kozmetik");
  const [newCrPlatform, setNewCrPlatform] = useState<
    "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "UGC"
  >("INSTAGRAM");
  const [newCrFollowers, setNewCrFollowers] = useState("45.000");
  const [newCrEr, setNewCrEr] = useState("%4.90");
  const [newCrIsLeader, setNewCrIsLeader] = useState(false);

  // SuperAdmin: New Order Form
  const [newOrdBrand, setNewOrdBrand] = useState("");
  const [newOrdCreator, setNewOrdCreator] = useState("Gül Koç (@guldkoc)");
  const [newOrdService, setNewOrdService] = useState(
    "1 Adet 60 sn Instagram Reels + 2 Story"
  );
  const [newOrdGrossTl, setNewOrdGrossTl] = useState(12500);
  const [newOrdBankRef, setNewOrdBankRef] = useState(
    `TR-FAST-${Math.floor(1000000 + Math.random() * 9000000)}`
  );

  // SuperAdmin: New Campaign Form
  const [newCmpBrand, setNewCmpBrand] = useState("");
  const [newCmpTitle, setNewCmpTitle] = useState("");
  const [newCmpCity, setNewCmpCity] = useState("İstanbul");
  const [newCmpCategory, setNewCmpCategory] = useState("Güzellik & Kozmetik");
  const [newCmpPlatform, setNewCmpPlatform] = useState<
    "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "UGC"
  >("INSTAGRAM");
  const [newCmpBudgetTl, setNewCmpBudgetTl] = useState(15000);

  // SuperAdmin: 81 Province SEO Filter
  const [seoRegionFilter, setSeoRegionFilter] = useState<string>("ALL");

  // Creator state
  const [creatorServices, setCreatorServices] = useState<CreatorDraftService[]>([
    {
      id: "srv-1",
      title: "1 Adet 60 sn Instagram Reels + 2 Story (Organik #reklam)",
      creatorName: "Gül Koç (@guldkoc)",
      platform: "INSTAGRAM",
      priceTl: 8500,
      deliveryDays: 4,
      revisions: 2,
      usageScope: "Organik Paylaşım + 30 Gün Profilde Sabit",
    },
    {
      id: "srv-2",
      title: "UGC 9:16 Performans Reklam Videosu (3 Kanca Varyasyonlu)",
      creatorName: "Gül Koç (@guldkoc)",
      platform: "UGC",
      priceTl: 5500,
      deliveryDays: 3,
      revisions: 2,
      usageScope: "Marka Meta & TikTok Reklam Kullanımı (90 Gün)",
    },
    {
      id: "srv-3",
      title: "YouTube 90 sn Entegre Ürün İncelemesi + Açıklama Linki",
      creatorName: "Mert Kaya (@mertkayatech)",
      platform: "YOUTUBE",
      priceTl: 18000,
      deliveryDays: 5,
      revisions: 2,
      usageScope: "Organik YouTube Yayını + 60 Gün Dijital Hak",
    },
  ]);
  const [newPkgTitle, setNewPkgTitle] = useState("");
  const [newPkgCreator, setNewPkgCreator] = useState("Gül Koç (@guldkoc)");
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

  function pushLog(msg: string) {
    setAdminNotice(msg);
    setActivityLogs((prev) => [
      `${new Date().toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      })} — ${msg}`,
      ...prev.slice(0, 9),
    ]);
  }

  useEffect(() => {
    setActiveViewRole(role);
  }, [role]);

  useEffect(() => {
    // Read stored session from localStorage (supports direct email login with cebrailkara@gmail.com)
    try {
      const raw = window.localStorage.getItem(INFLUNEX_SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredInfluNexSession;
        if (parsed && parsed.email) {
          setStoredSession(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }

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

          if (nextUser.email) {
            const profile: StoredInfluNexSession = {
              email: nextUser.email,
              displayName:
                nextUser.displayName ||
                (superAdminMatch
                  ? "Cebrail Kara (Süperadmin)"
                  : nextUser.email),
              role: effectiveRole,
              isSuperAdmin: superAdminMatch,
            };
            setStoredSession(profile);
            try {
              window.localStorage.setItem(
                INFLUNEX_SESSION_STORAGE_KEY,
                JSON.stringify(profile)
              );
            } catch {
              // ignore
            }
          }

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

  function handleActivateSuperAdminInstant() {
    const profile: StoredInfluNexSession = {
      email: SUPER_ADMIN_EMAIL,
      displayName: "Cebrail Kara (Süperadmin)",
      role: "ADMIN",
      isSuperAdmin: true,
    };
    try {
      window.localStorage.setItem(
        INFLUNEX_SESSION_STORAGE_KEY,
        JSON.stringify(profile)
      );
      window.dispatchEvent(new Event("influnex-session-updated"));
    } catch {
      // ignore
    }
    setStoredSession(profile);
    setActiveViewRole("ADMIN");
    pushLog(
      `Süperadmin (${SUPER_ADMIN_EMAIL}) tam erişim yetkisi aktifleştirildi.`
    );
  }

  async function handleSignOut() {
    try {
      window.localStorage.removeItem(INFLUNEX_SESSION_STORAGE_KEY);
      window.dispatchEvent(new Event("influnex-session-updated"));
    } catch {
      // ignore
    }
    setStoredSession(null);
    await signOut(getInfluNexAuth()).catch(() => undefined);
    router.replace(`/${locale}/giris`);
  }

  function handleAddCreatorPackage(e: React.FormEvent) {
    e.preventDefault();
    if (!newPkgTitle.trim()) return;
    setCreatorServices((prev) => [
      {
        id: `srv-${Date.now()}`,
        title: newPkgTitle.trim(),
        creatorName: newPkgCreator.trim() || "Gül Koç (@guldkoc)",
        platform: newPkgPlatform,
        priceTl: Number(newPkgPriceTl),
        deliveryDays: Number(newPkgDeliveryDays),
        revisions: Number(newPkgRevisions),
        usageScope: newPkgUsage,
      },
      ...prev,
    ]);
    pushLog(
      `Yeni hizmet paketi eklendi: "${newPkgTitle.trim()}" (${newPkgPriceTl.toLocaleString("tr-TR")} TL).`
    );
    setNewPkgTitle("");
  }

  function handleAddAdminCreator(e: React.FormEvent) {
    e.preventDefault();
    if (!newCrName.trim() || !newCrHandle.trim()) return;
    const formattedHandle = newCrHandle.trim().startsWith("@")
      ? newCrHandle.trim()
      : `@${newCrHandle.trim()}`;
    const newItem: AdminVerificationItem = {
      id: `cr-custom-${Date.now()}`,
      name: newCrName.trim(),
      handle: formattedHandle,
      city: newCrCity,
      category: newCrCategory,
      platform: newCrPlatform,
      followers: newCrFollowers.trim() || "25.000",
      er: newCrEr.trim() || "%4.50",
      isLeader: newCrIsLeader,
      badge: "Doğrulanmış Profil",
      status: "APPROVED",
    };
    setAdminCreators((prev) => [newItem, ...prev]);
    pushLog(
      `${newItem.name} (${newItem.handle} • ${newItem.city}) doğrulanmış profil olarak vitrine eklendi.`
    );
    setNewCrName("");
    setNewCrHandle("");
  }

  function handleApproveCreator(id: string) {
    setAdminCreators((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: "APPROVED", badge: "Doğrulanmış Profil" }
          : c
      )
    );
    pushLog("Influencer profili onaylandı ve vitrine açıldı.");
  }

  function handleToggleCreatorLeader(id: string) {
    setAdminCreators((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isLeader: !c.isLeader } : c
      )
    );
    pushLog("Influencer Lideri (👑) rozet durumu güncellendi.");
  }

  function handleCreateAdminOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!newOrdBrand.trim() || !newOrdCreator.trim()) return;
    const nextCode = `INF-2026-00000${ledgerOrders.length + 1}`;
    const item: AdminLedgerOrder = {
      orderCode: nextCode,
      brandName: newOrdBrand.trim(),
      creatorName: newOrdCreator.trim(),
      serviceTitle: newOrdService.trim(),
      grossTl: Number(newOrdGrossTl),
      bankTransactionRef: newOrdBankRef.trim(),
      state: "PAYMENT_REVIEW",
      adDisclosureVerified: false,
      createdAt: "Şimdi",
    };
    setLedgerOrders((prev) => [item, ...prev]);
    pushLog(
      `Yeni sipariş oluşturuldu: ${nextCode} (${item.brandName} → ${item.creatorName}, ${item.grossTl.toLocaleString("tr-TR")} TL).`
    );
    setNewOrdBrand("");
    setNewOrdBankRef(
      `TR-FAST-${Math.floor(1000000 + Math.random() * 9000000)}`
    );
  }

  function handleAdvanceOrderState(orderCode: string) {
    setLedgerOrders((prev) =>
      prev.map((ord) => {
        if (ord.orderCode !== orderCode) return ord;
        if (ord.state === "PAYMENT_REVIEW") {
          pushLog(
            `${orderCode} banka dekontu (${ord.bankTransactionRef}) onaylandı; tutar güvenli blokeye alındı.`
          );
          return { ...ord, state: "PAID" };
        }
        if (ord.state === "PAID") {
          pushLog(
            `${orderCode} içerik teslimi ve #reklam etiketi onaylandı; sipariş tamamlandı.`
          );
          return { ...ord, state: "COMPLETED", adDisclosureVerified: true };
        }
        if (ord.state === "COMPLETED") {
          pushLog(
            `${orderCode} için %85 üretici hakedişi (${(ord.grossTl * 0.85).toLocaleString("tr-TR")} TL) ödendi.`
          );
          return { ...ord, state: "PAYOUT_COMPLETED" };
        }
        return ord;
      })
    );
  }

  function handleAddAdminCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!newCmpBrand.trim() || !newCmpTitle.trim()) return;
    const item: AdminCampaignItem = {
      id: `cmp-${Date.now()}`,
      brandName: newCmpBrand.trim(),
      title: newCmpTitle.trim(),
      city: newCmpCity,
      category: newCmpCategory,
      platform: newCmpPlatform,
      budgetTl: Number(newCmpBudgetTl),
      proposalCount: 0,
      status: "OPEN",
    };
    setAdminCampaigns((prev) => [item, ...prev]);
    pushLog(
      `Yeni reklam kampanyası yayına alındı: "${item.title}" (${item.brandName} • ${item.budgetTl.toLocaleString("tr-TR")} TL).`
    );
    setNewCmpBrand("");
    setNewCmpTitle("");
  }

  function handleToggleCampaignStatus(id: string) {
    setAdminCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "OPEN" ? "COMPLETED" : "OPEN" }
          : c
      )
    );
    pushLog("Kampanya yayın durumu güncellendi.");
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

  const filteredLedgerOrders =
    ledgerFilter === "ALL"
      ? ledgerOrders
      : ledgerOrders.filter((o) => o.state === ledgerFilter);

  const filteredSeoCities =
    seoRegionFilter === "ALL"
      ? INITIAL_CITIES
      : INITIAL_CITIES.filter((c) => c.regionTr === seoRegionFilter);

  const activeEmail = user?.email || storedSession?.email || null;
  const isCurrentUserSuperAdmin =
    isSuperAdminEmail(activeEmail) ||
    Boolean(storedSession?.isSuperAdmin) ||
    activeViewRole === "ADMIN";

  if (checking) {
    return (
      <main className="grid min-h-[65vh] place-items-center px-4">
        <p className="text-sm font-semibold text-slate-600" role="status">
          Yönetim paneli yükleniyor…
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-[82vh] bg-slate-100/80 pb-16">
      {/* Top Executive Identity & SuperAdmin Switcher Bar */}
      <div className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 font-extrabold text-amber-300 ring-1 ring-amber-400/30">
              <Crown size={14} />
              Süperadmin: {SUPER_ADMIN_EMAIL}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 font-bold text-emerald-300">
              <ShieldCheck size={13} />
              Tam Yetki & Tüm Sayfalara Erişim Aktif
            </span>
            {activeEmail ? (
              <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-slate-200">
                Açık Oturum: {activeEmail}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleActivateSuperAdminInstant}
                className="rounded-full bg-amber-400 px-3 py-1 font-black text-slate-950 hover:bg-amber-300"
              >
                👑 {SUPER_ADMIN_EMAIL} Olarak Anında Bağlan
              </button>
            )}
          </div>

          {/* 1-Click Role Cockpit Switcher */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">
              Panel Görünümü:
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveViewRole("ADMIN");
                setActiveTab("overview");
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                activeViewRole === "ADMIN"
                  ? "bg-amber-400 text-slate-950 shadow-xs"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              👑 Süperadmin
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveViewRole("CREATOR");
                setActiveTab("overview");
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                activeViewRole === "CREATOR"
                  ? "bg-emerald-500 text-slate-950 shadow-xs"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              Influencer / Yayıncı (%85)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveViewRole("ADVERTISER");
                setActiveTab("overview");
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                activeViewRole === "ADVERTISER"
                  ? "bg-indigo-500 text-white shadow-xs"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              Marka / Reklamveren
            </button>
          </div>
        </div>

        {/* Universal SuperAdmin All-Pages Quick Jump Strip ("heryere erişsin") */}
        <div className="border-t border-white/10 bg-slate-900/90">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1.5 px-4 py-2 text-[11px] sm:px-6 lg:px-8">
            <span className="mr-1 font-extrabold uppercase tracking-wider text-amber-300">
              Hızlı Erişim (Tüm Sayfalar):
            </span>
            <Link
              href={`/${locale}`}
              className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-slate-200 hover:bg-white/20"
            >
              Ana Sayfa
            </Link>
            <Link
              href={`/${locale}/yonetim`}
              className="rounded-lg bg-amber-400/20 px-2.5 py-1 font-bold text-amber-200 hover:bg-amber-400/30"
            >
              👑 Süperadmin Paneli
            </Link>
            <Link
              href={`/${locale}/admin`}
              className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-slate-200 hover:bg-white/20"
            >
              Muhasebe & SEO Denetimi
            </Link>
            <Link
              href={`/${locale}/yayinci/panel`}
              className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-slate-200 hover:bg-white/20"
            >
              Yayıncı Paneli
            </Link>
            <Link
              href={`/${locale}/reklamveren/panel`}
              className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-slate-200 hover:bg-white/20"
            >
              Marka Paneli
            </Link>
            <Link
              href={`/${locale}/panel`}
              className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-slate-200 hover:bg-white/20"
            >
              15 Aşamalı Sipariş Odası
            </Link>
            <Link
              href={`/${locale}/influencer`}
              className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-slate-200 hover:bg-white/20"
            >
              1.000+ Influencer Vitrin
            </Link>
            <Link
              href={`/${locale}/influencer/turkiye`}
              className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-slate-200 hover:bg-white/20"
            >
              Türkiye 81 İl Rehberi
            </Link>
            <Link
              href={`/${locale}/kampanyalar`}
              className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-slate-200 hover:bg-white/20"
            >
              Açık Kampanyalar
            </Link>
            <Link
              href={`/${locale}/influencer/guldkoc`}
              className="rounded-lg bg-emerald-500/20 px-2.5 py-1 font-bold text-emerald-300 hover:bg-emerald-500/30"
            >
              @guldkoc Vitrin ↗
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 pt-6 lg:grid-cols-[270px_1fr] lg:px-8">
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
                InfluNex Yönetim
              </p>
              <p className="text-[11px] font-bold text-indigo-600">
                {activeViewRole === "ADMIN"
                  ? "👑 Süperadmin Komuta Merkezi"
                  : activeViewRole === "CREATOR"
                    ? "Influencer & UGC Stüdyosu"
                    : "Marka & Kampanya Paneli"}
              </p>
            </div>
          </div>

          <nav aria-label="Panel menüsü" className="grid gap-1.5">
            {activeViewRole === "ADMIN" ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold transition ${
                    activeTab === "overview"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <LayoutDashboard size={17} />
                  1. Genel Bakış & Özet
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("verifications")}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold transition ${
                    activeTab === "verifications"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Users size={17} />
                  2. 1.000 Influencer & Tanıtım
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ledger")}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold transition ${
                    activeTab === "ledger"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <CreditCard size={17} />
                  3. Sipariş, Dekont & %85 Ödeme
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("campaigns")}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold transition ${
                    activeTab === "campaigns"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Megaphone size={17} />
                  4. Marka Kampanyaları ({adminCampaigns.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("packages")}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold transition ${
                    activeTab === "packages"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Package size={17} />
                  5. Hizmet Paketleri ({creatorServices.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("seo")}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold transition ${
                    activeTab === "seo"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Globe size={17} />
                  6. Türkiye 81 İl SEO Yönetimi
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
                  Kampanya İlan Taslağı Hazırla
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
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-amber-900">
                <Crown size={13} />
                {isCurrentUserSuperAdmin ? "Süperadmin" : activeViewRole}
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-900">
                Tam Yetki
              </span>
            </div>
            <p className="mt-1 truncate text-xs font-extrabold text-slate-900">
              {user?.displayName ||
                storedSession?.displayName ||
                "Cebrail Kara (Süperadmin)"}
            </p>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-600">
              {activeEmail || SUPER_ADMIN_EMAIL}
            </p>
          </div>

          <div className="mt-3 grid gap-2">
            {!activeEmail ? (
              <button
                type="button"
                onClick={handleActivateSuperAdminInstant}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-3 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-300"
              >
                <Crown size={15} />
                Süperadmin Oturumunu Sabitle
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              <LogOut size={15} />
              Oturumu Kapat
            </button>
          </div>
        </aside>

        {/* Main Workspace Content */}
        <section className="space-y-6">
          {/* ================================================================
              1. SUPERADMIN COCKPIT (cebrailkara@gmail.com)
             ================================================================ */}
          {activeViewRole === "ADMIN" ? (
            <>
              {/* Executive Header Banner */}
              <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-6 text-white shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-extrabold text-amber-300 ring-1 ring-amber-400/30">
                        <Crown size={14} />
                        Süperadmin: {SUPER_ADMIN_EMAIL}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                        <Database size={13} />
                        İzole Veritabanı: influnex-db
                      </span>
                    </div>
                    <h1 className="mt-2.5 text-2xl font-black tracking-tight sm:text-3xl">
                      InfluNex Süperadmin Yönetim ve Kontrol Merkezi
                    </h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-300">
                      1.000 onaylı influencer ve tanıtım gönderimi, sipariş ve
                      banka dekont onayları, %15 platform komisyonu / %85
                      üretici ödemeleri, marka kampanyaları ve 81 il SEO
                      sayfalarını tek ekrandan yönetin.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleExportLedgerCsv}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-slate-950 shadow-sm hover:bg-emerald-400"
                    >
                      <Download size={15} />
                      Muhasebe Tablosunu İndir (CSV)
                    </button>
                  </div>
                </div>

                {/* 6 Executive KPIs */}
                <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-slate-300">
                      Toplam İşlem Hacmi
                    </span>
                    <p className="mt-1 text-xl font-black text-white">
                      {formatMinorUnits(
                        totalLedgerBreakdown.grossAmountMinorUnits
                      )}
                    </p>
                    <span className="text-[11px] text-emerald-300">
                      {ledgerOrders.length} Aktif Sipariş
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-indigo-300">
                      %15 Platform Geliri
                    </span>
                    <p className="mt-1 text-xl font-black text-indigo-300">
                      {formatMinorUnits(
                        totalLedgerBreakdown.platformCommissionMinorUnits
                      )}
                    </p>
                    <span className="text-[11px] text-slate-300">
                      Net Hizmet Komisyonu
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-emerald-300">
                      %85 Üretici Ödemeleri
                    </span>
                    <p className="mt-1 text-xl font-black text-emerald-400">
                      {formatMinorUnits(
                        totalLedgerBreakdown.creatorNetPayoutMinorUnits
                      )}
                    </p>
                    <span className="text-[11px] text-slate-300">
                      Influencer Hakediş Havuzu
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-amber-300">
                      Kayıtlı Influencer
                    </span>
                    <p className="mt-1 text-xl font-black text-white">
                      1.000+
                    </p>
                    <span className="text-[11px] text-amber-300">
                      4 Kanal • Onaylı Vitrin
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-cyan-300">
                      Açık Kampanyalar
                    </span>
                    <p className="mt-1 text-xl font-black text-white">
                      {
                        adminCampaigns.filter((c) => c.status === "OPEN")
                          .length
                      }{" "}
                      İlan
                    </p>
                    <span className="text-[11px] text-cyan-300">
                      Marka İş Birliği İlanı
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-purple-300">
                      Türkiye İl Kapsamı
                    </span>
                    <p className="mt-1 text-xl font-black text-white">
                      81 İl
                    </p>
                    <span className="text-[11px] text-purple-300">
                      7 Bölge × 25 Kategori
                    </span>
                  </div>
                </div>
              </div>

              {adminNotice ? (
                <div
                  role="status"
                  className="flex items-center justify-between rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-950"
                >
                  <span>✓ {adminNotice}</span>
                  <button
                    type="button"
                    onClick={() => setAdminNotice("")}
                    className="text-[11px] font-extrabold text-emerald-700 hover:underline"
                  >
                    Kapat
                  </button>
                </div>
              ) : null}

              {/* Overview Quick Analytics & Activity Feed */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  {/* Channel Distribution & Quick Actions */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs lg:col-span-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                          Kanal & İçerik Dağılımı
                        </span>
                        <h2 className="mt-0.5 text-lg font-black text-slate-950">
                          1.000 Influencer ve Sipariş Kanal Performansı
                        </h2>
                      </div>
                      <TrendingUp className="text-indigo-600" size={20} />
                    </div>

                    <div className="mt-4 space-y-3.5 text-xs">
                      <div>
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>Instagram (Reels, Hikâye & Post)</span>
                          <span className="text-indigo-600">
                            480 Üretici (%48)
                          </span>
                        </div>
                        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full w-[48%] rounded-full bg-indigo-600" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>TikTok (Akım, Ürün Deneyimi & Spark Ads)</span>
                          <span className="text-emerald-600">
                            240 Üretici (%24)
                          </span>
                        </div>
                        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full w-[24%] rounded-full bg-emerald-500" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>UGC Video (Markaya Özel Reklam Kreatifi)</span>
                          <span className="text-amber-600">
                            160 Üretici (%16)
                          </span>
                        </div>
                        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full w-[16%] rounded-full bg-amber-500" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>YouTube (Detaylı İnceleme & Shorts)</span>
                          <span className="text-rose-600">
                            120 Üretici (%12)
                          </span>
                        </div>
                        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full w-[12%] rounded-full bg-rose-500" />
                        </div>
                      </div>
                    </div>

                    {/* Quick Module Launchers */}
                    <div className="mt-6 grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-4 sm:grid-cols-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab("verifications")}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-xs font-bold text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/40"
                      >
                        <UserPlus
                          size={15}
                          className="mb-1 text-indigo-600"
                        />
                        + Yeni Influencer Ekle
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("ledger")}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-xs font-bold text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/40"
                      >
                        <CreditCard
                          size={15}
                          className="mb-1 text-emerald-600"
                        />
                        + Yeni Sipariş / Dekont
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("campaigns")}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-xs font-bold text-slate-800 hover:border-amber-300 hover:bg-amber-50/40"
                      >
                        <Megaphone
                          size={15}
                          className="mb-1 text-amber-600"
                        />
                        + Yeni Kampanya Aç
                      </button>
                    </div>
                  </div>

                  {/* Live Activity Log */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs lg:col-span-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Canlı İşlem Kayıtları
                    </span>
                    <h2 className="mt-0.5 text-lg font-black text-slate-950">
                      Son Süperadmin Hareketleri
                    </h2>
                    <ul className="mt-4 space-y-2.5 text-xs">
                      {activityLogs.map((item, idx) => (
                        <li
                          key={`${idx}-${item}`}
                          className="flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-slate-700"
                        >
                          <CheckCircle2
                            size={14}
                            className="mt-0.5 shrink-0 text-emerald-600"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* SuperAdmin Section: Order Escrow, Bank Ref Verification & 85% Payout Table */}
              {(activeTab === "overview" || activeTab === "ledger") && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Havale / EFT / FAST Dekont & Hakediş Yönetimi
                      </span>
                      <h2 className="mt-0.5 text-lg font-black text-slate-950">
                        Siparişler, Güvenli Ödeme Blokesi ve %85 Influencer Ödeme Tablosu
                      </h2>
                    </div>

                    {/* State Filter Pills */}
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {[
                        { id: "ALL", label: "Tümü" },
                        { id: "PAYMENT_REVIEW", label: "Dekont Bekleyen" },
                        { id: "PAID", label: "Ödemesi Bloke" },
                        { id: "COMPLETED", label: "Teslim Onaylı" },
                        { id: "PAYOUT_COMPLETED", label: "%85 Ödendi" },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setLedgerFilter(f.id)}
                          className={`rounded-lg px-2.5 py-1 font-bold ${
                            ledgerFilter === f.id
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add New Order Form */}
                  <form
                    onSubmit={handleCreateAdminOrder}
                    className="mt-4 grid grid-cols-1 gap-2.5 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 text-xs sm:grid-cols-6"
                  >
                    <input
                      type="text"
                      required
                      value={newOrdBrand}
                      onChange={(e) => setNewOrdBrand(e.target.value)}
                      placeholder="Marka Adı (Örn: Lumi Kozmetik)"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                    />
                    <input
                      type="text"
                      required
                      value={newOrdCreator}
                      onChange={(e) => setNewOrdCreator(e.target.value)}
                      placeholder="Influencer Adı"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                    />
                    <input
                      type="text"
                      required
                      value={newOrdService}
                      onChange={(e) => setNewOrdService(e.target.value)}
                      placeholder="Hizmet Paketi"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                    />
                    <input
                      type="number"
                      min={500}
                      step={250}
                      value={newOrdGrossTl}
                      onChange={(e) => setNewOrdGrossTl(Number(e.target.value))}
                      placeholder="Brüt Tutar (TL)"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                    />
                    <input
                      type="text"
                      required
                      value={newOrdBankRef}
                      onChange={(e) => setNewOrdBankRef(e.target.value)}
                      placeholder="Banka Dekont Ref"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-indigo-600 px-3 py-2 font-black text-white hover:bg-indigo-700"
                    >
                      + Yeni Sipariş Ekle
                    </button>
                  </form>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 uppercase text-slate-500">
                          <th className="py-2.5">Sipariş Kodu</th>
                          <th className="py-2.5">Marka & Influencer</th>
                          <th className="py-2.5">Brüt Tutar</th>
                          <th className="py-2.5">%15 Komisyon</th>
                          <th className="py-2.5">%85 Üretici Payı</th>
                          <th className="py-2.5">Banka Referansı</th>
                          <th className="py-2.5">Durum</th>
                          <th className="py-2.5">Süperadmin İşlemi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredLedgerOrders.map((ord) => {
                          const b = calculateCommissionBreakdown(
                            ord.grossTl * 100,
                            "TRY"
                          );
                          const statusLabel =
                            ord.state === "PAYMENT_REVIEW"
                              ? "Dekont İnceleniyor"
                              : ord.state === "PAID"
                                ? "Ödeme Bloke Edildi"
                                : ord.state === "COMPLETED"
                                  ? "Teslim Onaylandı"
                                  : "%85 Ödeme Yapıldı";
                          return (
                            <tr key={ord.orderCode}>
                              <td className="py-3 font-mono font-bold text-indigo-950">
                                {ord.orderCode}
                                <span className="block font-sans text-[10px] font-normal text-slate-400">
                                  {ord.createdAt}
                                </span>
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
                                  {statusLabel}
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
                                      ? "Dekontu Onayla"
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

              {/* SuperAdmin Section: Add New Creator + Creator Verification Queue + 1,000 Creator Outreach CRM */}
              {(activeTab === "overview" || activeTab === "verifications") && (
                <>
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                          Influencer & Rozet Yönetimi
                        </span>
                        <h2 className="mt-0.5 text-lg font-black text-slate-950">
                          Yeni Influencer Vitrine Ekle & Rozet Onay Kuyruğu
                        </h2>
                      </div>
                      <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                        Kişisel İletişim & IBAN Verileri İzole Korunur
                      </span>
                    </div>

                    {/* Add New Influencer Form */}
                    <form
                      onSubmit={handleAddAdminCreator}
                      className="mt-4 grid grid-cols-1 gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs sm:grid-cols-4 lg:grid-cols-8"
                    >
                      <input
                        type="text"
                        required
                        value={newCrName}
                        onChange={(e) => setNewCrName(e.target.value)}
                        placeholder="Ad Soyad"
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                      />
                      <input
                        type="text"
                        required
                        value={newCrHandle}
                        onChange={(e) => setNewCrHandle(e.target.value)}
                        placeholder="@kullaniciadi"
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                      />
                      <select
                        value={newCrCity}
                        onChange={(e) => setNewCrCity(e.target.value)}
                        aria-label="Şehir"
                        className="rounded-xl border border-slate-300 bg-white px-2.5 py-2"
                      >
                        {INITIAL_CITIES.map((city) => (
                          <option key={city.slug} value={city.nameTr}>
                            {city.plateCode} - {city.nameTr}
                          </option>
                        ))}
                      </select>
                      <select
                        value={newCrCategory}
                        onChange={(e) => setNewCrCategory(e.target.value)}
                        aria-label="Kategori"
                        className="rounded-xl border border-slate-300 bg-white px-2.5 py-2"
                      >
                        {INITIAL_CATEGORIES.map((cat) => (
                          <option key={cat.slugTr} value={cat.nameTr}>
                            {cat.nameTr}
                          </option>
                        ))}
                      </select>
                      <select
                        value={newCrPlatform}
                        onChange={(e) =>
                          setNewCrPlatform(
                            e.target.value as
                              | "INSTAGRAM"
                              | "TIKTOK"
                              | "YOUTUBE"
                              | "UGC"
                          )
                        }
                        aria-label="Kanal"
                        className="rounded-xl border border-slate-300 bg-white px-2.5 py-2"
                      >
                        <option value="INSTAGRAM">Instagram</option>
                        <option value="TIKTOK">TikTok</option>
                        <option value="YOUTUBE">YouTube</option>
                        <option value="UGC">UGC Video</option>
                      </select>
                      <input
                        type="text"
                        value={newCrFollowers}
                        onChange={(e) => setNewCrFollowers(e.target.value)}
                        placeholder="Takipçi (Örn: 65.000)"
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                      />
                      <label className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-2.5 py-2 font-bold text-amber-950">
                        <input
                          type="checkbox"
                          checked={newCrIsLeader}
                          onChange={(e) => setNewCrIsLeader(e.target.checked)}
                        />
                        👑 Lider Rozeti
                      </label>
                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-600 px-3 py-2 font-black text-white hover:bg-emerald-700"
                      >
                        + Vitrine Ekle
                      </button>
                    </form>

                    {/* Creator Cards Queue */}
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {adminCreators.map((cr) => (
                        <div
                          key={cr.id}
                          className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <strong className="text-sm font-black text-slate-950">
                                  {cr.name}
                                </strong>
                                {cr.isLeader ? (
                                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
                                    👑 Influencer Lideri
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-xs font-semibold text-indigo-600">
                                {cr.handle} • {cr.platform}
                              </p>
                              <p className="mt-1 text-xs text-slate-600">
                                {cr.city} • {cr.category}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-600">
                                Takipçi: <strong>{cr.followers}</strong> •
                                Etkileşim:{" "}
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

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-xs">
                            <button
                              type="button"
                              onClick={() => handleToggleCreatorLeader(cr.id)}
                              className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 font-bold text-amber-900 hover:bg-amber-100"
                            >
                              {cr.isLeader
                                ? "👑 Lider Rozetini Kaldır"
                                : "👑 Lider Rozeti Ver"}
                            </button>
                            {cr.status === "PENDING_REVIEW" ? (
                              <button
                                type="button"
                                onClick={() => handleApproveCreator(cr.id)}
                                className="rounded-lg bg-emerald-600 px-3 py-1 font-bold text-white hover:bg-emerald-700"
                              >
                                Onayla & Vitrine Aç
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

                  {/* 1,000 Influencer Outreach & Directory */}
                  <ThousandCreatorsCrmSection locale={locale} />
                </>
              )}

              {/* SuperAdmin Section: Brand Campaigns Manager */}
              {(activeTab === "overview" || activeTab === "campaigns") && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Marka İlanları & Teklif Havuzu
                      </span>
                      <h2 className="mt-0.5 text-lg font-black text-slate-950">
                        Marka Kampanyaları ve Yeni İlan Yayınlama Merkezi
                      </h2>
                    </div>
                    <Link
                      href={`/${locale}/kampanyalar`}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Canlı Kampanyalar Sayfasını Gör <ExternalLink size={13} />
                    </Link>
                  </div>

                  {/* Create Campaign Form */}
                  <form
                    onSubmit={handleAddAdminCampaign}
                    className="mt-4 grid grid-cols-1 gap-2.5 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 text-xs sm:grid-cols-3 lg:grid-cols-6"
                  >
                    <input
                      type="text"
                      required
                      value={newCmpBrand}
                      onChange={(e) => setNewCmpBrand(e.target.value)}
                      placeholder="Marka Adı"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                    />
                    <input
                      type="text"
                      required
                      value={newCmpTitle}
                      onChange={(e) => setNewCmpTitle(e.target.value)}
                      placeholder="Kampanya Başlığı"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                    />
                    <select
                      value={newCmpCity}
                      onChange={(e) => setNewCmpCity(e.target.value)}
                      aria-label="Kampanya Şehri"
                      className="rounded-xl border border-slate-300 bg-white px-2.5 py-2"
                    >
                      {INITIAL_CITIES.map((c) => (
                        <option key={c.slug} value={c.nameTr}>
                          {c.plateCode} - {c.nameTr}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newCmpCategory}
                      onChange={(e) => setNewCmpCategory(e.target.value)}
                      aria-label="Kampanya Kategorisi"
                      className="rounded-xl border border-slate-300 bg-white px-2.5 py-2"
                    >
                      {INITIAL_CATEGORIES.map((cat) => (
                        <option key={cat.slugTr} value={cat.nameTr}>
                          {cat.nameTr}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1000}
                      step={500}
                      value={newCmpBudgetTl}
                      onChange={(e) =>
                        setNewCmpBudgetTl(Number(e.target.value))
                      }
                      placeholder="Bütçe (TL)"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-indigo-600 px-3 py-2 font-black text-white hover:bg-indigo-700"
                    >
                      + Kampanyayı Yayınla
                    </button>
                  </form>

                  <div className="mt-4 grid grid-cols-1 gap-3.5 md:grid-cols-2">
                    {adminCampaigns.map((cmp) => (
                      <div
                        key={cmp.id}
                        className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-indigo-700">
                              {cmp.brandName} • {cmp.city}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                cmp.status === "OPEN"
                                  ? "bg-emerald-100 text-emerald-900"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {cmp.status === "OPEN"
                                ? "Başvuruya Açık"
                                : "Tamamlandı"}
                            </span>
                          </div>
                          <h3 className="mt-1.5 text-sm font-black text-slate-950">
                            {cmp.title}
                          </h3>
                          <p className="mt-1 text-slate-600">
                            Kategori: <strong>{cmp.category}</strong> • Kanal:{" "}
                            <strong>{cmp.platform}</strong>
                          </p>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                          <div>
                            <span className="text-slate-500">Bütçe: </span>
                            <strong className="text-sm font-black text-slate-950">
                              {cmp.budgetTl.toLocaleString("tr-TR")} TL
                            </strong>
                            <span className="ml-2 text-emerald-700">
                              ({cmp.proposalCount} Başvuru)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleCampaignStatus(cmp.id)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1 font-bold text-slate-700 hover:bg-slate-100"
                          >
                            {cmp.status === "OPEN"
                              ? "İlanı Kapat"
                              : "Tekrar Yayına Aç"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SuperAdmin Section: Service Packages Management */}
              {activeTab === "packages" && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs lg:col-span-7">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Vitrin Hizmet Paketleri
                    </span>
                    <h2 className="mt-1 text-lg font-black text-slate-950">
                      Yayındaki Hazır Hizmet Paketleri ({creatorServices.length})
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
                                <div className="flex items-center gap-2">
                                  <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-900">
                                    {srv.platform}
                                  </span>
                                  <span className="text-xs font-bold text-slate-600">
                                    {srv.creatorName}
                                  </span>
                                </div>
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
                                  Marka Ödemesi
                                </span>
                                <strong className="text-base font-black text-slate-950">
                                  {formatMinorUnits(b.grossAmountMinorUnits)}
                                </strong>
                                <span className="mt-0.5 block text-xs font-extrabold text-emerald-700">
                                  %85 Üretici Payı:{" "}
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

                  <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-2xs lg:col-span-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Süperadmin Paket Ekleme
                    </span>
                    <h2 className="mt-1 text-lg font-black text-slate-950">
                      Yeni Hizmet Paketi Oluştur
                    </h2>
                    <form
                      onSubmit={handleAddCreatorPackage}
                      className="mt-4 space-y-3 text-xs"
                    >
                      <div>
                        <label className="block font-bold text-slate-700">
                          Influencer / Üretici
                        </label>
                        <input
                          type="text"
                          required
                          value={newPkgCreator}
                          onChange={(e) => setNewPkgCreator(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700">
                          Paket Başlığı
                        </label>
                        <input
                          type="text"
                          required
                          value={newPkgTitle}
                          onChange={(e) => setNewPkgTitle(e.target.value)}
                          placeholder="Örn: 1 Adet 60 sn Instagram Reels + 2 Story"
                          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700">
                            Kanal
                          </label>
                          <select
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
                            <option value="INSTAGRAM">Instagram</option>
                            <option value="TIKTOK">TikTok</option>
                            <option value="YOUTUBE">YouTube</option>
                            <option value="UGC">UGC Video</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700">
                            Paket Fiyatı (TL)
                          </label>
                          <input
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
                      <div className="rounded-xl bg-emerald-50 p-3 text-emerald-950">
                        <div className="flex justify-between">
                          <span>Platform Hizmet Payı (%15):</span>
                          <strong>
                            {(newPkgPriceTl * 0.15).toLocaleString("tr-TR")} TL
                          </strong>
                        </div>
                        <div className="mt-1 flex justify-between text-sm font-black text-emerald-800">
                          <span>Üreticiye Ödenecek (%85):</span>
                          <span>
                            {(newPkgPriceTl * 0.85).toLocaleString("tr-TR")} TL
                          </span>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-white hover:bg-emerald-700"
                      >
                        + Hizmet Paketini Yayınla
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* SuperAdmin Section: 81 Provinces SEO & Sitemap Explorer */}
              {(activeTab === "overview" || activeTab === "seo") && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Türkiye 81 İl × 7 Bölge × 25 Kategori SEO Yönetimi
                      </span>
                      <h2 className="mt-0.5 text-lg font-black text-slate-950">
                        Türkiye Geneli Programatik SEO Sayfaları ve Site Haritaları
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/${locale}/influencer/turkiye`}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                      >
                        81 İl SEO Rehberini Aç →
                      </Link>
                      <a
                        href="/sitemap.xml"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        /sitemap.xml ↗
                      </a>
                      <a
                        href="/sitemaps/cities.xml"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        /sitemaps/cities.xml ↗
                      </a>
                      <a
                        href="/robots.txt"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        /robots.txt ↗
                      </a>
                    </div>
                  </div>

                  {/* Region Filter Buttons */}
                  <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setSeoRegionFilter("ALL")}
                      className={`rounded-lg px-2.5 py-1 font-bold ${
                        seoRegionFilter === "ALL"
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      Tüm Türkiye (81 İl)
                    </button>
                    {TURKIYE_REGIONS.map((reg) => (
                      <button
                        key={reg}
                        type="button"
                        onClick={() => setSeoRegionFilter(reg)}
                        className={`rounded-lg px-2.5 py-1 font-bold ${
                          seoRegionFilter === reg
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {reg}
                      </button>
                    ))}
                  </div>

                  {/* All 81 Cities Direct Links */}
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9">
                    {filteredSeoCities.map((city) => (
                      <Link
                        key={city.slug}
                        href={`/${locale}/influencer/${city.slug}`}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-800 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-950"
                      >
                        <span className="truncate">
                          {city.plateCode} {city.nameTr}
                        </span>
                        <span className="text-[10px] text-indigo-600">→</span>
                      </Link>
                    ))}
                  </div>
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
                      👑 Influencer Lideri: Gül Koç (@guldkoc) • %85 Net Üretici Payı
                    </span>
                    <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                      Hoş Geldin Gül Koç, Influencer & UGC Üretici Paneli
                    </h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-emerald-100">
                      Hizmet paketlerini oluştur, kendi fiyatını ve kullanım
                      süresini belirle. Marka ödemesi güvenceye alınmadan çekime
                      başlama riski olmadan %85 net hakedişle kazan.
                    </p>
                  </div>
                  <Link
                    href={`/${locale}/influencer/guldkoc`}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-950 shadow-sm hover:bg-emerald-50"
                  >
                    <Globe size={15} />
                    Canlı Profilimi Gör (@guldkoc) ↗
                  </Link>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-emerald-200">
                      Tamamlanan İş Kazancı (%85)
                    </span>
                    <p className="mt-1 text-2xl font-black text-emerald-300">
                      23.800,00 TL
                    </p>
                    <span className="text-[11px] text-slate-300">
                      Toplam 28.000 TL iş hacminden
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-cyan-200">
                      Güvencedeki Aktif Sipariş
                    </span>
                    <p className="mt-1 text-2xl font-black text-white">
                      8.500,00 TL
                    </p>
                    <span className="text-[11px] text-cyan-300">
                      INF-2026-000001 (Ödemesi Hazır)
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
                      Instagram & UGC Video
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-indigo-200">
                      Ortalama Etkileşim Oranı
                    </span>
                    <p className="mt-1 text-2xl font-black text-white">%5.80</p>
                    <span className="text-[11px] text-emerald-300">
                      Doğrulanmış Profil Rozetli
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
                                  Marka Ödemesi
                                </span>
                                <strong className="text-base font-black text-slate-950">
                                  {formatMinorUnits(b.grossAmountMinorUnits)}
                                </strong>
                                <span className="mt-0.5 block text-xs font-extrabold text-emerald-700">
                                  Senin %85 Kazancın:{" "}
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
                      Yeni Paket Ekle
                    </span>
                    <h2 className="mt-1 text-lg font-black text-slate-950">
                      Hizmet Paketi & %85 Kazanç Hesaplayıcı
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
                          placeholder="Örn: 1 Adet 60 sn TikTok + Reklam Kullanım İzni"
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
                            <option value="INSTAGRAM">Instagram</option>
                            <option value="TIKTOK">TikTok</option>
                            <option value="YOUTUBE">YouTube</option>
                            <option value="UGC">UGC Video</option>
                          </select>
                        </div>
                        <div>
                          <label
                            htmlFor="pkg-price"
                            className="block font-bold text-slate-700"
                          >
                            Paket Fiyatı (TL)
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
                          Kullanım ve Yayın Kapsamı
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
                          <span>Platform Hizmet Bedeli (%15):</span>
                          <strong>
                            {(newPkgPriceTl * 0.15).toLocaleString("tr-TR")} TL
                          </strong>
                        </div>
                        <div className="mt-1 flex justify-between text-sm font-black text-emerald-800">
                          <span>Senin %85 Net Kazancın:</span>
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
                    Aktif Sipariş Odası • INF-2026-000001 (Güvencede: 10.000 TL)
                  </span>
                  <h2 className="mt-1 text-lg font-black text-slate-950">
                    İçerik Teslimi ve #reklam Paylaşım Linki Gönderimi
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">
                    Yayın bağlantınızda <code>#reklam</code> veya{" "}
                    <code>#işbirliği</code> etiketi doğrulandığında sipariş
                    tamamlanır ve <strong>8.500,00 TL (%85)</strong> kazancınız
                    hesabınıza aktarılır.
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
                          "Yayın bağlantısı ve #reklam etiketi doğrulandı! 8.500,00 TL (%85) hakedişiniz ödeme sırasına alındı."
                        )
                      }
                      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
                    >
                      Paylaşım Linkini Gönder & Onayla
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
                      Marka & Ajans Paneli • Ücretsiz İlan & Kampanya Yönetimi
                    </span>
                    <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                      Reklamveren Kampanya, Teklif ve Sipariş Merkezi
                    </h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-indigo-100">
                      Saniyeler içinde kampanya ilanı oluşturun, influencer
                      tekliflerini karşılaştırın ve içerik onaylanana kadar
                      güvenli ödeme korumasıyla çalışın.
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
                    <p className="mt-1 text-2xl font-black text-white">3 İlan</p>
                    <span className="text-[11px] text-emerald-300">
                      14 Influencer Başvurusu
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-cyan-200">
                      Güvencedeki Sipariş
                    </span>
                    <p className="mt-1 text-2xl font-black text-white">
                      10.000,00 TL
                    </p>
                    <span className="text-[11px] text-cyan-300">
                      INF-2026-000001 (Çekim Aşamasında)
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-emerald-200">
                      Üyelik & İlan Ücreti
                    </span>
                    <p className="mt-1 text-2xl font-black text-emerald-300">
                      0 TL
                    </p>
                    <span className="text-[11px] text-slate-300">
                      Aidat veya abonelik yok
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-amber-200">
                      Kullanım & Telif Güvencesi
                    </span>
                    <p className="mt-1 text-2xl font-black text-white">
                      Net Sözleşme
                    </p>
                    <span className="text-[11px] text-amber-300">
                      Sipariş Anında Kayıtlı
                    </span>
                  </div>
                </div>
              </div>

              {/* Advertiser AI Campaign Brief Assistant */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
                  Akıllı Kampanya İlan Asistanı
                </span>
                <h2 className="mt-1 text-lg font-black text-slate-950">
                  Hızlı Kampanya İlanı ve İçerik Senaryosu Oluşturucu
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
                      Kampanya Bütçesi (TL)
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
                      Tanıtılacak Ürün ve Kampanya Hedefi
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
                      Kampanya Taslağı Hazırla
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
                      <strong>Önerilen Çekim Senaryosu:</strong>{" "}
                      {String(advAiResult.adScriptDraft)}
                    </p>
                    <p>
                      <strong>Yasal Etiket:</strong>{" "}
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
