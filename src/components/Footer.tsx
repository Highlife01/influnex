import Link from "next/link";
import { BookOpen, BriefcaseBusiness, LogIn, Search, Workflow } from "lucide-react";
import type { SupportedLocale } from "@/lib/types/domain";
import { INITIAL_CATEGORIES, INITIAL_CITIES } from "@/lib/data/catalog";
import { LEGAL_DOCUMENTS } from "@/lib/data/blogAndLegal";
import { DICTIONARY } from "@/lib/i18n/dictionary";
import { localizedPath } from "@/lib/i18n/paths";

export function Footer({ locale }: { locale: SupportedLocale }) {
  const t = DICTIONARY[locale];
  const baseCreatorPath = localizedPath(locale, "creators");
  const campaignsPath = localizedPath(locale, "campaigns");
  const howItWorksPath = localizedPath(locale, "howItWorks");
  const blogPath = localizedPath(locale, "blog");
  const loginPath = localizedPath(locale, "login");

  return (
    <footer className="border-t border-slate-200 bg-slate-50 pb-20 pt-14 text-slate-600 lg:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link
              href={`/${locale}`}
              aria-label="InfluNex Ana Sayfa"
              className="inline-flex items-center"
            >
              <img
                src="/logo.png?v=2"
                alt="InfluNex"
                width={160}
                height={30}
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="mt-2 text-sm font-semibold text-indigo-700">
              {t.slogan}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
              {locale === "tr"
                ? "Erken erişim betasında örnek profilleri inceleyebilir, brief taslağı hazırlayabilirsiniz. Canlı kampanya ve ödeme henüz açık değildir."
                : "Explore sample profiles and prepare a campaign brief in the early-access beta. Live campaigns and payments are not open yet."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-medium">
                {locale === "tr" ? "%0 Üyelik Ücreti" : "No membership fee"}
              </span>
              <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-medium">
                {locale === "tr" ? "Planlanan %15 Komisyon" : "Planned 15% commission"}
              </span>
              <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-medium">
                {locale === "tr" ? "Planlanan %85 Üretici Payı" : "Planned 85% creator share"}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {locale === "tr" ? "Popüler Kategoriler" : "Top Categories"}
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {INITIAL_CATEGORIES.slice(0, 8).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`${baseCreatorPath}/${locale === "tr" ? cat.slugTr : cat.slugEn}`}
                    className="hover:text-indigo-600"
                  >
                    {locale === "tr" ? cat.nameTr : cat.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {locale === "tr" ? "Şehirlere Göre Keşfet" : "Explore by City"}
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {INITIAL_CITIES.slice(0, 7).map((city) => (
                <li key={city.id}>
                  <Link
                    href={`${baseCreatorPath}/${city.slug}`}
                    className="hover:text-indigo-600"
                  >
                    {locale === "tr" ? `${city.nameTr} Influencer` : `${city.nameEn} creators`}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={`${baseCreatorPath}/adana/otomotiv`}
                  className="hover:text-indigo-600"
                >
                  {locale === "tr" ? "Adana Otomotiv Influencer" : "Adana automotive creators"}
                </Link>
              </li>
              <li>
                <Link
                  href={`${baseCreatorPath}/istanbul/moda`}
                  className="hover:text-indigo-600"
                >
                  {locale === "tr" ? "İstanbul Moda Influencer" : "Istanbul fashion creators"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {locale === "tr" ? "Kurumsal & Hukuki" : "Legal & Compliance"}
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href={localizedPath(locale, "howItWorks")}
                  className="hover:text-indigo-600"
                >
                  {locale === "tr" ? "Nasıl Çalışır?" : "How It Works"}
                </Link>
              </li>
              {locale === "tr" ? (
                <li>
                  <Link
                    href={localizedPath(locale, "pricing")}
                    className="hover:text-indigo-600"
                  >
                    Influencer Reklam Fiyatları
                  </Link>
                </li>
              ) : null}
              {LEGAL_DOCUMENTS.map((doc) => (
                <li key={doc.slug}>
                  <Link
                    href={`/${locale}/hukuki/${doc.slug}`}
                    className="hover:text-indigo-600"
                  >
                    {locale === "tr" ? doc.titleTr : doc.titleEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>
            © 2026 InfluNex — Global Influencer & UGC Marketplace. {locale === "tr" ? "Tüm hakları saklıdır." : "All rights reserved."}
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:info@influnex.com.tr"
              className="hover:text-indigo-600"
            >
              info@influnex.com.tr
            </a>
            <Link href="/sitemap.xml" className="hover:text-indigo-600">
              Sitemap Index
            </Link>
            <Link href="/llms.txt" className="hover:text-indigo-600">
              GEO / llms.txt
            </Link>
            <Link href="/api/v1/openapi" className="hover:text-indigo-600">
              OpenAPI v1
            </Link>
          </div>
        </div>
      </div>

      {/* Keep the mobile bar focused on public site destinations. */}
      <nav
        aria-label={locale === "tr" ? "Mobil ana menü" : "Mobile main navigation"}
        className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around border-t border-slate-200 bg-white px-1 pt-2 text-[10px] font-medium text-slate-600 shadow-[0_-4px_16px_rgb(15_23_42_/_0.08)] lg:hidden"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <Link
          href={baseCreatorPath}
          className="flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-lg hover:text-[#5c7525] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5c7525]"
        >
          <Search size={18} aria-hidden="true" />
          <span>{t.mobileNav.explore}</span>
        </Link>
        <Link
          href={campaignsPath}
          className="flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-lg hover:text-[#5c7525] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5c7525]"
        >
          <BriefcaseBusiness size={18} aria-hidden="true" />
          <span>{t.mobileNav.campaigns}</span>
        </Link>
        <Link
          href={howItWorksPath}
          className="flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-lg hover:text-[#5c7525] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5c7525]"
        >
          <Workflow size={18} aria-hidden="true" />
          <span>{t.nav.howItWorks}</span>
        </Link>
        <Link
          href={blogPath}
          className="flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-lg hover:text-[#5c7525] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5c7525]"
        >
          <BookOpen size={18} aria-hidden="true" />
          <span>{t.nav.blog}</span>
        </Link>
        <Link
          href={loginPath}
          className="flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-lg hover:text-[#5c7525] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5c7525]"
        >
          <LogIn size={18} aria-hidden="true" />
          <span>{t.nav.login}</span>
        </Link>
      </nav>
    </footer>
  );
}
