// Preserved static prototype; the active route lives in (auth)/giris/page.tsx.
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Giriş Yap",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900">
          InfluNex Hesabınıza Giriş Yapın
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Reklamveren veya Influencer panelinize erişin.
        </p>

        <form action="/tr/panel" className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-bold text-slate-700"
            >
              E-Posta Adresi
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              placeholder="ornek@firma.com"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-bold text-slate-700"
            >
              Şifre
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-xs hover:bg-indigo-700"
          >
            E-Posta ile Giriş Yap
          </button>
        </form>

        <div className="mt-4">
          <Link
            href="/tr/panel?provider=google"
            className="flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
          >
            Google Hesabı ile Devam Et
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Henüz hesabınız yok mu?{" "}
          <Link
            href="/tr/kayit"
            className="font-bold text-indigo-600 hover:underline"
          >
            Ücretsiz Katılın
          </Link>
        </p>
      </div>
    </div>
  );
}
