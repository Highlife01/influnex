"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Crown, LayoutDashboard, LogOut } from "lucide-react";
import { SUPER_ADMIN_EMAIL, isSuperAdminEmail } from "@/lib/auth/roles";
import { getInfluNexAuth } from "@/lib/firebase/client";
import { DICTIONARY } from "@/lib/i18n/dictionary";
import { localizedPath } from "@/lib/i18n/paths";
import type { SupportedLocale } from "@/lib/types/domain";

export const INFLUNEX_SESSION_STORAGE_KEY = "influnex_active_session_v1";

export interface StoredInfluNexSession {
  email: string;
  displayName: string;
  role: "ADMIN" | "CREATOR" | "ADVERTISER";
  isSuperAdmin: boolean;
}

export function NavbarAuthActions({ locale }: { locale: SupportedLocale }) {
  const t = DICTIONARY[locale];
  const [session, setSession] = useState<StoredInfluNexSession | null>(null);

  useEffect(() => {
    function syncStoredSession() {
      try {
        const raw = localStorage.getItem(INFLUNEX_SESSION_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as StoredInfluNexSession;
          if (parsed?.email) {
            const superMatch = isSuperAdminEmail(parsed.email);
            setSession({
              ...parsed,
              role: superMatch ? "ADMIN" : parsed.role,
              isSuperAdmin: superMatch,
            });
          }
        }
      } catch {
        // ignore storage errors
      }
    }

    syncStoredSession();
    window.addEventListener("storage", syncStoredSession);
    window.addEventListener("influnex-session-updated", syncStoredSession);

    const auth = getInfluNexAuth();
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser?.email) {
        const superMatch = isSuperAdminEmail(fbUser.email);
        const next: StoredInfluNexSession = {
          email: fbUser.email,
          displayName:
            fbUser.displayName ||
            (superMatch ? "Cebrail Kara (Süperadmin)" : fbUser.email),
          role: superMatch ? "ADMIN" : "CREATOR",
          isSuperAdmin: superMatch,
        };
        setSession(next);
        try {
          localStorage.setItem(
            INFLUNEX_SESSION_STORAGE_KEY,
            JSON.stringify(next)
          );
        } catch {
          // ignore
        }
      }
    });

    return () => {
      window.removeEventListener("storage", syncStoredSession);
      window.removeEventListener("influnex-session-updated", syncStoredSession);
      unsub();
    };
  }, []);

  async function handleLogout() {
    try {
      localStorage.removeItem(INFLUNEX_SESSION_STORAGE_KEY);
      await signOut(getInfluNexAuth());
    } catch {
      // ignore
    }
    setSession(null);
    window.location.href = `/${locale}/giris`;
  }

  const loginHref = localizedPath(locale, "login");
  const signupHref = localizedPath(locale, "signup");

  if (session?.isSuperAdmin || isSuperAdminEmail(session?.email)) {
    return (
      <div className="flex items-center gap-2">
        <details className="relative">
          <summary className="flex list-none cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-emerald-900 px-3.5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:opacity-95">
            <Crown size={14} className="text-amber-300" />
            <span>Süperadmin</span>
            <span className="hidden text-[11px] font-normal text-emerald-300 xl:inline">
              ({SUPER_ADMIN_EMAIL})
            </span>
          </summary>
          <div className="absolute right-0 top-11 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-2.5 text-xs shadow-2xl">
            <div className="mb-2 rounded-xl bg-slate-950 p-3 text-white">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                👑 Tam Yetkili Süperadmin
              </span>
              <p className="mt-1 truncate font-bold">{session?.displayName}</p>
              <p className="truncate text-[11px] text-slate-300">
                {SUPER_ADMIN_EMAIL}
              </p>
            </div>
            <div className="grid gap-1 font-semibold text-slate-700">
              <Link
                href={`/${locale}/yonetim`}
                className="flex items-center justify-between rounded-xl bg-indigo-50 px-3 py-2 font-bold text-indigo-900 hover:bg-indigo-100"
              >
                <span>1. Süperadmin Komuta Merkezi</span>
                <span>→</span>
              </Link>
              <Link
                href={`/${locale}/admin`}
                className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-slate-100"
              >
                <span>2. Muhasebe, Üreticiler & SEO</span>
                <span>→</span>
              </Link>
              <Link
                href={`/${locale}/yayinci/panel`}
                className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-slate-100"
              >
                <span>3. Influencer / Yayıncı Paneli</span>
                <span>→</span>
              </Link>
              <Link
                href={`/${locale}/reklamveren/panel`}
                className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-slate-100"
              >
                <span>4. Reklamveren / Marka Paneli</span>
                <span>→</span>
              </Link>
              <Link
                href={`/${locale}/panel`}
                className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-slate-100"
              >
                <span>5. 15 Durumlu Sipariş & Bloke Odası</span>
                <span>→</span>
              </Link>
              <Link
                href={`/${locale}/influencer/turkiye`}
                className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-slate-100"
              >
                <span>6. Türkiye 81 İl SEO Rehberi</span>
                <span>→</span>
              </Link>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 font-bold text-red-600 hover:bg-red-50"
            >
              <LogOut size={14} />
              Çıkış Yap
            </button>
          </div>
        </details>
      </div>
    );
  }

  if (session) {
    const targetHref =
      session.role === "CREATOR"
        ? `/${locale}/yayinci/panel`
        : `/${locale}/reklamveren/panel`;
    return (
      <div className="flex items-center gap-2">
        <Link
          href={targetHref}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700"
        >
          <LayoutDashboard size={14} />
          Panelim ({session.displayName.split(" ")[0]})
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
          title="Çıkış Yap"
        >
          <LogOut size={15} />
        </button>
      </div>
    );
  }

  return (
    <>
      <Link
        href={loginHref}
        className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 md:inline-block"
      >
        {t.nav.login}
      </Link>
      <Link
        href={signupHref}
        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-2xs transition hover:bg-indigo-700"
      >
        {t.nav.joinFree}
      </Link>
    </>
  );
}
