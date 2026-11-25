"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Info,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
import {
  getInfluNexAuth,
  getInfluNexGoogleProvider,
} from "@/lib/firebase/client";
import type { UserRole } from "@/lib/types/domain";
import { INITIAL_CATEGORIES, INITIAL_CITIES } from "@/lib/data/catalog";
import { UserRegistrationSchema } from "@/lib/validators/schemas";

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
  badge: string;
  icon: typeof BriefcaseBusiness;
}[] = [
  {
    id: "ADVERTISER",
    title: "Reklamverenim (Marka / İşletme)",
    description:
      "Markam için influencer ve UGC üreticileri keşfedeceğim, brief hazırlayacağım veya kampanya açacağım.",
    badge: "%0 Üyelik & İlan Ücreti",
    icon: BriefcaseBusiness,
  },
  {
    id: "CREATOR",
    title: "Yayıncı / Influencer & UGC Üreticisiyim",
    description:
      "Hizmet paketlerimi tanımlayacağım ve tamamlanan iş birliklerinden vergi öncesi %85 brüt pay kazanacağım.",
    badge: "%85 Brüt Üretici Payı • 18+ Yaş",
    icon: Sparkles,
  },
];

const CREATOR_ONBOARDING_STEPS = [
  { step: 1, label: "Rol & Temel Bilgiler" },
  { step: 2, label: "Platform & UGC Tercihi" },
  { step: 3, label: "Kategori & Şehir" },
  { step: 4, label: "Beta Panel Önizlemesi" },
] as const;

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
  return error instanceof Error
    ? error.message
    : "Giriş sırasında beklenmeyen bir hata oluştu.";
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

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [citySlug, setCitySlug] = useState("istanbul");
  const [primaryCategory, setPrimaryCategory] = useState("moda");
  const [creatorMode, setCreatorMode] = useState<
    "INFLUENCER_AND_UGC" | "INFLUENCER_ONLY" | "UGC_ONLY"
  >("INFLUENCER_AND_UGC");
  const [birthYear, setBirthYear] = useState<number>(1999);
  const [emailSignupSuccess, setEmailSignupSuccess] = useState(false);

  const completionPercentage =
    25 +
    (displayName.trim().length >= 2 ? 25 : 0) +
    (email.includes("@") ? 25 : 0) +
    (citySlug && primaryCategory ? 25 : 0);

  async function handleGoogleSignIn() {
    setBusy(true);
    setErrorMessage("");

    try {
      const credential = await signInWithPopup(
        getInfluNexAuth(),
        getInfluNexGoogleProvider()
      );
      const idToken = await credential.user.getIdToken();
      const isSuperAdmin =
        credential.user.email?.trim().toLowerCase() === "cebrailkara@gmail.com";
      const response = await fetch("/api/auth/profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
          "x-influnex-locale": locale,
        },
        body: JSON.stringify({ role }),
      }).catch(() => null);

      if (response && response.ok) {
        const result = (await response.json()) as {
          role?: string;
          dashboardPath?: string;
        };
        await credential.user.getIdToken(true);
        router.replace(
          result.dashboardPath ||
            (isSuperAdmin
              ? `/${locale}/yonetim`
              : role === "CREATOR"
                ? `/${locale}/yayinci/panel`
                : `/${locale}/reklamveren/panel`)
        );
        router.refresh();
        return;
      }

      const fallbackDestination = isSuperAdmin
        ? `/${locale}/yonetim`
        : role === "CREATOR"
          ? `/${locale}/yayinci/panel`
          : `/${locale}/reklamveren/panel`;
      router.replace(fallbackDestination);
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
            : "Giriş sırasında beklenmeyen bir hata oluştu."
      );
    } finally {
      setBusy(false);
    }
  }

  function handleQuickEmailOnboarding(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setEmailSignupSuccess(false);

    const parsed = UserRegistrationSchema.safeParse({
      email,
      displayName,
      role,
      birthYear: role === "CREATOR" ? Number(birthYear) : undefined,
      acceptedTermsVersion: "v1.1-PRE-LAUNCH-DRAFT",
    });

    if (!parsed.success) {
      setErrorMessage(
        parsed.error.issues[0]?.message ||
          "Lütfen zorunlu alanları kontrol edin."
      );
      return;
    }

    setEmailSignupSuccess(true);
  }

  return (
    <section className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-9">
      {/* Unified Beta & Legal Pre-Launch Notice (Audit P0 Item 2 & 5) */}
      <div
        role="note"
        className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950"
      >
        <strong className="block font-bold">
          Erken Erişim Beta & Ön Kayıt Bilgilendirmesi:
        </strong>
        InfluNex şu anda erken erişim beta aşamasındadır. Bu ekrandan Google
        hesabınızla beta panel önizlemesine giriş yapabilir veya ön kayıt
        simülasyonunu tamamlayabilirsiniz. Hukuki sözleşmelerin nihai onayı
        tamamlanana kadar bağlayıcı ticari sözleşme kurulmaz ve canlı ödeme/tahsilat
        alınmaz.
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-600">
            {mode === "register" ? "Ücretsiz Beta Ön Kaydı" : "Beta Girişi"}
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            <ShieldCheck size={14} />
            Abonelik Yok • Tamamlanan İşte %15 Komisyon
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          {mode === "register"
            ? "Erken Erişim Hesabını Hazırla"
            : "Tekrar hoş geldin"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Üyelik, profil listeleme, kampanya hazırlama ve teklif simülasyonu
          tamamen ücretsizdir.
        </p>
      </div>

      {/* Step Indicator & Profile Completion Meter */}
      {mode === "register" ? (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Onboarding Adımları (Simülasyon)</span>
            <span className="text-indigo-700">
              Form Tamamlama Oranı: %{completionPercentage}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <ol className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 sm:grid-cols-4">
            {CREATOR_ONBOARDING_STEPS.map((s) => (
              <li
                key={s.step}
                className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 shadow-2xs"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-950 text-[10px] font-bold text-white">
                  {s.step}
                </span>
                <span className="truncate">{s.label}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {/* Role Selector Cards */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        {roleOptions.map(({ id, title, description, badge, icon: Icon }) => {
          const selected = role === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setRole(id)}
              aria-pressed={selected}
              className={`flex w-full flex-col justify-between rounded-2xl border p-4 text-left transition ${
                selected
                  ? "border-indigo-600 bg-indigo-50/80 ring-1 ring-indigo-600"
                  : "border-slate-200 hover:border-slate-400"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-indigo-700 shadow-sm">
                    <Icon size={19} />
                  </span>
                  {selected ? (
                    <Check className="shrink-0 text-indigo-700" size={19} />
                  ) : null}
                </div>
                <span className="mt-3 block font-bold text-slate-950">
                  {title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-600">
                  {description}
                </span>
              </div>
              <span className="mt-3 inline-block w-fit rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-indigo-800 shadow-2xs">
                {badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Role Switch & Google Data Transparency Note (Audit Section 2 Fix) */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
        <p className="flex items-start gap-2">
          <Info size={15} className="mt-0.5 shrink-0 text-indigo-600" />
          <span>
            <strong>Veri & Rol Şeffaflığı:</strong> Google ile girişte yalnızca
            doğrulanmış e-posta adresiniz, adınız ve profil fotoğrafınız alınır;
            sosyal medya şifreniz asla istenmez. Yanlış rol seçerseniz giriş
            sonrasında bu ekrandan veya panelinizden{" "}
            <strong>Reklamveren ⇄ İçerik Üreticisi</strong> rolünüzü
            güncelleyebilirsiniz.
          </span>
        </p>
      </div>

      {/* Primary Option 1: One-Click Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={busy}
        className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 font-bold text-slate-800 shadow-2xs transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? (
          <LoaderCircle className="animate-spin" size={19} />
        ) : (
          <GoogleAuthProviderIcon />
        )}
        {busy ? "Google hesabı doğrulanıyor…" : "Google ile devam et"}
        {!busy ? <ArrowRight size={17} /> : null}
      </button>

      {/* Option 2: Guided Lightweight Pre-Registration Form */}
      {mode === "register" ? (
        <form
          onSubmit={handleQuickEmailOnboarding}
          className="mt-6 space-y-4 border-t border-slate-200 pt-6"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Veya E-Posta ile Beta Ön Kayıt Simülasyonu
          </p>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="onboard-name"
                className="block text-xs font-bold text-slate-700"
              >
                {role === "ADVERTISER"
                  ? "Marka / Şirket Adı"
                  : "Görünecek Ad / Kullanıcı Adı"}
              </label>
              <input
                id="onboard-name"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={
                  role === "ADVERTISER"
                    ? "Örn: Toros Otomotiv"
                    : "Örn: Emre Toros"
                }
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="onboard-email"
                className="block text-xs font-bold text-slate-700"
              >
                Kurumsal veya Kişisel E-Posta
              </label>
              <input
                id="onboard-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ad@ornek.com"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="onboard-city"
                className="block text-xs font-bold text-slate-700"
              >
                Şehir
              </label>
              <select
                id="onboard-city"
                value={citySlug}
                onChange={(e) => setCitySlug(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm"
              >
                {INITIAL_CITIES.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.nameTr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="onboard-category"
                className="block text-xs font-bold text-slate-700"
              >
                {role === "ADVERTISER"
                  ? "Marka Sektörü"
                  : "Ana İçerik Kategorisi"}
              </label>
              <select
                id="onboard-category"
                value={primaryCategory}
                onChange={(e) => setPrimaryCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm"
              >
                {INITIAL_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.slugTr}>
                    {cat.nameTr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {role === "CREATOR" ? (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="onboard-creator-mode"
                  className="block text-xs font-bold text-slate-700"
                >
                  Üretim Modeli (Influencer & UGC Ayrımı)
                </label>
                <select
                  id="onboard-creator-mode"
                  value={creatorMode}
                  onChange={(e) =>
                    setCreatorMode(
                      e.target.value as
                        | "INFLUENCER_AND_UGC"
                        | "INFLUENCER_ONLY"
                        | "UGC_ONLY"
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm"
                >
                  <option value="INFLUENCER_AND_UGC">
                    Hem Influencer Paylaşımı Hem UGC Video
                  </option>
                  <option value="INFLUENCER_ONLY">
                    Yalnızca Kendi Hesabımda Paylaşım (Influencer)
                  </option>
                  <option value="UGC_ONLY">
                    Yalnızca Marka İçin UGC Reklam Kreatifi (Yayın Şartsız)
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="onboard-birth-year"
                  className="block text-xs font-bold text-slate-700"
                >
                  Doğum Yılı (18+ Yaş Sınırı Zorunludur)
                </label>
                <input
                  id="onboard-birth-year"
                  type="number"
                  min={1940}
                  max={2026}
                  required
                  value={birthYear}
                  onChange={(e) => setBirthYear(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
                />
              </div>
            </div>
          ) : null}

          <button
            type="submit"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-xs transition hover:bg-indigo-700"
          >
            <Video size={17} />
            {role === "ADVERTISER"
              ? "Reklamveren Beta Ön Kaydını Tamamla"
              : "Influencer / UGC Beta Ön Kaydını Tamamla"}
          </button>
        </form>
      ) : null}

      {emailSignupSuccess ? (
        <div
          role="status"
          className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-950"
        >
          <strong className="block text-sm font-bold">
            Beta Ön Kayıt Simülasyonu Tamamlandı!
          </strong>
          <p className="mt-1">
            15 durumlu örnek sipariş akışını, dekont doğrulama adımlarını ve AI
            kampanya hazırlama aracını incelemek için{" "}
            <Link
              href={`/${locale}/panel`}
              className="font-bold text-indigo-700 underline"
            >
              Örnek İşlem Paneline Geçin →
            </Link>
          </p>
        </div>
      ) : null}

      {errorMessage ? (
        <p
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <p className="mt-5 text-center text-xs leading-5 text-slate-500">
        Hukuki metinlerin ön lansman inceleme sürümlerini görüntülemek için:{" "}
        <Link
          href={`/${locale}/hukuki/kullanim-kosullari`}
          className="underline hover:text-indigo-600"
        >
          Kullanım Koşulları (Ön Lansman Taslağı)
        </Link>{" "}
        •{" "}
        <Link
          href={`/${locale}/hukuki/kvkk-aydinlatma-metni`}
          className="underline hover:text-indigo-600"
        >
          KVKK Aydınlatma Metni (Ön Lansman Taslağı)
        </Link>
      </p>
    </section>
  );
}

function GoogleAuthProviderIcon() {
  return (
    <svg aria-hidden="true" width="19" height="19" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.27 5.47-4.76 7.16l7.73 6C44.42 38.05 46.98 31.95 46.98 24.55Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.75-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.91-5.82l-7.73-6c-2.14 1.44-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
    </svg>
  );
}
