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
      <Navbar locale={locale} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
