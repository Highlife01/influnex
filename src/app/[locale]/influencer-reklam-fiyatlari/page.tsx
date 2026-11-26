import type { Metadata } from "next";
import { CommissionCalculatorWidget } from "@/components/CommissionCalculatorWidget";
import { normalizeLocale } from "@/lib/i18n/dictionary";
import { buildHreflangAlternates } from "@/lib/seo/routeRegistry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = normalizeLocale((await params).locale);
  const isTr = locale === "tr";
  return {
    title: isTr
      ? "Türkiye Influencer Reklam Fiyatları ve %15 Komisyon Modeli"
      : "Influencer Advertising Rates and 15% Commission | InfluNex",
    description: isTr
      ? "InfluNex hizmet paketleri, format benchmarkları ve %15 komisyon / %85 üretici brüt hakediş tablosu."
      : "InfluNex service package rates, format benchmarks, and 15% commission / 85% creator payout table.",
    alternates: buildHreflangAlternates(
      "/tr/influencer-reklam-fiyatlari",
      "/en/influencer-reklam-fiyatlari",
      locale
    ),
  };
}

export default async function InfluencerAdPricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = normalizeLocale((await params).locale);
  const isTr = locale === "tr";
  const tiers = [
    {
      order: isTr ? "1.000 TL" : "TRY 1,000",
      commission: isTr ? "150 TL" : "TRY 150",
      payout: isTr ? "850 TL" : "TRY 850",
    },
    {
      order: isTr ? "5.000 TL" : "TRY 5,000",
      commission: isTr ? "750 TL" : "TRY 750",
      payout: isTr ? "4.250 TL" : "TRY 4,250",
    },
    {
      order: isTr ? "10.000 TL" : "TRY 10,000",
      commission: isTr ? "1.500 TL" : "TRY 1,500",
      payout: isTr ? "8.500 TL" : "TRY 8,500",
    },
    {
      order: isTr ? "25.000 TL" : "TRY 25,000",
      commission: isTr ? "3.750 TL" : "TRY 3,750",
      payout: isTr ? "21.250 TL" : "TRY 21,250",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-slate-900">
        {isTr
          ? "Influencer Reklam Fiyatları ve %15 Şeffaf Komisyon Modeli"
          : "Influencer Advertising Rates and Transparent 15% Commission Model"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {isTr
          ? "Üyelik, profil listeleme ve kampanya yayınlama tamamen ücretsizdir. İçerik üreticilerinin belirlediği brüt hizmet bedellerinde yalnızca tamamlanan iş birlikleri için %15 platform komisyonu (1500 BPS) uygulanır; %85 brüt pay (8500 BPS) içerik üreticisinindir."
          : "Membership, profile listing, and campaign publishing are 100% free. A 15% platform commission (1500 BPS) applies only on completed collaborations, leaving an 85% gross payout (8500 BPS) to the creator."}
      </p>

      <div className="mt-8">
        <CommissionCalculatorWidget locale={locale} />
      </div>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">
          {isTr
            ? "Komisyon ve %85 Üretici Hakediş Dağılım Tablosu"
            : "Commission and 85% Creator Payout Breakdown Table"}
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-2.5">
                  {isTr ? "Brüt Hizmet Bedeli" : "Gross service price"}
                </th>
                <th className="py-2.5">
                  {isTr ? "%15 Platform Komisyonu" : "15% platform commission"}
                </th>
                <th className="py-2.5">
                  {isTr ? "%85 Üretici Brüt Payı" : "85% creator gross share"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {tiers.map((row) => (
                <tr key={row.order}>
                  <td className="py-3 font-bold text-slate-900">{row.order}</td>
                  <td className="py-3 text-indigo-700">{row.commission}</td>
                  <td className="py-3 font-bold text-emerald-700">
                    {row.payout}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
