"use client";
// Preserved static prototype; the active route lives in (auth)/kayit/page.tsx.

import { useState } from "react";
import Link from "next/link";
import { UserRegistrationSchema } from "@/lib/validators/schemas";

export default function RegisterPage() {
  const [role, setRole] = useState<"ADVERTISER" | "CREATOR">("ADVERTISER");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [birthYear, setBirthYear] = useState<number>(1998);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = UserRegistrationSchema.safeParse({
      email,
      displayName,
      role,
      birthYear: role === "CREATOR" ? Number(birthYear) : undefined,
      acceptedTermsVersion: "v1.0-DRAFT",
    });

    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ||
          "Lütfen bilgileri eksiksiz doldurunuz."
      );
      return;
    }

    setSuccess(true);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-14 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
          %100 Ücretsiz Üyelik • Abonelik veya Jeton Yok
        </span>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900">
          InfluNex&apos;e Ücretsiz Katılın
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          İlk kayıt sırasında yalnızca temel bilgiler istenir.
        </p>

        {/* Role Selector */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("ADVERTISER")}
            className={`rounded-xl border p-3 text-left text-xs transition-all ${
              role === "ADVERTISER"
                ? "border-indigo-600 bg-indigo-50/70 font-bold text-indigo-950"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            <span className="block text-sm font-bold">Reklamveren</span>
            Markam için influencer veya UGC arıyorum
          </button>

          <button
            type="button"
            onClick={() => setRole("CREATOR")}
            className={`rounded-xl border p-3 text-left text-xs transition-all ${
              role === "CREATOR"
                ? "border-indigo-600 bg-indigo-50/70 font-bold text-indigo-950"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            <span className="block text-sm font-bold">Influencer / UGC</span>
            İçerik üreterek %85 hakedişle kazanmak istiyorum
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="reg-name"
              className="block text-xs font-bold text-slate-700"
            >
              {role === "ADVERTISER"
                ? "Firma veya Marka Adı"
                : "Ad Soyad / Profesyonel Kullanıcı Adı"}
            </label>
            <input
              id="reg-name"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={
                role === "ADVERTISER" ? "Örn: Toros Otomotiv A.Ş." : "Örn: Emre Toros"
              }
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="reg-email"
              className="block text-xs font-bold text-slate-700"
            >
              E-Posta Adresi
            </label>
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ad@ornek.com"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </div>

          {role === "CREATOR" ? (
            <div>
              <label
                htmlFor="reg-birthyear"
                className="block text-xs font-bold text-slate-700"
              >
                Doğum Yılı (Influencer üyeliği için 18+ yaş sınırı zorunludur)
              </label>
              <input
                id="reg-birthyear"
                type="number"
                required
                min={1940}
                max={2026}
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700"
            >
              {error}
            </p>
          ) : null}

          {success ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
              <strong className="block text-sm">
                Kaydınız Başarıyla Oluşturuldu!
              </strong>
              Doğrulama rozetlerinizi tamamlamak ve işlem yapmak için{" "}
              <Link href="/tr/panel" className="font-bold underline">
                Kullanıcı Paneline Geçin →
              </Link>
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-xs hover:bg-indigo-700"
          >
            Ücretsiz Hesap Oluştur
          </button>
        </form>
      </div>
    </div>
  );
}
