import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { normalizeLocale } from "@/lib/i18n/dictionary";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolved = await params;
  const locale = normalizeLocale(resolved.locale);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-[#c9ff5b] px-4 py-3 font-semibold text-[#171a15] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c7525]"
      >
        İçeriğe geç
      </a>
      <Navbar locale={locale} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer locale={locale} />
    </div>
  );
}
