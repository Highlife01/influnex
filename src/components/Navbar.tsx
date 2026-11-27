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
  const loginHref = localizedPath(locale, "login");
  const signupHref = localizedPath(locale, "signup");
  const dashboardHref = localizedPath(locale, "dashboard");
  const linkClass =
    "transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2";
  const mobileLinkClass =
    "rounded-lg px-3 py-2 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-6 lg:gap-8">
          <Link
            href={`/${locale}`}
            aria-label="InfluNex Ana Sayfa"
            className="flex shrink-0 items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            <img
              src="/logo.png?v=3"
              alt="InfluNex"
              width={180}
              height={34}
              className="h-8 w-auto object-contain sm:h-9"
            />
          </Link>

          <nav
            aria-label="Ana Menü"
            className="hidden items-center gap-6 text-sm font-semibold text-slate-700 lg:flex"
          >
            <Link href={exploreHref} className={linkClass}>
              {t.nav.explore}
            </Link>
            <Link href={ugcHref} className={linkClass}>
              {locale === "tr" ? "UGC Üreticileri" : "UGC Creators"}
            </Link>
            <Link href={campaignsHref} className={linkClass}>
              {t.nav.campaigns}
            </Link>
            <Link href={howItWorksHref} className={linkClass}>
              {t.nav.howItWorks}
            </Link>
            {locale === "tr" ? (
              <Link href={pricingHref} className={linkClass}>
                {t.nav.pricing}
              </Link>
            ) : null}
          </nav>

          <details className="relative lg:hidden">
            <summary className="list-none cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50">
              Menü
            </summary>
            <nav
              aria-label="Mobil Menü"
              className="absolute left-0 top-12 z-50 grid min-w-56 gap-1 rounded-2xl border border-slate-200 bg-white p-2.5 text-sm font-medium text-slate-700 shadow-xl"
            >
              <Link className={mobileLinkClass} href={exploreHref}>
                {t.nav.explore}
              </Link>
              <Link className={mobileLinkClass} href={ugcHref}>
                {locale === "tr" ? "UGC Üreticileri" : "UGC Creators"}
              </Link>
              <Link className={mobileLinkClass} href={campaignsHref}>
                {t.nav.campaigns}
              </Link>
              <Link className={mobileLinkClass} href={howItWorksHref}>
                {t.nav.howItWorks}
              </Link>
              <Link className={mobileLinkClass} href={dashboardHref}>
                {t.nav.dashboard}
              </Link>
            </nav>
          </details>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href={switchLocaleHref}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            {locale === "tr" ? "EN" : "TR"}
          </Link>
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
        </div>
      </div>
    </header>
  );
}
