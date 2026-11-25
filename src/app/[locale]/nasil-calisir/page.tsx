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
        ? "Beta sürümünde örnek profilleri inceleyip brief taslağı hazırlayın. Kampanya, sipariş ve ödeme özellikleri henüz canlı değildir."
        : "Browse sample profiles and prepare a campaign brief in the beta. Campaign publishing, orders, and payments are not live yet.",
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
      <div
        role="note"
        className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950"
      >
        <strong>
          {isTurkish ? "Erken erişim beta: " : "Early access beta: "}
        </strong>
        {isTurkish
          ? "Bu sayfa planlanan iş akışını anlatır. Gerçek kampanya, sipariş veya ödeme işlemi henüz sunulmuyor; lütfen ödeme göndermeyin."
          : "This page describes the planned workflow. Real campaigns, orders, and payments are not available yet; please do not send money."}
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900">
        {isTurkish ? "InfluNex Nasıl Çalışır?" : "How InfluNex Works"}
      </h1>
      <p className="mt-3 text-base text-slate-600">
        {isTurkish
          ? "Beta sürümünde örnek profilleri keşfedebilir ve iş birliği brief taslağı hazırlayabilirsiniz."
          : "In the beta, explore sample profiles and prepare a collaboration brief."}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-indigo-950">
            {isTurkish ? "1. Örnekleri keşfedin" : "1. Explore samples"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isTurkish
              ? "İçerik üreticisi profillerini ve örnek hizmet paketlerini karşılaştırın. Listelenen profil ve fiyatlar temsili veridir."
              : "Compare creator profiles and sample service packages. Listed profiles and prices are illustrative."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-indigo-950">
            {isTurkish ? "2. Brief taslağı hazırlayın" : "2. Prepare a brief"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isTurkish
              ? "Hedefinizi, bütçenizi ve içerik beklentinizi not edin. Taslağınız kampanya yayınlamaz ve üreticilere teklif göndermez."
              : "Outline your goals, budget, and content requirements. A draft does not publish a campaign or send proposals to creators."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:col-span-2">
          <h2 className="text-lg font-bold text-indigo-950">
            {isTurkish
              ? "3. Sipariş ve ödeme akışı"
              : "3. Order and payment workflow"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isTurkish
              ? "Sipariş durumları ve komisyon hesaplaması bu sayfada yalnızca örnek olarak gösterilir. Canlı ödeme, dekont doğrulama ve para bloke etme henüz etkin değildir."
              : "Order states and commission calculations are examples only. Live payments, receipt verification, and holding funds are not enabled."}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <CommissionCalculatorWidget locale={locale} />
      </div>
    </div>
  );
}
