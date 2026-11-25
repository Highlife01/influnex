"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { ArrowRight, BriefcaseBusiness, Check, LoaderCircle, Sparkles } from "lucide-react";
import {
  getInfluNexAuth,
  getInfluNexGoogleProvider,
} from "@/lib/firebase/client";
import type { UserRole } from "@/lib/types/domain";

type AccountRole = Extract<UserRole, "ADVERTISER" | "CREATOR">;

interface GoogleRoleAuthProps {
  locale: string;
  mode: "login" | "register";
  initialRole: AccountRole;
}

const roleOptions: {
  id: AccountRole;
  title: string;
  description: string;
  icon: typeof BriefcaseBusiness;
}[] = [
  {
    id: "ADVERTISER",
    title: "Reklamverenim",
    description: "Markam için içerik üreticileri bulacağım.",
    icon: BriefcaseBusiness,
  },
  {
    id: "CREATOR",
    title: "Yayıncı / içerik üreticisiyim",
    description: "Markalarla iş birliği yapıp içerik üreteceğim.",
    icon: Sparkles,
  },
];

function firebaseErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String(error.code);
    if (code === "auth/popup-closed-by-user") return "Giriş penceresi kapatıldı.";
    if (code === "auth/popup-blocked") {
      return "Tarayıcınız giriş penceresini engelledi. Açılır pencerelere izin verip tekrar deneyin.";
    }
    if (code === "auth/unauthorized-domain") {
      return "Bu adres Firebase Authentication yetkili alan adlarına eklenmemiş.";
    }
    if (code === "auth/operation-not-allowed") {
      return "Firebase Console'da Google ile giriş sağlayıcısı etkinleştirilmemiş.";
    }
  }
  return error instanceof Error ? error.message : "Giriş sırasında beklenmeyen bir hata oluştu.";
}

export function GoogleRoleAuth({
  locale,
  mode,
  initialRole,
}: GoogleRoleAuthProps) {
  const router = useRouter();
  const [role, setRole] = useState<AccountRole>(initialRole);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleGoogleSignIn() {
    setBusy(true);
    setErrorMessage("");

    try {
      const credential = await signInWithPopup(
        getInfluNexAuth(),
        getInfluNexGoogleProvider(),
      );
      const idToken = await credential.user.getIdToken();
      const response = await fetch("/api/auth/profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
          "x-influnex-locale": locale,
        },
        body: JSON.stringify({ role }),
      });
      const result = (await response.json()) as {
        role?: string;
        dashboardPath?: string;
        error?: string;
      };

      if (!response.ok || !result.dashboardPath) {
        throw new Error(result.error || "Hesabınız hazırlanamadı.");
      }

      await credential.user.getIdToken(true);
      router.replace(result.dashboardPath);
      router.refresh();
    } catch (error) {
      const errorCode =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : "";
      setErrorMessage(
        errorCode.startsWith("auth/")
          ? firebaseErrorMessage(error)
          : error instanceof Error
            ? error.message
            : "Giriş sırasında beklenmeyen bir hata oluştu.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-9">
      <div className="mb-7">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-indigo-600">
          Ücretsiz katıl
        </p>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">
          {mode === "register" ? "Hesabını oluştur" : "Tekrar hoş geldin"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Üyelik ücretsiz. Yalnızca tamamlanan iş birliklerinden %15 komisyon alınır.
        </p>
      </div>

      <div className="mb-6 grid gap-3">
        {roleOptions.map(({ id, title, description, icon: Icon }) => {
          const selected = role === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setRole(id)}
              aria-pressed={selected}
              className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                selected
                  ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                  : "border-slate-200 hover:border-slate-400"
              }`}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-indigo-700 shadow-sm">
                <Icon size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-slate-950">{title}</span>
                <span className="mt-1 block text-sm text-slate-600">{description}</span>
              </span>
              {selected ? <Check className="shrink-0 text-indigo-700" size={20} /> : null}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={busy}
        className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 font-bold text-slate-800 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? (
          <LoaderCircle className="animate-spin" size={19} />
        ) : (
          <GoogleAuthProviderIcon />
        )}
        {busy ? "Google hesabı doğrulanıyor…" : "Google ile devam et"}
        {!busy ? <ArrowRight size={17} /> : null}
      </button>

      {errorMessage ? (
        <p
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <p className="mt-5 text-center text-xs leading-5 text-slate-500">
        Google ile devam ederek kullanım şartlarımızı ve gizlilik bildirimimizi kabul etmiş olursunuz.
      </p>
    </section>
  );
}

function GoogleAuthProviderIcon() {
  return (
    <svg aria-hidden="true" width="19" height="19" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.27 5.47-4.76 7.16l7.73 6C44.42 38.05 46.98 31.95 46.98 24.55Z" />
      <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.75-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.82l-7.73-6c-2.14 1.44-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
    </svg>
  );
}
