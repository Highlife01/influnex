"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CircleHelp,
  ClipboardList,
  Compass,
  CreditCard,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { UserRole } from "@/lib/types/domain";
import { getInfluNexAuth } from "@/lib/firebase/client";

type WorkspaceRole = UserRole;

interface RoleDashboardProps {
  locale: string;
  role: WorkspaceRole;
}

const roleContent: Record<
  WorkspaceRole,
  {
    title: string;
    subtitle: string;
    links: { label: string; href: string; icon: typeof LayoutDashboard }[];
    cards: { label: string; value: string; detail: string; icon: typeof LayoutDashboard }[];
    emptyTitle: string;
    emptyText: string;
    action: string;
    actionHref: string;
  }
> = {
  ADVERTISER: {
    title: "Reklamveren paneli",
    subtitle: "Kampanyalarını ve içerik üreticileriyle iş birliklerini yönet.",
    links: [
      { label: "Genel bakış", href: "#genel-bakis", icon: LayoutDashboard },
      { label: "İçerik üreticileri", href: "/tr/influencers", icon: Compass },
      { label: "Kampanyalarım", href: "#kampanyalar", icon: BriefcaseBusiness },
      { label: "Siparişlerim", href: "#siparisler", icon: ClipboardList },
    ],
    cards: [
      { label: "Aktif kampanyalar", value: "—", detail: "Henüz kampanya yok", icon: BriefcaseBusiness },
      { label: "Devam eden siparişler", value: "—", detail: "Yeni iş birlikleri burada görünür", icon: ClipboardList },
      { label: "Toplam harcama", value: "—", detail: "Onaylanan ödemeler", icon: CreditCard },
    ],
    emptyTitle: "İlk kampanyanı başlat",
    emptyText: "Sana uygun içerik üreticilerini keşfet ve iş birliği detaylarını oluştur.",
    action: "İçerik üreticilerini keşfet",
    actionHref: "/tr/influencers",
  },
  CREATOR: {
    title: "Yayıncı paneli",
    subtitle: "Profilini tamamla, kampanyaları keşfet ve iş birliklerini takip et.",
    links: [
      { label: "Genel bakış", href: "#genel-bakis", icon: LayoutDashboard },
      { label: "Kampanyaları keşfet", href: "/tr/kampanyalar", icon: Compass },
      { label: "Siparişlerim", href: "#siparisler", icon: ClipboardList },
      { label: "Kazançlarım", href: "#kazanc", icon: CreditCard },
    ],
    cards: [
      { label: "Yeni kampanyalar", value: "—", detail: "Sana uygun fırsatlar", icon: Sparkles },
      { label: "Aktif iş birlikleri", value: "—", detail: "Devam eden siparişler", icon: ClipboardList },
      { label: "Ödenecek hakediş", value: "—", detail: "%85 yayıncı payı", icon: CreditCard },
    ],
    emptyTitle: "Profilini oluştur",
    emptyText: "Sosyal medya hesaplarını, içerik örneklerini ve hizmet fiyatlarını ekleyerek markaların seni bulmasını sağla.",
    action: "Profilimi düzenle",
    actionHref: "#profil",
  },
  ADMIN: {
    title: "Süperadmin paneli",
    subtitle: "Platformun temel operasyonlarını ve kullanıcıları yönet.",
    links: [
      { label: "Genel bakış", href: "#genel-bakis", icon: LayoutDashboard },
      { label: "Kullanıcılar", href: "#kullanicilar", icon: Users },
      { label: "Ödeme kontrolü", href: "#odemeler", icon: CreditCard },
      { label: "Güvenlik", href: "#guvenlik", icon: ShieldCheck },
    ],
    cards: [
      { label: "Kullanıcı yönetimi", value: "Hazır", detail: "Yönetim görünümü", icon: Users },
      { label: "Manuel ödeme onayı", value: "Hazır", detail: "Havale / EFT / FAST", icon: CreditCard },
      { label: "Platform komisyonu", value: "%15", detail: "Tamamlanan iş birliklerinden", icon: ShieldCheck },
    ],
    emptyTitle: "Yönetim alanı hazır",
    emptyText: "Operasyonel veriler ve yönetim işlemleri ilgili servisler bağlandığında burada görünecek.",
    action: "Ana sayfaya dön",
    actionHref: "/tr",
  },
};

export function RoleDashboard({ locale, role }: RoleDashboardProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [authError, setAuthError] = useState("");
  const content = roleContent[role];

  useEffect(() => {
    const auth = getInfluNexAuth();
    return onAuthStateChanged(
      auth,
      async (nextUser) => {
        if (!nextUser) {
          router.replace(`/${locale}/giris`);
          return;
        }

        try {
          const token = await nextUser.getIdTokenResult(true);
          const actualRole = token.claims.role;
          if (
            actualRole !== "ADMIN" &&
            actualRole !== "ADVERTISER" &&
            actualRole !== "CREATOR"
          ) {
            setAuthError("Hesabınızın rol bilgisi bulunamadı. Lütfen yeniden giriş yapın.");
            setChecking(false);
            return;
          }
          setUser(nextUser);
          if (actualRole !== role) {
            const destination =
              actualRole === "ADMIN"
                ? `/${locale}/yonetim`
                : actualRole === "CREATOR"
                  ? `/${locale}/yayinci/panel`
                  : `/${locale}/reklamveren/panel`;
            router.replace(destination);
            return;
          }
          setChecking(false);
        } catch {
          setAuthError("Hesabınız doğrulanamadı. Lütfen yeniden giriş yapın.");
          setChecking(false);
        }
      },
      () => {
        setAuthError("Oturum bilgisi alınamadı. Lütfen tekrar giriş yapın.");
        setChecking(false);
      },
    );
  }, [locale, role, router]);

  async function handleSignOut() {
    await signOut(getInfluNexAuth());
    router.replace(`/${locale}/giris`);
  }

  if (checking) {
    return (
      <main className="grid min-h-[65vh] place-items-center px-4">
        <p className="text-sm font-semibold text-slate-600" role="status">
          Hesabın doğrulanıyor…
        </p>
      </main>
    );
  }

  if (authError || !user) {
    return (
      <main className="mx-auto grid min-h-[65vh] max-w-lg place-items-center px-4">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="font-bold text-slate-900">{authError || "Giriş gerekli."}</p>
          <a className="mt-4 inline-flex font-bold text-indigo-700" href={`/${locale}/giris`}>
            Giriş sayfasına dön
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[75vh] bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[245px_1fr] lg:px-8">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4">
          <a className="mb-6 flex items-center gap-3 px-2 py-2" href={`/${locale}`}>
            <span className="grid size-10 place-items-center rounded-xl bg-indigo-600 font-black text-white">IN</span>
            <span className="font-black tracking-tight text-slate-950">influnex</span>
          </a>
          <nav aria-label="Panel menüsü" className="grid gap-1">
            {content.links.map(({ label, href, icon: Icon }, index) => (
              <a
                key={label}
                href={href.replace(/^\/tr(?=\/)/, `/${locale}`)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  index === 0
                    ? "bg-indigo-50 text-indigo-800"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <Icon size={18} />
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-6 rounded-xl bg-slate-50 p-3">
            <p className="truncate text-sm font-bold text-slate-900">{user.displayName || user.email}</p>
            <p className="mt-1 text-xs text-slate-500">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <LogOut size={18} />
            Çıkış yap
          </button>
        </aside>

        <section id="genel-bakis">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-indigo-700">Hesap paneli</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                {content.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{content.subtitle}</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
              <ShieldCheck size={15} />
              Ücretsiz üyelik · %15 komisyon
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {content.cards.map(({ label, value, detail, icon: Icon }) => (
              <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-600">{label}</p>
                  <Icon className="text-indigo-600" size={19} />
                </div>
                <p className="mt-4 text-2xl font-black text-slate-950">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{detail}</p>
              </article>
            ))}
          </div>

          <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-700">
              {role === "ADMIN" ? <ShieldCheck /> : role === "CREATOR" ? <Sparkles /> : <BriefcaseBusiness />}
            </div>
            <h2 className="text-xl font-black text-slate-950">{content.emptyTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{content.emptyText}</p>
            <a
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 font-bold text-white hover:bg-indigo-700"
              href={content.actionHref.replace(/^\/tr(?=\/)/, `/${locale}`)}
            >
              {content.action}
              <ArrowUpRight size={17} />
            </a>
          </article>

          {role !== "ADMIN" ? (
            <p className="mt-5 flex items-center gap-2 text-xs leading-5 text-slate-500">
              <CircleHelp size={15} />
              Kampanya, sipariş ve ödeme verileri hesabın için güvenli şekilde ayrılır.
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
