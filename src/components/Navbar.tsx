import Link from "next/link";
import type { SupportedLocale } from "@/lib/types/domain";
import { DICTIONARY } from "@/lib/i18n/dictionary";

export function Navbar({ locale }: { locale: SupportedLocale }) {
  const t = DICTIONARY[locale];
  const exploreHref = locale === "tr" ? "/tr/influencer" : "/en/creators";
  const campaignsHref = locale === "tr" ? "/tr/kampanyalar" : "/en/campaigns";
  const howItWorksHref =
    locale === "tr" ? "/tr/nasil-calisir" : "/en/how-it-works";
  const ugcHref = locale === "tr" ? "/tr/ugc" : "/en/ugc-creators";
  const switchLocaleHref = locale === "tr" ? "/en" : "/tr";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-950 text-sm font-extrabold text-white shadow-sm">
              IN
            </span>
            <span>
              Influ<span className="text-indigo-600">Nex</span>
            </span>
          </Link>

          <nav
            aria-label="Ana Menü"
            className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex"
          >
            <Link
              href={exploreHref}
              className="transition-colors hover:text-indigo-600"
            >
              {t.nav.explore}
            </Link>
            <Link
              href={ugcHref}
              className="transition-colors hover:text-indigo-600"
            >
              UGC
            </Link>
            <Link
              href={campaignsHref}
              className="transition-colors hover:text-indigo-600"
            >
              {t.nav.campaigns}
            </Link>
            <Link
              href={howItWorksHref}
              className="transition-colors hover:text-indigo-600"
            >
              {t.nav.howItWorks}
            </Link>
            {locale === "tr" ? (
              <Link
                href="/tr/influencer-reklam-fiyatlari"
                className="transition-colors hover:text-indigo-600"
              >
                {t.nav.pricing}
              </Link>
            ) : null}
            <Link
              href="/tr/blog"
              className="transition-colors hover:text-indigo-600"
            >
              {t.nav.blog}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={switchLocaleHref}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            {locale === "tr" ? "EN" : "TR"}
          </Link>
          <Link
            href="/tr/panel"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:inline-block"
          >
            {t.nav.dashboard}
          </Link>
          <Link
            href="/tr/giris"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {t.nav.login}
          </Link>
          <Link
            href="/tr/kayit"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            {t.nav.joinFree}
          </Link>
        </div>
      </div>
    </header>
  );
}
