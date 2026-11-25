import type { Metadata } from "next";
import { CommissionCalculatorWidget } from "@/components/CommissionCalculatorWidget";
import { normalizeLocale } from "@/lib/i18n/dictionary";
import {
  buildCanonicalUrl,
  buildHreflangAlternates,
} from "@/lib/seo/routeRegistry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = normalizeLocale((await params).locale);
  const isTr = locale === "tr";
  return {
    title: isTr
      ? "Türkiye Influencer Reklam Fiyatları ve Planlanan %15 Komisyon"
      : "Influencer Advertising Rates and Planned 15% Commission | InfluNex",
    description: isTr
      ? "InfluNex beta sürümünde örnek hizmet bedellerini ve planlanan komisyon modelini inceleyin. Canlı sipariş ve ödeme henüz açık değildir."
      : "Explore sample service rates and InfluNex's planned commission model. Live orders and payments are not enabled yet.",
    alternates: buildHreflangAlternates(
      "/tr/influencer-reklam-fiyatlari",
      "/en/influencer-reklam-fiyatlari",
      locale,
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
  const examples = [
    { order: isTr ? "100 TL" : "TRY 100", commission: isTr ? "15 TL" : "TRY 15", payout: isTr ? "85 TL" : "TRY 85" },
    { order: isTr ? "1.000 TL" : "TRY 1,000", commission: isTr ? "150 TL" : "TRY 150", payout: isTr ? "850 TL" : "TRY 850" },
    { order: isTr ? "5.000 TL" : "TRY 5,000", commission: isTr ? "750 TL" : "TRY 750", payout: isTr ? "4.250 TL" : "TRY 4,250" },
    { order: isTr ? "10.000 TL" : "TRY 10,000", commission: isTr ? "1.500 TL" : "TRY 1,500", payout: isTr ? "8.500 TL" : "TRY 8,500" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div role="note" className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <strong>{isTr ? "Erken erişim beta: " : "Early-access beta: "}</strong>
        {isTr
          ? "Bu sayfadaki tutarlar örnek hesaplamalardır. Canlı sipariş veya ödeme alınmamaktadır."
          : "Amounts on this page are sample calculations. Live orders and payments are not processed."}
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900">
        {isTr
          ? "Influencer Reklam Fiyatları ve Planlanan %15 Komisyon Modeli"
          : "Influencer Advertising Rates and Planned 15% Commission Model"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {isTr
          ? "Üyelik ücretsizdir. Canlı iş akışı açıldığında, içerik üreticilerinin belirlediği hizmet bedellerinde tamamlanan işler için %15 platform komisyonu uygulanması planlanıyor. Aşağıdaki hesaplamalar bu planlanan modeli örnekler; şu anda kampanya, sipariş veya ödeme özelliği canlı değildir."
          : "Membership is free. Once the live workflow launches, a 15% platform commission is planned for completed work at creator-defined service rates. The calculations below illustrate that planned model; campaigns, orders, and payments are not live."}
      </p>

      <div className="mt-8">
        <CommissionCalculatorWidget locale={locale} />
      </div>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">
          {isTr
            ? "Planlanan Komisyon ve Üretici Payı Örnek Tablosu"
            : "Sample Planned Commission and Creator Share Table"}
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-2.5">{isTr ? "Örnek Hizmet Bedeli" : "Sample service price"}</th>
                <th className="py-2.5">{isTr ? "Planlanan %15 Komisyon" : "Planned 15% commission"}</th>
                <th className="py-2.5">{isTr ? "Planlanan %85 Üretici Payı" : "Planned 85% creator share"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {examples.map((row) => (
                <tr key={row.order}>
                  <td className="py-3 font-bold text-slate-900">{row.order}</td>
                  <td className="py-3 text-indigo-700">{row.commission}</td>
                  <td className="py-3 font-bold text-emerald-700">{row.payout}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
