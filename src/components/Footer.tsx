import Link from "next/link";
import type { SupportedLocale } from "@/lib/types/domain";
import { INITIAL_CATEGORIES, INITIAL_CITIES } from "@/lib/data/catalog";
import { LEGAL_DOCUMENTS } from "@/lib/data/blogAndLegal";
import { DICTIONARY } from "@/lib/i18n/dictionary";

export function Footer({ locale }: { locale: SupportedLocale }) {
  const t = DICTIONARY[locale];
  const baseCreatorPath = locale === "tr" ? "/tr/influencer" : "/en/creators";

  return (
    <footer className="border-t border-slate-200 bg-slate-50 pb-20 pt-14 text-slate-600 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2.5 text-xl font-bold text-slate-900"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-950 text-xs font-extrabold text-white">
                IN
              </span>
              <span>
                Influ<span className="text-indigo-600">Nex</span>
              </span>
            </Link>
            <p className="mt-2 text-sm font-semibold text-indigo-700">
              {t.slogan}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
              {locale === "tr"
                ? "Reklamveren ve influencer üyeliği tamamen ücretsizdir. Abonelik, jeton veya gizli ücret yoktur; yalnızca başarıyla tamamlanan iş birliklerinden %15 komisyon alınır."
                : "Free membership for both advertisers and creators. No subscriptions, tokens, or hidden fees — only a 15% commission on completed collaborations."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-medium">
                %0 Üyelik Ücreti
              </span>
              <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-medium">
                %15 Sabit Komisyon (1500 BPS)
              </span>
              <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-medium">
                %85 Influencer Hakedişi
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
                    {city.nameTr} Influencer
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/tr/influencer/adana/otomotiv"
                  className="hover:text-indigo-600"
                >
                  Adana Otomotiv Influencer
                </Link>
              </li>
              <li>
                <Link
                  href="/tr/influencer/istanbul/moda"
                  className="hover:text-indigo-600"
                >
                  İstanbul Moda Influencer
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
                  href="/tr/nasil-calisir"
                  className="hover:text-indigo-600"
                >
                  Nasıl Çalışır?
                </Link>
              </li>
              <li>
                <Link
                  href="/tr/influencer-reklam-fiyatlari"
                  className="hover:text-indigo-600"
                >
                  Influencer Reklam Fiyatları
                </Link>
              </li>
              <li>
                <Link href="/tr/admin" className="hover:text-indigo-600">
                  Yönetici & SEO Merkezi
                </Link>
              </li>
              {LEGAL_DOCUMENTS.map((doc) => (
                <li key={doc.slug}>
                  <Link
                    href={`/tr/hukuki/${doc.slug}`}
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
            © 2026 InfluNex — Global Influencer & UGC Marketplace. Tüm hakları
            saklıdır.
          </p>
          <div className="flex flex-wrap gap-4">
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

      {/* Mobile Bottom Navigation Bar (PWA Native Feel - Section 35) */}
      <nav
        aria-label="Mobil Alt Menü"
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white py-2.5 text-xs font-medium text-slate-600 shadow-lg md:hidden"
      >
        <Link
          href={baseCreatorPath}
          className="flex flex-col items-center gap-0.5 hover:text-indigo-600"
        >
          <span>{t.mobileNav.explore}</span>
        </Link>
        <Link
          href={locale === "tr" ? "/tr/kampanyalar" : "/en/campaigns"}
          className="flex flex-col items-center gap-0.5 hover:text-indigo-600"
        >
          <span>{t.mobileNav.campaigns}</span>
        </Link>
        <Link
          href="/tr/panel?tab=messages"
          className="flex flex-col items-center gap-0.5 hover:text-indigo-600"
        >
          <span>{t.mobileNav.messages}</span>
        </Link>
        <Link
          href="/tr/panel?tab=orders"
          className="flex flex-col items-center gap-0.5 hover:text-indigo-600"
        >
          <span>{t.mobileNav.orders}</span>
        </Link>
        <Link
          href="/tr/panel"
          className="flex flex-col items-center gap-0.5 hover:text-indigo-600"
        >
          <span>{t.mobileNav.profile}</span>
        </Link>
      </nav>
    </footer>
  );
}
