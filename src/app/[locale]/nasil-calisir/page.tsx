import type { Metadata } from "next";
import { CommissionCalculatorWidget } from "@/components/CommissionCalculatorWidget";
import { normalizeLocale } from "@/lib/i18n/dictionary";
import { buildHreflangAlternates } from "@/lib/seo/routeRegistry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  return {
    title:
      locale === "tr"
        ? "InfluNex Nasıl Çalışır? Reklamveren ve Influencer Rehberi"
        : "How InfluNex Works — Brand & Creator Guide",
    description:
      locale === "tr"
        ? "InfluNex'te ücretsiz üyelik, doğrudan hizmet satın alma, kampanya teklif süreci, banka havalesi dekont onayı ve %15 komisyon / %85 hakediş sistemi nasıl çalışır?"
        : "Learn how free signup, direct service orders, campaign proposals, bank wire verification, and the 15% commission model work.",
    alternates: buildHreflangAlternates(
      "/tr/nasil-calisir",
      "/en/how-it-works",
      locale
    ),
  };
}

export default async function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-slate-900">
        InfluNex Nasıl Çalışır?
      </h1>
      <p className="mt-3 text-base text-slate-600">
        Abonelik, jeton veya karmaşık paketler olmadan markaları ve içerik
        üreticilerini en az adımda buluşturan şeffaf iş birliği akışı.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-indigo-950">
            Yöntem A: Doğrudan Hizmet Satın Alma
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Reklamveren, influencer profilindeki hazır reklam hizmetlerinden
            (Instagram Reels, Story, YouTube ürün tanıtımı, UGC reklam videosu)
            birini seçerek doğrudan sipariş oluşturur.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-indigo-950">
            Yöntem B: Ücretsiz Kampanya İlanı ve Teklif Toplama
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Reklamveren bütçesini ve beklentilerini içeren kampanyasını
            ücretsiz yayınlar. Uygun influencer&apos;lar fiyat ve teslim süresiyle
            teklif verir; teklif kabul edildiğinde sipariş başlar.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <CommissionCalculatorWidget />
      </div>
    </div>
  );
}
