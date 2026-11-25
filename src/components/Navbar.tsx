import Link from "next/link";
import type { SupportedLocale } from "@/lib/types/domain";
import { DICTIONARY } from "@/lib/i18n/dictionary";
import { localizedPath } from "@/lib/i18n/paths";

export function Navbar({ locale }: { locale: SupportedLocale }) {
  const t = DICTIONARY[locale];
  const exploreHref = locale === "tr" ? "/tr/influencer" : "/en/creators";
  const campaignsHref = locale === "tr" ? "/tr/kampanyalar" : "/en/campaigns";
  const howItWorksHref =
    locale === "tr" ? "/tr/nasil-calisir" : "/en/how-it-works";
  const ugcHref = locale === "tr" ? "/tr/ugc" : "/en/ugc-creators";
  const switchLocaleHref = locale === "tr" ? "/en" : "/tr";
  const pricingHref = localizedPath(locale, "pricing");
  const blogHref = localizedPath(locale, "blog");
  const loginHref = localizedPath(locale, "login");
  const signupHref = localizedPath(locale, "signup");
  const dashboardHref = localizedPath(locale, "dashboard");
  const adminHref = localizedPath(locale, "admin");
  const linkClass =
    "transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2";
  const mobileLinkClass =
    "rounded-lg px-3 py-2 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-6 lg:gap-7">
          <Link
            href={`/${locale}`}
            className="flex shrink-0 items-center gap-2.5 text-xl font-black tracking-tight text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-sm font-black text-white shadow-sm">
              IN
            </span>
            <span>
              Influ<span className="text-indigo-600">Nex</span>
            </span>
          </Link>

          <nav
            aria-label="Ana Menü"
            className="hidden items-center gap-5 text-sm font-semibold text-slate-700 lg:flex"
          >
            <Link href={exploreHref} className={linkClass}>
              {t.nav.explore}
            </Link>
            <Link href={ugcHref} className={linkClass}>
              UGC
            </Link>
            <Link href={campaignsHref} className={linkClass}>
              {t.nav.campaigns}
            </Link>
            <Link href={`/${locale}#profesyonel-istatistikler`} className={linkClass}>
              {locale === "tr" ? "İstatistikler" : "Analytics"}
            </Link>
            <Link href={howItWorksHref} className={linkClass}>
              {t.nav.howItWorks}
            </Link>
            {locale === "tr" ? (
              <Link href={pricingHref} className={linkClass}>
                {t.nav.pricing}
              </Link>
            ) : null}
            <Link href={blogHref} className={linkClass}>
              {t.nav.blog}
            </Link>
          </nav>

          <details className="relative lg:hidden">
            <summary className="list-none cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Menü
            </summary>
            <nav
              aria-label="Mobil Menü"
              className="absolute left-0 top-12 z-50 grid min-w-60 gap-1 rounded-2xl border border-slate-200 bg-white p-2.5 text-sm font-medium text-slate-700 shadow-xl"
            >
              <Link className={mobileLinkClass} href={exploreHref}>
                {t.nav.explore}
              </Link>
              <Link className={mobileLinkClass} href={ugcHref}>
                UGC
              </Link>
              <Link className={mobileLinkClass} href={campaignsHref}>
                {t.nav.campaigns}
              </Link>
              <Link
                className={mobileLinkClass}
                href={`/${locale}#profesyonel-istatistikler`}
              >
                {locale === "tr" ? "Profesyonel İstatistikler" : "Platform Analytics"}
              </Link>
              <Link className={mobileLinkClass} href={howItWorksHref}>
                {t.nav.howItWorks}
              </Link>
              <Link className={mobileLinkClass} href={blogHref}>
                {t.nav.blog}
              </Link>
              <Link className={mobileLinkClass} href={dashboardHref}>
                {t.nav.dashboard}
              </Link>
              <Link className={mobileLinkClass} href={adminHref}>
                {locale === "tr" ? "Süperadmin Merkezi" : "Super Admin Hub"}
              </Link>
            </nav>
          </details>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <Link
            href={switchLocaleHref}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            {locale === "tr" ? "EN" : "TR"}
          </Link>
          <Link
            href={adminHref}
            className="hidden rounded-lg border border-indigo-200 bg-indigo-50/80 px-2.5 py-1.5 text-xs font-bold text-indigo-800 hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 sm:inline-block"
          >
            {locale === "tr" ? "Süperadmin" : "Super Admin"}
          </Link>
          <Link
            href={dashboardHref}
            className="hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 sm:inline-block"
          >
            {t.nav.dashboard}
          </Link>
          <Link
            href={loginHref}
            className="hidden rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 md:inline-block"
          >
            {t.nav.login}
          </Link>
          <Link
            href={signupHref}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 sm:px-4 sm:text-sm"
          >
            {t.nav.joinFree}
          </Link>
        </div>
      </div>
    </header>
  );
}
