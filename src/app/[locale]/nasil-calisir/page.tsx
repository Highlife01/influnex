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
        ? "1.000+ onaylı influencer ve UGC içerik üreticisini keşfedin, AI destekli brief hazırlayın ve 15 durumlu sipariş/bloke güvencesiyle çalışın."
        : "Explore 1,000+ verified influencers and UGC creators, prepare an AI campaign brief, and collaborate with 15-state order protection.",
    alternates: buildHreflangAlternates(
      "/tr/nasil-calisir",
      "/en/how-it-works",
      locale
    ),
  };
}

export default async function HowItWorksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const isTurkish = locale === "tr";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-slate-900">
        {isTurkish ? "InfluNex Nasıl Çalışır?" : "How InfluNex Works"}
      </h1>
      <p className="mt-3 text-base text-slate-600">
        {isTurkish
          ? "Markalar ve içerik üreticileri için aboneliksiz, %15 şeffaf komisyonlu ve 15 durumlu sipariş güvenceli iş birliği akışı."
          : "Subscription-free collaboration workflow with a transparent 15% commission and 15-state order protection."}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-indigo-950">
            {isTurkish
              ? "1. Doğrulanmış Profilleri Keşfedin"
              : "1. Discover Verified Creators"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isTurkish
              ? "1.000+ içerik üreticisi profilini ve 12 standart hizmet paketini şehir, kategori, etkileşim oranı (ER) ve bütçeye göre karşılaştırın."
              : "Compare 1,000+ creator profiles and 12 service formats by city, category, engagement rate, and budget."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-indigo-950">
            {isTurkish
              ? "2. AI Destekli Brief & Teklif"
              : "2. AI Brief & Proposal"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isTurkish
              ? "Hedefinizi, bütçenizi ve 6 boyutlu kullanım hakkı beklentinizi belirleyin; doğrudan hizmet paketi seçin veya açık kampanya briefi yayınlayın."
              : "Define your goals, budget, and 6-dimensional usage rights; book a service package or publish a campaign brief."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:col-span-2">
          <h2 className="text-lg font-bold text-indigo-950">
            {isTurkish
              ? "3. 15 Durumlu Sipariş, Bloke & %85 Hakediş Aktarımı"
              : "3. 15-State Order, Escrow & 85% Creator Payout"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isTurkish
              ? "Sipariş başladığında fiyat, komisyon, revizyon sayısı ve kullanım hakları değiştirilemez snapshot olarak kilitlenir. Ödeme bloke edilir; taslak onaylanıp #reklam etiketiyle yayına alındığında %85 brüt hakediş üreticiye aktarılır."
              : "Order price, commission, revision limits, and usage rights are locked as an immutable snapshot. Funds are held until content approval and #ad disclosure verification, then 85% gross payout is settled to the creator."}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <CommissionCalculatorWidget locale={locale} />
      </div>
    </div>
  );
}
