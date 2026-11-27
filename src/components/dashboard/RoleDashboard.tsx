"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
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
  Mail,
  Megaphone,
  Package,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Trash2,
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
import {
  getInfluNexAuth,
  getInfluNexFirestore,
} from "@/lib/firebase/client";
import { INFLUNEX_TENANT_ID } from "@/lib/firebase/isolation";
import {
  INITIAL_CATEGORIES,
  INITIAL_CITIES,
  TURKIYE_REGIONS,
} from "@/lib/data/catalog";
import {
  INFLUNEX_SESSION_STORAGE_KEY,
  type StoredInfluNexSession,
} from "@/components/auth/NavbarAuthActions";

type WorkspaceRole = UserRole;

interface RoleDashboardProps {
  locale: string;
  role: WorkspaceRole;
}

export interface RealCreatorServiceItem {
  id: string;
  title: string;
  creatorName: string;
  creatorHandle: string;
  platform: "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "UGC";
  priceTl: number;
  deliveryDays: number;
  revisions: number;
  usageScope: string;
}

export interface RealCreatorItem {
  id: string;
  name: string;
  handle: string;
  username: string;
  city: string;
  category: string;
  platform: "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "UGC";
  followers: number;
  erPercent: number;
  isLeader: boolean;
  email: string;
  socialUrl: string;
  status: "APPROVED" | "PENDING_REVIEW";
}

export interface RealLedgerOrder {
  orderCode: string;
  brandName: string;
  creatorName: string;
  serviceTitle: string;
  grossTl: number;
  bankTransactionRef: string;
  state: "PAYMENT_REVIEW" | "PAID" | "COMPLETED" | "PAYOUT_COMPLETED";
  adDisclosureVerified: boolean;
  publishUrl?: string;
  createdAt: string;
}

export interface RealCampaignItem {
  id: string;
  brandName: string;
  title: string;
  city: string;
  category: string;
  platform: "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "UGC";
  budgetTl: number;
  proposalCount: number;
  status: "OPEN" | "COMPLETED";
  createdAt: string;
}

export const REAL_STORAGE_KEYS = {
  CREATORS: "influnex_real_creators_v1",
  ORDERS: "influnex_real_orders_v1",
  CAMPAIGNS: "influnex_real_campaigns_v1",
  SERVICES: "influnex_real_services_v1",
} as const;

// Yalnızca gerçek doğrulanmış Instagram profili: Gül Koç (@guldkoc - https://www.instagram.com/guldkoc/)
const VERIFIED_REAL_CREATORS: RealCreatorItem[] = [
  {
    id: "cr_adana_guzellik_guldkoc",
    name: "Gül Koç",
    handle: "@guldkoc",
    username: "guldkoc",
    city: "Adana",
    category: "Güzellik & Kozmetik",
    platform: "INSTAGRAM",
    followers: 10398,
    erPercent: 5.8,
    isLeader: true,
    email: "",
    socialUrl: "https://www.instagram.com/guldkoc/",
    status: "APPROVED",
  },
];

// Yalnızca gerçek doğrulanmış üretici (@guldkoc) hizmet paketleri
const VERIFIED_REAL_SERVICES: RealCreatorServiceItem[] = [
  {
    id: "srv_guldkoc_reels",
    title: "Instagram Reels Güzellik, Kombin & Yaşam Tarzı Tanıtımı",
    creatorName: "Gül Koç",
    creatorHandle: "@guldkoc",
    platform: "INSTAGRAM",
    priceTl: 3500,
    deliveryDays: 3,
    revisions: 2,
    usageScope: "Organik sosyal medya hesaplarında 1 yıl paylaşım hakkı",
  },
  {
    id: "srv_guldkoc_story",
    title: "3 Kare Instagram Story + Ürün Linki & Etiket Paylaşımı",
    creatorName: "Gül Koç",
    creatorHandle: "@guldkoc",
    platform: "INSTAGRAM",
    priceTl: 2000,
    deliveryDays: 2,
    revisions: 1,
    usageScope: "24 saat Story yayını + Öne Çıkanlar opsiyonu",
  },
  {
    id: "srv_guldkoc_ugc",
    title: "UGC Güzellik & Moda Ürün Deneyim Videosu (9:16 Dikey Kreatif)",
    creatorName: "Gül Koç",
    creatorHandle: "@guldkoc",
    platform: "UGC",
    priceTl: 2500,
    deliveryDays: 3,
    revisions: 2,
    usageScope: "Organik ve Meta/TikTok ücretli reklamlarında 180 gün kullanım",
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

  // Sadece gerçek veriler (Sıfır mock sipariş, sıfır mock kampanya, sıfır uydurma üretici!)
  const [adminCreators, setAdminCreators] = useState<RealCreatorItem[]>(
    VERIFIED_REAL_CREATORS
  );
  const [ledgerOrders, setLedgerOrders] = useState<RealLedgerOrder[]>([]);
  const [ledgerFilter, setLedgerFilter] = useState<string>("ALL");
  const [adminCampaigns, setAdminCampaigns] = useState<RealCampaignItem[]>([]);
  const [creatorServices, setCreatorServices] = useState<
    RealCreatorServiceItem[]
  >(VERIFIED_REAL_SERVICES);
  const [adminNotice, setAdminNotice] = useState<string>("");
  const [activityLogs, setActivityLogs] = useState<string[]>([]);

  // SuperAdmin: Yeni Gerçek Influencer Ekleme Formu
  const [newCrName, setNewCrName] = useState("");
  const [newCrHandle, setNewCrHandle] = useState("");
  const [newCrEmail, setNewCrEmail] = useState("");
  const [newCrCity, setNewCrCity] = useState("Adana");
  const [newCrCategory, setNewCrCategory] = useState("Güzellik & Kozmetik");
  const [newCrPlatform, setNewCrPlatform] = useState<
    "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "UGC"
  >("INSTAGRAM");
  const [newCrFollowers, setNewCrFollowers] = useState<number>(10000);
  const [newCrEr, setNewCrEr] = useState<number>(4.5);
  const [newCrIsLeader, setNewCrIsLeader] = useState(false);

  // SuperAdmin: Yeni Gerçek Sipariş Oluşturma Formu
  const [newOrdBrand, setNewOrdBrand] = useState("");
  const [newOrdCreator, setNewOrdCreator] = useState("Gül Koç (@guldkoc)");
  const [newOrdService, setNewOrdService] = useState(
    "Instagram Reels Güzellik, Kombin & Yaşam Tarzı Tanıtımı"
  );
  const [newOrdGrossTl, setNewOrdGrossTl] = useState<number>(3500);
  const [newOrdBankRef, setNewOrdBankRef] = useState("");

  // SuperAdmin: Yeni Gerçek Kampanya Formu
  const [newCmpBrand, setNewCmpBrand] = useState("");
  const [newCmpTitle, setNewCmpTitle] = useState("");
  const [newCmpCity, setNewCmpCity] = useState("Adana");
  const [newCmpCategory, setNewCmpCategory] = useState("Güzellik & Kozmetik");
  const [newCmpPlatform, setNewCmpPlatform] = useState<
    "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "UGC"
  >("INSTAGRAM");
  const [newCmpBudgetTl, setNewCmpBudgetTl] = useState<number>(5000);

  // SuperAdmin: 81 İl SEO Filtresi
  const [seoRegionFilter, setSeoRegionFilter] = useState<string>("ALL");

  // Hizmet Paketi Formu
  const [newPkgTitle, setNewPkgTitle] = useState("");
  const [newPkgCreator, setNewPkgCreator] = useState("Gül Koç");
  const [newPkgHandle, setNewPkgHandle] = useState("@guldkoc");
  const [newPkgPlatform, setNewPkgPlatform] = useState<
    "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "UGC"
  >("INSTAGRAM");
  const [newPkgPriceTl, setNewPkgPriceTl] = useState<number>(3500);
  const [newPkgDeliveryDays, setNewPkgDeliveryDays] = useState<number>(3);
  const [newPkgRevisions, setNewPkgRevisions] = useState<number>(2);
  const [newPkgUsage, setNewPkgUsage] = useState(
    "Organik Paylaşım + 30 Gün Dijital Kullanım"
  );

  // Yayıncı Teslim Linki
  const [selectedOrderCodeForDelivery, setSelectedOrderCodeForDelivery] =
    useState<string>("");
  const [creatorPublishUrl, setCreatorPublishUrl] = useState("");
  const [creatorDeliveryMsg, setCreatorDeliveryMsg] = useState("");

  // Reklamveren Kampanya Taslağı Formu (Boş başlar, mock veri yok)
  const [advBrandName, setAdvBrandName] = useState("");
  const [advWebsite, setAdvWebsite] = useState("");
  const [advBriefDesc, setAdvBriefDesc] = useState("");
  const [advBudgetTl, setAdvBudgetTl] = useState<number>(5000);
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
      ...prev.slice(0, 14),
    ]);
  }

  useEffect(() => {
    setActiveViewRole(role);
  }, [role]);

  // Gerçek verileri localStorage + Firestore (influnex-db) üzerinden yükle
  useEffect(() => {
    try {
      const savedCreators = window.localStorage.getItem(
        REAL_STORAGE_KEYS.CREATORS
      );
      if (savedCreators) {
        const parsed = JSON.parse(savedCreators) as RealCreatorItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAdminCreators(parsed);
        }
      }

      const savedOrders = window.localStorage.getItem(REAL_STORAGE_KEYS.ORDERS);
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders) as RealLedgerOrder[];
        if (Array.isArray(parsed)) {
          setLedgerOrders(parsed);
        }
      }

      const savedCampaigns = window.localStorage.getItem(
        REAL_STORAGE_KEYS.CAMPAIGNS
      );
      if (savedCampaigns) {
        const parsed = JSON.parse(savedCampaigns) as RealCampaignItem[];
        if (Array.isArray(parsed)) {
          setAdminCampaigns(parsed);
        }
      }

      const savedServices = window.localStorage.getItem(
        REAL_STORAGE_KEYS.SERVICES
      );
      if (savedServices) {
        const parsed = JSON.parse(savedServices) as RealCreatorServiceItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCreatorServices(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }

    // Firestore (influnex-db) üzerindeki gerçek koleksiyonları senkronize et
    async function syncFromFirestore() {
      try {
        const db = getInfluNexFirestore();

        const [ordersSnap, campaignsSnap, creatorsSnap, servicesSnap] =
          await Promise.all([
            getDocs(collection(db, "influnex_orders")).catch(() => null),
            getDocs(collection(db, "influnex_campaigns")).catch(() => null),
            getDocs(collection(db, "influnex_publicCreatorProfiles")).catch(
              () => null
            ),
            getDocs(collection(db, "influnex_creatorServices")).catch(
              () => null
            ),
          ]);

        if (ordersSnap && !ordersSnap.empty) {
          const fsOrders: RealLedgerOrder[] = [];
          ordersSnap.forEach((d) => {
            const data = d.data() as Partial<RealLedgerOrder>;
            if (data.orderCode && data.brandName) {
              fsOrders.push({
                orderCode: data.orderCode,
                brandName: data.brandName,
                creatorName: data.creatorName || "Gül Koç (@guldkoc)",
                serviceTitle: data.serviceTitle || "",
                grossTl: Number(data.grossTl || 0),
                bankTransactionRef: data.bankTransactionRef || "",
                state: data.state || "PAYMENT_REVIEW",
                adDisclosureVerified: Boolean(data.adDisclosureVerified),
                publishUrl: data.publishUrl,
                createdAt: data.createdAt || "",
              });
            }
          });
          if (fsOrders.length > 0) {
            setLedgerOrders(fsOrders);
            window.localStorage.setItem(
              REAL_STORAGE_KEYS.ORDERS,
              JSON.stringify(fsOrders)
            );
          }
        }

        if (campaignsSnap && !campaignsSnap.empty) {
          const fsCampaigns: RealCampaignItem[] = [];
          campaignsSnap.forEach((d) => {
            const data = d.data() as Partial<RealCampaignItem>;
            if (data.id && data.title) {
              fsCampaigns.push({
                id: data.id,
                brandName: data.brandName || "",
                title: data.title,
                city: data.city || "Adana",
                category: data.category || "Güzellik & Kozmetik",
                platform: data.platform || "INSTAGRAM",
                budgetTl: Number(data.budgetTl || 0),
                proposalCount: Number(data.proposalCount || 0),
                status: data.status || "OPEN",
                createdAt: data.createdAt || "",
              });
            }
          });
          if (fsCampaigns.length > 0) {
            setAdminCampaigns(fsCampaigns);
            window.localStorage.setItem(
              REAL_STORAGE_KEYS.CAMPAIGNS,
              JSON.stringify(fsCampaigns)
            );
          }
        }

        if (creatorsSnap && !creatorsSnap.empty) {
          const fsCreators: RealCreatorItem[] = [...VERIFIED_REAL_CREATORS];
          creatorsSnap.forEach((d) => {
            const data = d.data() as Partial<RealCreatorItem>;
            if (
              data.id &&
              data.name &&
              !fsCreators.some((existing) => existing.id === data.id)
            ) {
              fsCreators.push({
                id: data.id,
                name: data.name,
                handle: data.handle || `@${data.username || "creator"}`,
                username: data.username || data.id,
                city: data.city || "Adana",
                category: data.category || "Güzellik & Kozmetik",
                platform: data.platform || "INSTAGRAM",
                followers: Number(data.followers || 0),
                erPercent: Number(data.erPercent || 0),
                isLeader: Boolean(data.isLeader),
                email: data.email || "",
                socialUrl: data.socialUrl || "",
                status: data.status || "APPROVED",
              });
            }
          });
          setAdminCreators(fsCreators);
          window.localStorage.setItem(
            REAL_STORAGE_KEYS.CREATORS,
            JSON.stringify(fsCreators)
          );
        }

        if (servicesSnap && !servicesSnap.empty) {
          const fsServices: RealCreatorServiceItem[] = [
            ...VERIFIED_REAL_SERVICES,
          ];
          servicesSnap.forEach((d) => {
            const data = d.data() as Partial<RealCreatorServiceItem>;
            if (
              data.id &&
              data.title &&
              !fsServices.some((existing) => existing.id === data.id)
            ) {
              fsServices.push({
                id: data.id,
                title: data.title,
                creatorName: data.creatorName || "Gül Koç",
                creatorHandle: data.creatorHandle || "@guldkoc",
                platform: data.platform || "INSTAGRAM",
                priceTl: Number(data.priceTl || 0),
                deliveryDays: Number(data.deliveryDays || 3),
                revisions: Number(data.revisions || 1),
                usageScope: data.usageScope || "",
              });
            }
          });
          setCreatorServices(fsServices);
          window.localStorage.setItem(
            REAL_STORAGE_KEYS.SERVICES,
            JSON.stringify(fsServices)
          );
        }
      } catch {
        // Firestore read fallback to local state
      }
    }

    syncFromFirestore();
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(INFLUNEX_SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredInfluNexSession;
        if (parsed && parsed.email) {
          setStoredSession(parsed);
        }
      }
    } catch {
      // ignore
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

          if (
            !superAdminMatch &&
            role === "ADMIN" &&
            effectiveRole !== "ADMIN"
          ) {
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

  function persistCreators(next: RealCreatorItem[]) {
    setAdminCreators(next);
    try {
      window.localStorage.setItem(
        REAL_STORAGE_KEYS.CREATORS,
        JSON.stringify(next)
      );
    } catch {
      // ignore
    }
  }

  function persistOrders(next: RealLedgerOrder[]) {
    setLedgerOrders(next);
    try {
      window.localStorage.setItem(
        REAL_STORAGE_KEYS.ORDERS,
        JSON.stringify(next)
      );
    } catch {
      // ignore
    }
  }

  function persistCampaigns(next: RealCampaignItem[]) {
    setAdminCampaigns(next);
    try {
      window.localStorage.setItem(
        REAL_STORAGE_KEYS.CAMPAIGNS,
        JSON.stringify(next)
      );
    } catch {
      // ignore
    }
  }

  function persistServices(next: RealCreatorServiceItem[]) {
    setCreatorServices(next);
    try {
      window.localStorage.setItem(
        REAL_STORAGE_KEYS.SERVICES,
        JSON.stringify(next)
      );
    } catch {
      // ignore
    }
  }

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
      `Süperadmin (${SUPER_ADMIN_EMAIL}) tam erişim oturumu aktifleştirildi.`
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

  async function handleAddCreatorPackage(e: React.FormEvent) {
    e.preventDefault();
    if (!newPkgTitle.trim()) return;
    const item: RealCreatorServiceItem = {
      id: `srv_${Date.now()}`,
      title: newPkgTitle.trim(),
      creatorName: newPkgCreator.trim() || "Gül Koç",
      creatorHandle: newPkgHandle.trim() || "@guldkoc",
      platform: newPkgPlatform,
      priceTl: Number(newPkgPriceTl),
      deliveryDays: Number(newPkgDeliveryDays),
      revisions: Number(newPkgRevisions),
      usageScope: newPkgUsage,
    };
    const next = [item, ...creatorServices];
    persistServices(next);
    try {
      const db = getInfluNexFirestore();
      await setDoc(doc(db, "influnex_creatorServices", item.id), {
        ...item,
        tenantId: INFLUNEX_TENANT_ID,
      });
    } catch {
      // local storage already updated
    }
    pushLog(
      `Yeni hizmet paketi kaydedildi: "${item.title}" (${item.priceTl.toLocaleString("tr-TR")} TL).`
    );
    setNewPkgTitle("");
  }

  async function handleDeleteServicePackage(id: string) {
    const next = creatorServices.filter((s) => s.id !== id);
    persistServices(next);
    try {
      const db = getInfluNexFirestore();
      await deleteDoc(doc(db, "influnex_creatorServices", id));
    } catch {
      // ignore
    }
    pushLog("Hizmet paketi silindi.");
  }

  async function handleAddAdminCreator(e: React.FormEvent) {
    e.preventDefault();
    if (!newCrName.trim() || !newCrHandle.trim()) return;
    const cleanUsername = newCrHandle
      .trim()
      .replace(/^@/, "")
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "");
    const formattedHandle = `@${cleanUsername}`;
    const newItem: RealCreatorItem = {
      id: `cr_${cleanUsername}_${Date.now()}`,
      name: newCrName.trim(),
      handle: formattedHandle,
      username: cleanUsername,
      city: newCrCity,
      category: newCrCategory,
      platform: newCrPlatform,
      followers: Number(newCrFollowers) || 0,
      erPercent: Number(newCrEr) || 0,
      isLeader: newCrIsLeader,
      email: newCrEmail.trim(),
      socialUrl: `https://www.instagram.com/${cleanUsername}/`,
      status: "APPROVED",
    };
    const next = [newItem, ...adminCreators];
    persistCreators(next);
    try {
      const db = getInfluNexFirestore();
      await setDoc(doc(db, "influnex_publicCreatorProfiles", newItem.id), {
        id: newItem.id,
        tenantId: INFLUNEX_TENANT_ID,
        name: newItem.name,
        handle: newItem.handle,
        username: newItem.username,
        city: newItem.city,
        category: newItem.category,
        platform: newItem.platform,
        followers: newItem.followers,
        erPercent: newItem.erPercent,
        isLeader: newItem.isLeader,
        socialUrl: newItem.socialUrl,
        status: newItem.status,
      });
    } catch {
      // local storage already updated
    }
    pushLog(
      `Gerçek influencer profili eklendi: ${newItem.name} (${newItem.handle} • ${newItem.city}).`
    );
    setNewCrName("");
    setNewCrHandle("");
    setNewCrEmail("");
  }

  function handleUpdateCreatorEmail(id: string, email: string) {
    const next = adminCreators.map((c) =>
      c.id === id ? { ...c, email } : c
    );
    persistCreators(next);
  }

  async function handleToggleCreatorLeader(id: string) {
    const next = adminCreators.map((c) =>
      c.id === id ? { ...c, isLeader: !c.isLeader } : c
    );
    persistCreators(next);
    const updated = next.find((c) => c.id === id);
    if (updated) {
      try {
        const db = getInfluNexFirestore();
        await setDoc(
          doc(db, "influnex_publicCreatorProfiles", id),
          { isLeader: updated.isLeader, tenantId: INFLUNEX_TENANT_ID },
          { merge: true }
        );
      } catch {
        // ignore
      }
    }
    pushLog("Influencer Lideri (👑) rozeti güncellendi.");
  }

  async function handleDeleteCreator(id: string) {
    const target = adminCreators.find((c) => c.id === id);
    const next = adminCreators.filter((c) => c.id !== id);
    persistCreators(next);
    try {
      const db = getInfluNexFirestore();
      await deleteDoc(doc(db, "influnex_publicCreatorProfiles", id));
    } catch {
      // ignore
    }
    pushLog(`${target?.name || id} profili listeden silindi.`);
  }

  async function handleCreateAdminOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!newOrdBrand.trim() || !newOrdCreator.trim() || !newOrdBankRef.trim()) {
      return;
    }
    if (
      ledgerOrders.some(
        (o) =>
          o.bankTransactionRef.toLowerCase() ===
          newOrdBankRef.trim().toLowerCase()
      )
    ) {
      pushLog(
        `Hata: "${newOrdBankRef.trim()}" banka referans numarası daha önce kullanılmış!`
      );
      return;
    }

    const nextCode = `INF-${new Date().getFullYear()}-${String(
      ledgerOrders.length + 1
    ).padStart(6, "0")}`;
    const item: RealLedgerOrder = {
      orderCode: nextCode,
      brandName: newOrdBrand.trim(),
      creatorName: newOrdCreator.trim(),
      serviceTitle: newOrdService.trim(),
      grossTl: Number(newOrdGrossTl),
      bankTransactionRef: newOrdBankRef.trim(),
      state: "PAYMENT_REVIEW",
      adDisclosureVerified: false,
      createdAt: new Date().toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const next = [item, ...ledgerOrders];
    persistOrders(next);
    try {
      const db = getInfluNexFirestore();
      await setDoc(doc(db, "influnex_orders", item.orderCode), {
        ...item,
        tenantId: INFLUNEX_TENANT_ID,
      });
    } catch {
      // ignore
    }
    pushLog(
      `Gerçek sipariş kaydedildi: ${nextCode} (${item.brandName} → ${item.creatorName}, ${item.grossTl.toLocaleString("tr-TR")} TL).`
    );
    setNewOrdBrand("");
    setNewOrdBankRef("");
  }

  async function handleAdvanceOrderState(orderCode: string) {
    let updatedItem: RealLedgerOrder | null = null;
    const next = ledgerOrders.map((ord) => {
      if (ord.orderCode !== orderCode) return ord;
      if (ord.state === "PAYMENT_REVIEW") {
        updatedItem = { ...ord, state: "PAID" };
        pushLog(
          `${orderCode} banka dekontu (${ord.bankTransactionRef}) onaylandı; tutar güvenli blokeye alındı.`
        );
        return updatedItem;
      }
      if (ord.state === "PAID") {
        updatedItem = {
          ...ord,
          state: "COMPLETED",
          adDisclosureVerified: true,
        };
        pushLog(
          `${orderCode} içerik teslimi ve #reklam etiketi onaylandı; sipariş tamamlandı.`
        );
        return updatedItem;
      }
      if (ord.state === "COMPLETED") {
        updatedItem = { ...ord, state: "PAYOUT_COMPLETED" };
        pushLog(
          `${orderCode} için %85 üretici hakedişi (${(ord.grossTl * 0.85).toLocaleString("tr-TR")} TL) ödendi.`
        );
        return updatedItem;
      }
      return ord;
    });
    persistOrders(next);
    if (updatedItem) {
      try {
        const db = getInfluNexFirestore();
        await setDoc(doc(db, "influnex_orders", orderCode), {
          ...(updatedItem as RealLedgerOrder),
          tenantId: INFLUNEX_TENANT_ID,
        });
      } catch {
        // ignore
      }
    }
  }

  async function handleDeleteOrder(orderCode: string) {
    const next = ledgerOrders.filter((o) => o.orderCode !== orderCode);
    persistOrders(next);
    try {
      const db = getInfluNexFirestore();
      await deleteDoc(doc(db, "influnex_orders", orderCode));
    } catch {
      // ignore
    }
    pushLog(`${orderCode} siparişi silindi.`);
  }

  async function handleAddAdminCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!newCmpBrand.trim() || !newCmpTitle.trim()) return;
    const item: RealCampaignItem = {
      id: `cmp_${Date.now()}`,
      brandName: newCmpBrand.trim(),
      title: newCmpTitle.trim(),
      city: newCmpCity,
      category: newCmpCategory,
      platform: newCmpPlatform,
      budgetTl: Number(newCmpBudgetTl),
      proposalCount: 0,
      status: "OPEN",
      createdAt: new Date().toLocaleDateString("tr-TR"),
    };
    const next = [item, ...adminCampaigns];
    persistCampaigns(next);
    try {
      const db = getInfluNexFirestore();
      await setDoc(doc(db, "influnex_campaigns", item.id), {
        ...item,
        tenantId: INFLUNEX_TENANT_ID,
      });
    } catch {
      // ignore
    }
    pushLog(
      `Yeni reklam kampanyası yayınlandı: "${item.title}" (${item.brandName} • ${item.budgetTl.toLocaleString("tr-TR")} TL).`
    );
    setNewCmpBrand("");
    setNewCmpTitle("");
  }

  async function handleToggleCampaignStatus(id: string) {
    const next = adminCampaigns.map((c) =>
      c.id === id
        ? {
            ...c,
            status: (c.status === "OPEN" ? "COMPLETED" : "OPEN") as
              | "OPEN"
              | "COMPLETED",
          }
        : c
    );
    persistCampaigns(next);
    const updated = next.find((c) => c.id === id);
    if (updated) {
      try {
        const db = getInfluNexFirestore();
        await setDoc(doc(db, "influnex_campaigns", id), {
          ...updated,
          tenantId: INFLUNEX_TENANT_ID,
        });
      } catch {
        // ignore
      }
    }
    pushLog("Kampanya durumu güncellendi.");
  }

  async function handleDeleteCampaign(id: string) {
    const next = adminCampaigns.filter((c) => c.id !== id);
    persistCampaigns(next);
    try {
      const db = getInfluNexFirestore();
      await deleteDoc(doc(db, "influnex_campaigns", id));
    } catch {
      // ignore
    }
    pushLog("Kampanya ilanı silindi.");
  }

  function handleExportLedgerCsv() {
    const header =
      "\uFEFFSiparisKodu;Tarih;Marka;Influencer;Hizmet;BrutTutarTL;Komisyon15TL;UreticiPayi85TL;BankaRef;Durum\n";
    const rows = ledgerOrders
      .map((o) => {
        const b = calculateCommissionBreakdown(o.grossTl * 100, "TRY");
        return `${o.orderCode};${o.createdAt};${o.brandName};${o.creatorName};${o.serviceTitle};${o.grossTl};${b.platformCommissionMinorUnits / 100};${b.creatorNetPayoutMinorUnits / 100};${o.bankTransactionRef};${o.state}`;
      })
      .join("\n");
    const blob = new Blob([header + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `influnex-gercek-muhasebe-defteri-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function buildInviteGmailUrl(creator: RealCreatorItem) {
    const subject =
      "InfluNex Marka İş Birlikleri Daveti — %85 Üretici Payı & %0 Üyelik Ücreti";
    const body = `Merhaba ${creator.name} (${creator.handle}),\n\n${creator.city} ve Türkiye genelinde ${creator.category} kategorisindeki içeriklerinizi beğeniyle takip ediyoruz.\n\nMarkalarla içerik üreticilerini şeffaf ve güvenli şekilde buluşturan pazaryerimiz InfluNex'te (https://www.influnex.com.tr) yerinizi almanız için sizi davet etmek istedik:\n• %0 Üyelik ve Listeleme Ücreti\n• Tamamlanan İş Birliklerinde %85 Üretici Payı\n• Güvenli Ödeme Koruması\n\nÜcretsiz profilinizi oluşturmak için:\nhttps://www.influnex.com.tr/tr/kayit?role=CREATOR\n\nSevgiler,\nInfluNex Yönetimi`;
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      creator.email
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function handleCreatorDeliverySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrderCodeForDelivery || !creatorPublishUrl.trim()) return;
    const next = ledgerOrders.map((o) =>
      o.orderCode === selectedOrderCodeForDelivery
        ? {
            ...o,
            state: "COMPLETED" as const,
            adDisclosureVerified: true,
            publishUrl: creatorPublishUrl.trim(),
          }
        : o
    );
    persistOrders(next);
    const updated = next.find(
      (o) => o.orderCode === selectedOrderCodeForDelivery
    );
    if (updated) {
      try {
        const db = getInfluNexFirestore();
        await setDoc(doc(db, "influnex_orders", updated.orderCode), {
          ...updated,
          tenantId: INFLUNEX_TENANT_ID,
        });
      } catch {
        // ignore
      }
    }
    setCreatorDeliveryMsg(
      `${selectedOrderCodeForDelivery} siparişi için yayın linki kaydedildi ve sipariş tamamlandı olarak işaretlendi.`
    );
    setCreatorPublishUrl("");
  }

  async function handleGenerateAdvAiBrief(e: React.FormEvent) {
    e.preventDefault();
    if (!advBrandName.trim() || !advWebsite.trim() || !advBriefDesc.trim()) {
      return;
    }
    try {
      const res = await fetch("/api/v1/campaigns/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: advBrandName.trim(),
          brandWebsite: advWebsite.trim(),
          productDescription: advBriefDesc.trim(),
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

  // Tüm finansal ve operasyonel metrikler %100 gerçek kayıtlardan dinamik hesaplanır
  const totalLedgerGrossMinor = ledgerOrders.reduce(
    (acc, o) => acc + o.grossTl * 100,
    0
  );
  const totalLedgerBreakdown = calculateCommissionBreakdown(
    totalLedgerGrossMinor,
    "TRY"
  );

  const completedCreatorPayoutMinor = ledgerOrders
    .filter((o) => o.state === "COMPLETED" || o.state === "PAYOUT_COMPLETED")
    .reduce(
      (acc, o) =>
        acc +
        calculateCommissionBreakdown(o.grossTl * 100, "TRY")
          .creatorNetPayoutMinorUnits,
      0
    );

  const paidEscrowGrossMinor = ledgerOrders
    .filter((o) => o.state === "PAID")
    .reduce((acc, o) => acc + o.grossTl * 100, 0);

  const paidEscrowCreatorMinor = ledgerOrders
    .filter((o) => o.state === "PAID")
    .reduce(
      (acc, o) =>
        acc +
        calculateCommissionBreakdown(o.grossTl * 100, "TRY")
          .creatorNetPayoutMinorUnits,
      0
    );

  const channelBreakdown = useMemo(() => {
    const total = Math.max(adminCreators.length, 1);
    const counts = {
      INSTAGRAM: adminCreators.filter((c) => c.platform === "INSTAGRAM").length,
      TIKTOK: adminCreators.filter((c) => c.platform === "TIKTOK").length,
      UGC: adminCreators.filter((c) => c.platform === "UGC").length,
      YOUTUBE: adminCreators.filter((c) => c.platform === "YOUTUBE").length,
    };
    return {
      INSTAGRAM: {
        count: counts.INSTAGRAM,
        pct: Math.round((counts.INSTAGRAM / total) * 100),
      },
      TIKTOK: {
        count: counts.TIKTOK,
        pct: Math.round((counts.TIKTOK / total) * 100),
      },
      UGC: {
        count: counts.UGC,
        pct: Math.round((counts.UGC / total) * 100),
      },
      YOUTUBE: {
        count: counts.YOUTUBE,
        pct: Math.round((counts.YOUTUBE / total) * 100),
      },
    };
  }, [adminCreators]);

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
              Sadece Gerçek Veriler • Sıfır Mock Veri
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

        {/* Universal SuperAdmin All-Pages Quick Jump Strip */}
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
              Veritabanı & SEO Denetimi
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
              Sipariş & Bloke Rehberi
            </Link>
            <Link
              href={`/${locale}/influencer`}
              className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-slate-200 hover:bg-white/20"
            >
              Influencer Vitrin
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
                  2. Gerçek Influencerlar ({adminCreators.length})
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
                  3. Siparişler & Muhasebe ({ledgerOrders.length})
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
                  Hizmet Paketlerim ({creatorServices.length})
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
                  Siparişlerim & Teslim ({ledgerOrders.length})
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
                Gerçek Veri Modu
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
                        Canlı Veritabanı: influnex-db (Sıfır Mock Veri)
                      </span>
                    </div>
                    <h1 className="mt-2.5 text-2xl font-black tracking-tight sm:text-3xl">
                      InfluNex Süperadmin Yönetim ve Kontrol Merkezi
                    </h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-300">
                      Bu panelde hiçbir örnek veya sahte veri yer almaz. Tüm
                      rakamlar yalnızca gerçek doğrulanmış üreticiler, gerçek
                      oluşturulan siparişler ve gerçek kampanyalardan hesaplanır.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleExportLedgerCsv}
                      disabled={ledgerOrders.length === 0}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-slate-950 shadow-sm hover:bg-emerald-400 disabled:opacity-40"
                    >
                      <Download size={15} />
                      Muhasebe Tablosunu İndir ({ledgerOrders.length} Kayıt)
                    </button>
                  </div>
                </div>

                {/* 6 Real Executive KPIs */}
                <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-slate-300">
                      Gerçek İşlem Hacmi
                    </span>
                    <p className="mt-1 text-xl font-black text-white">
                      {formatMinorUnits(
                        totalLedgerBreakdown.grossAmountMinorUnits
                      )}
                    </p>
                    <span className="text-[11px] text-emerald-300">
                      {ledgerOrders.length} Gerçek Sipariş
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
                      %85 Üretici Hakedişi
                    </span>
                    <p className="mt-1 text-xl font-black text-emerald-400">
                      {formatMinorUnits(
                        totalLedgerBreakdown.creatorNetPayoutMinorUnits
                      )}
                    </p>
                    <span className="text-[11px] text-slate-300">
                      Influencer Payı
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-amber-300">
                      Doğrulanmış Üretici
                    </span>
                    <p className="mt-1 text-xl font-black text-white">
                      {adminCreators.length}
                    </p>
                    <span className="text-[11px] text-amber-300">
                      Gerçek Kayıtlı Profil
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
                      Gerçek Marka İlanı
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-purple-300">
                      Türkiye İl Kapsamı
                    </span>
                    <p className="mt-1 text-xl font-black text-white">
                      {INITIAL_CITIES.length} İl
                    </p>
                    <span className="text-[11px] text-purple-300">
                      {INITIAL_CATEGORIES.length} Kategori
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

              {/* Overview Real Analytics & Activity Feed */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  {/* Real Channel Distribution & Quick Actions */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs lg:col-span-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                          Gerçek Kanal Dağılımı ({adminCreators.length} Kayıtlı Üretici)
                        </span>
                        <h2 className="mt-0.5 text-lg font-black text-slate-950">
                          Kayıtlı Influencer Kanal Dağılımı
                        </h2>
                      </div>
                      <TrendingUp className="text-indigo-600" size={20} />
                    </div>

                    <div className="mt-4 space-y-3.5 text-xs">
                      <div>
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>Instagram (Reels, Hikâye & Post)</span>
                          <span className="text-indigo-600">
                            {channelBreakdown.INSTAGRAM.count} Üretici (%
                            {channelBreakdown.INSTAGRAM.pct})
                          </span>
                        </div>
                        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-600 transition-all"
                            style={{
                              width: `${channelBreakdown.INSTAGRAM.pct}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>TikTok</span>
                          <span className="text-emerald-600">
                            {channelBreakdown.TIKTOK.count} Üretici (%
                            {channelBreakdown.TIKTOK.pct})
                          </span>
                        </div>
                        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{
                              width: `${channelBreakdown.TIKTOK.pct}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>UGC Video</span>
                          <span className="text-amber-600">
                            {channelBreakdown.UGC.count} Üretici (%
                            {channelBreakdown.UGC.pct})
                          </span>
                        </div>
                        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-amber-500 transition-all"
                            style={{ width: `${channelBreakdown.UGC.pct}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>YouTube</span>
                          <span className="text-rose-600">
                            {channelBreakdown.YOUTUBE.count} Üretici (%
                            {channelBreakdown.YOUTUBE.pct})
                          </span>
                        </div>
                        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-rose-500 transition-all"
                            style={{
                              width: `${channelBreakdown.YOUTUBE.pct}%`,
                            }}
                          />
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
                        + Gerçek Influencer Ekle
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
                        + Gerçek Sipariş Kaydet
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
                        + Gerçek Kampanya Aç
                      </button>
                    </div>
                  </div>

                  {/* Real Live Activity Log */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs lg:col-span-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Gerçek İşlem Kayıtları
                    </span>
                    <h2 className="mt-0.5 text-lg font-black text-slate-950">
                      Bu Oturumda Yapılan İşlemler
                    </h2>
                    {activityLogs.length === 0 ? (
                      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-xs text-slate-500">
                        Henüz bu oturumda yeni bir işlem kaydı yok. Yeni bir
                        influencer, sipariş, hizmet paketi veya kampanya
                        eklediğinizde işlemleriniz gerçek zamanlı olarak burada
                        listelenir.
                      </div>
                    ) : (
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
                    )}
                  </div>
                </div>
              )}

              {/* SuperAdmin Section: Real Creators & Real Email Outreach */}
              {(activeTab === "overview" || activeTab === "verifications") && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        Gerçek Influencer & Tanıtım Yönetimi
                      </span>
                      <h2 className="mt-0.5 text-lg font-black text-slate-950">
                        Doğrulanmış Gerçek Influencer Profilleri ({adminCreators.length})
                      </h2>
                    </div>
                    <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                      Sıfır Sahte Profil • Firestore influnex-db Senkron
                    </span>
                  </div>

                  {/* Add New Real Influencer Form */}
                  <form
                    onSubmit={handleAddAdminCreator}
                    className="mt-4 grid grid-cols-1 gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs sm:grid-cols-3 lg:grid-cols-9"
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
                    <input
                      type="email"
                      value={newCrEmail}
                      onChange={(e) => setNewCrEmail(e.target.value)}
                      placeholder="Gerçek E-Posta (Opsiyonel)"
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
                      type="number"
                      min={100}
                      value={newCrFollowers}
                      onChange={(e) =>
                        setNewCrFollowers(Number(e.target.value))
                      }
                      placeholder="Takipçi Sayısı"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                    />
                    <label className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-2.5 py-2 font-bold text-amber-950">
                      <input
                        type="checkbox"
                        checked={newCrIsLeader}
                        onChange={(e) => setNewCrIsLeader(e.target.checked)}
                      />
                      👑 Lider
                    </label>
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-600 px-3 py-2 font-black text-white hover:bg-emerald-700"
                    >
                      + Kaydet
                    </button>
                  </form>

                  {/* Real Creator Table */}
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 uppercase text-slate-500">
                          <th className="px-3 py-2.5">Influencer</th>
                          <th className="px-3 py-2.5">Şehir & Kategori</th>
                          <th className="px-3 py-2.5">Takipçi & Etkileşim</th>
                          <th className="px-3 py-2.5">Gerçek E-Posta Adresi</th>
                          <th className="px-3 py-2.5">Davet & Rozet İşlemleri</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminCreators.map((cr) => {
                          const hasValidEmail =
                            cr.email.includes("@") && cr.email.includes(".");
                          return (
                            <tr key={cr.id} className="hover:bg-slate-50/80">
                              <td className="px-3 py-3">
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
                                <div className="mt-0.5 flex items-center gap-2 text-indigo-600">
                                  <a
                                    href={cr.socialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono font-bold hover:underline"
                                  >
                                    {cr.handle} ↗
                                  </a>
                                  <span className="text-slate-400">•</span>
                                  <span className="font-semibold text-slate-600">
                                    {cr.platform}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <strong className="text-slate-900">
                                  {cr.city}
                                </strong>
                                <span className="block text-slate-500">
                                  {cr.category}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <strong className="text-slate-900">
                                  {cr.followers.toLocaleString("tr-TR")}
                                </strong>
                                <span className="block font-bold text-emerald-700">
                                  %{cr.erPercent.toFixed(2)} Etkileşim
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <input
                                  type="email"
                                  value={cr.email}
                                  onChange={(e) =>
                                    handleUpdateCreatorEmail(
                                      cr.id,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Kendi gerçek mailini girin..."
                                  className="w-56 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs"
                                />
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {hasValidEmail ? (
                                    <a
                                      href={buildInviteGmailUrl(cr)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 font-bold text-white hover:bg-emerald-700"
                                    >
                                      <Mail size={12} />
                                      Gmail ile Tanıtım Yolla
                                    </a>
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleCreatorLeader(cr.id)
                                    }
                                    className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 font-bold text-amber-900 hover:bg-amber-100"
                                  >
                                    {cr.isLeader
                                      ? "👑 Lider Kaldır"
                                      : "👑 Lider Yap"}
                                  </button>
                                  <Link
                                    href={`/${locale}/influencer/${cr.username}`}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-bold text-indigo-700 hover:border-indigo-400"
                                  >
                                    Vitrin <ExternalLink size={12} />
                                  </Link>
                                  {cr.username !== "guldkoc" ? (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCreator(cr.id)}
                                      className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-700 hover:bg-red-100"
                                      title="Profili Sil"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  ) : null}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SuperAdmin Section: Real Orders & Bank Reference Accounting */}
              {(activeTab === "overview" || activeTab === "ledger") && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Gerçek Siparişler, Banka Dekontu & %85 Hakediş Defteri
                      </span>
                      <h2 className="mt-0.5 text-lg font-black text-slate-950">
                        Kayıtlı Siparişler ({ledgerOrders.length})
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

                  {/* Create Real Order Form */}
                  <form
                    onSubmit={handleCreateAdminOrder}
                    className="mt-4 grid grid-cols-1 gap-2.5 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 text-xs sm:grid-cols-6"
                  >
                    <input
                      type="text"
                      required
                      value={newOrdBrand}
                      onChange={(e) => setNewOrdBrand(e.target.value)}
                      placeholder="Gerçek Marka Adı"
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
                      required
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
                      placeholder="Gerçek Banka Dekont Ref No"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-indigo-600 px-3 py-2 font-black text-white hover:bg-indigo-700"
                    >
                      + Gerçek Sipariş Kaydet
                    </button>
                  </form>

                  {filteredLedgerOrders.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-xs text-slate-600">
                      <strong className="block text-sm font-black text-slate-900">
                        Henüz Kayıtlı Sipariş Bulunmuyor (0,00 TL)
                      </strong>
                      <p className="mt-1">
                        Tüm mock/örnek siparişler temizlendi. Yukarıdaki formdan
                        gerçek bir sipariş ve banka dekont referansı
                        girdiğinizde burada listelenir.
                      </p>
                    </div>
                  ) : (
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
                            <th className="py-2.5">İşlem</th>
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
                                  {formatMinorUnits(
                                    b.creatorNetPayoutMinorUnits
                                  )}
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
                                  <div className="flex items-center gap-1.5">
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
                                            ? "Teslimi Onayla"
                                            : "%85 Hakedişi Öde"}
                                      </button>
                                    ) : (
                                      <span className="font-bold text-emerald-700">
                                        ✓ Ödendi
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteOrder(ord.orderCode)
                                      }
                                      className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-700 hover:bg-red-100"
                                      title="Siparişi Sil"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SuperAdmin Section: Real Brand Campaigns Manager */}
              {(activeTab === "overview" || activeTab === "campaigns") && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Gerçek Marka İlanları
                      </span>
                      <h2 className="mt-0.5 text-lg font-black text-slate-950">
                        Marka Kampanyaları ({adminCampaigns.length})
                      </h2>
                    </div>
                  </div>

                  {/* Create Real Campaign Form */}
                  <form
                    onSubmit={handleAddAdminCampaign}
                    className="mt-4 grid grid-cols-1 gap-2.5 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 text-xs sm:grid-cols-3 lg:grid-cols-6"
                  >
                    <input
                      type="text"
                      required
                      value={newCmpBrand}
                      onChange={(e) => setNewCmpBrand(e.target.value)}
                      placeholder="Gerçek Marka Adı"
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

                  {adminCampaigns.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-xs text-slate-600">
                      <strong className="block text-sm font-black text-slate-900">
                        Henüz Yayınlanmış Kampanya İlanı Bulunmuyor (0 İlan)
                      </strong>
                      <p className="mt-1">
                        Tüm mock/örnek kampanya ilanları kaldırıldı. Yukarıdaki
                        formdan gerçek bir marka kampanyası yayınlayabilirsiniz.
                      </p>
                    </div>
                  ) : (
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
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleCampaignStatus(cmp.id)
                                }
                                className="rounded-lg border border-slate-300 bg-white px-3 py-1 font-bold text-slate-700 hover:bg-slate-100"
                              >
                                {cmp.status === "OPEN"
                                  ? "İlanı Kapat"
                                  : "Yayına Aç"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCampaign(cmp.id)}
                                className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-700 hover:bg-red-100"
                                title="Kampanyayı Sil"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SuperAdmin Section: Real Service Packages Management */}
              {activeTab === "packages" && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs lg:col-span-7">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Gerçek Vitrin Hizmet Paketleri
                    </span>
                    <h2 className="mt-1 text-lg font-black text-slate-950">
                      Yayındaki Hizmet Paketleri ({creatorServices.length})
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
                                  <span className="text-xs font-bold text-slate-700">
                                    {srv.creatorName} ({srv.creatorHandle})
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
                              <div className="flex items-start gap-2 text-right">
                                <div>
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
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteServicePackage(srv.id)
                                  }
                                  className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-700 hover:bg-red-100"
                                  title="Paketi Sil"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-2xs lg:col-span-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Gerçek Paket Ekleme
                    </span>
                    <h2 className="mt-1 text-lg font-black text-slate-950">
                      Yeni Hizmet Paketi Oluştur
                    </h2>
                    <form
                      onSubmit={handleAddCreatorPackage}
                      className="mt-4 space-y-3 text-xs"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700">
                            Influencer Adı
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
                            Kullanıcı Adı
                          </label>
                          <input
                            type="text"
                            required
                            value={newPkgHandle}
                            onChange={(e) => setNewPkgHandle(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                          />
                        </div>
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
                        + Hizmet Paketini Kaydet
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
              2. CREATOR / INFLUENCER & UGC COCKPIT (%85 Payout - Sadece Gerçek Veri)
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
                      Influencer & UGC Üretici Paneli (Gerçek Veriler)
                    </h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-emerald-100">
                      Hizmet paketlerinizi yönetin ve gerçek siparişlerinizin
                      teslim süreçlerini takip edin.
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

                {/* Real Computed Creator KPIs */}
                <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-emerald-200">
                      Tamamlanan İş Kazancı (%85)
                    </span>
                    <p className="mt-1 text-2xl font-black text-emerald-300">
                      {formatMinorUnits(completedCreatorPayoutMinor)}
                    </p>
                    <span className="text-[11px] text-slate-300">
                      {
                        ledgerOrders.filter(
                          (o) =>
                            o.state === "COMPLETED" ||
                            o.state === "PAYOUT_COMPLETED"
                        ).length
                      }{" "}
                      Tamamlanan Sipariş
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-cyan-200">
                      Bloke Güvencedeki Hakediş
                    </span>
                    <p className="mt-1 text-2xl font-black text-white">
                      {formatMinorUnits(paidEscrowCreatorMinor)}
                    </p>
                    <span className="text-[11px] text-cyan-300">
                      {ledgerOrders.filter((o) => o.state === "PAID").length}{" "}
                      Aktif Sipariş
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
                      Canlı Vitrinde Yayında
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-indigo-200">
                      Doğrulanmış Takipçi
                    </span>
                    <p className="mt-1 text-2xl font-black text-white">
                      10.398
                    </p>
                    <span className="text-[11px] text-emerald-300">
                      @guldkoc • %5.80 Etkileşim
                    </span>
                  </div>
                </div>
              </div>

              {/* Creator Service Package Builder */}
              {(activeTab === "overview" || activeTab === "packages") && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs lg:col-span-7">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Gerçek Vitrin Hizmet Paketlerim
                    </span>
                    <h2 className="mt-1 text-lg font-black text-slate-950">
                      Aktif Influencer & UGC Paketlerim ({creatorServices.length})
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
                          placeholder="Örn: 1 Adet 60 sn Instagram Reels + 2 Story"
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

              {/* Creator Order Room — Only Real Orders */}
              {(activeTab === "overview" || activeTab === "delivery") && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Gerçek Sipariş Odası ({ledgerOrders.length} Kayıt)
                  </span>
                  <h2 className="mt-1 text-lg font-black text-slate-950">
                    İçerik Teslimi ve #reklam Paylaşım Linki Gönderimi
                  </h2>
                  {ledgerOrders.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-xs text-slate-600">
                      Henüz adınıza açılmış aktif bir sipariş bulunmuyor.
                      Markalar hizmet paketlerinizi satın aldığında gerçek
                      siparişleriniz burada listelenir.
                    </div>
                  ) : (
                    <form
                      onSubmit={handleCreatorDeliverySubmit}
                      className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-3"
                    >
                      <select
                        required
                        value={selectedOrderCodeForDelivery}
                        onChange={(e) =>
                          setSelectedOrderCodeForDelivery(e.target.value)
                        }
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                      >
                        <option value="">Teslim Edilecek Siparişi Seçin</option>
                        {ledgerOrders.map((o) => (
                          <option key={o.orderCode} value={o.orderCode}>
                            {o.orderCode} — {o.brandName} ({o.grossTl} TL)
                          </option>
                        ))}
                      </select>
                      <input
                        type="url"
                        required
                        value={creatorPublishUrl}
                        onChange={(e) => setCreatorPublishUrl(e.target.value)}
                        placeholder="https://www.instagram.com/reel/... (#reklam)"
                        className="rounded-xl border border-slate-300 px-3.5 py-2"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-indigo-600 px-5 py-2.5 font-bold text-white hover:bg-indigo-700"
                      >
                        Paylaşım Linkini Gönder & Tamamla
                      </button>
                    </form>
                  )}
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
              3. ADVERTISER / BRAND COCKPIT (Sadece Gerçek Veri)
             ================================================================ */}
          {activeViewRole === "ADVERTISER" ? (
            <>
              <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-950 via-violet-950 to-slate-950 p-6 text-white shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-400/20 px-3 py-1 text-xs font-bold text-indigo-200">
                      <BriefcaseBusiness size={14} />
                      Marka & Ajans Paneli • Gerçek Kampanya & Sipariş Yönetimi
                    </span>
                    <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                      Reklamveren Kampanya ve Sipariş Merkezi
                    </h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-indigo-100">
                      Gerçek kampanya ilanlarınızı oluşturun, doğrulanmış
                      influencer profilleriyle güvenli ödeme blokesi altında
                      çalışın.
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

                {/* Real Computed Advertiser KPIs */}
                <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-indigo-200">
                      Aktif Kampanyalarım
                    </span>
                    <p className="mt-1 text-2xl font-black text-white">
                      {
                        adminCampaigns.filter((c) => c.status === "OPEN")
                          .length
                      }{" "}
                      İlan
                    </p>
                    <span className="text-[11px] text-emerald-300">
                      {adminCampaigns.reduce(
                        (acc, c) => acc + c.proposalCount,
                        0
                      )}{" "}
                      Gerçek Başvuru
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="text-[11px] font-semibold text-cyan-200">
                      Bloke Güvencedeki Sipariş
                    </span>
                    <p className="mt-1 text-2xl font-black text-white">
                      {formatMinorUnits(paidEscrowGrossMinor)}
                    </p>
                    <span className="text-[11px] text-cyan-300">
                      {ledgerOrders.filter((o) => o.state === "PAID").length}{" "}
                      Aktif Sipariş
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
                      Toplam Sipariş Sayısı
                    </span>
                    <p className="mt-1 text-2xl font-black text-white">
                      {ledgerOrders.length}
                    </p>
                    <span className="text-[11px] text-amber-300">
                      Gerçek Kayıtlı İşlem
                    </span>
                  </div>
                </div>
              </div>

              {/* Advertiser Campaign Brief Assistant (Empty initial state, no mock brand) */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
                  Kampanya İlan Asistanı
                </span>
                <h2 className="mt-1 text-lg font-black text-slate-950">
                  Yeni Kampanya İlanı ve Çekim Senaryosu Oluşturucu
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
                      Marka Adınız
                    </label>
                    <input
                      id="adv-brand"
                      type="text"
                      required
                      value={advBrandName}
                      onChange={(e) => setAdvBrandName(e.target.value)}
                      placeholder="Marka adını girin..."
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="adv-url"
                      className="block font-bold text-slate-700"
                    >
                      Web Siteniz (HTTPS)
                    </label>
                    <input
                      id="adv-url"
                      type="url"
                      required
                      value={advWebsite}
                      onChange={(e) => setAdvWebsite(e.target.value)}
                      placeholder="https://markaniz.com.tr"
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
                      required
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
                      required
                      value={advBriefDesc}
                      onChange={(e) => setAdvBriefDesc(e.target.value)}
                      placeholder="Ürün veya hizmetinizi kısaca açıklayın..."
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
