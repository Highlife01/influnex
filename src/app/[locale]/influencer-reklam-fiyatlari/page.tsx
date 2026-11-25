import type { Metadata } from "next";
import { CommissionCalculatorWidget } from "@/components/CommissionCalculatorWidget";
import { buildCanonicalUrl } from "@/lib/seo/routeRegistry";

export const metadata: Metadata = {
  title: "Türkiye Influencer Reklam Fiyatları ve Planlanan %15 Komisyon",
  description:
    "InfluNex beta sürümünde örnek hizmet bedellerini ve planlanan komisyon modelini inceleyin. Canlı sipariş ve ödeme henüz açık değildir.",
  alternates: {
    canonical: buildCanonicalUrl("/tr/influencer-reklam-fiyatlari"),
  },
};

export default function InfluencerAdPricingPage() {
  const examples = [
    { orderTl: "100 TL", commTl: "15 TL", payoutTl: "85 TL" },
    { orderTl: "1.000 TL", commTl: "150 TL", payoutTl: "850 TL" },
    { orderTl: "5.000 TL", commTl: "750 TL", payoutTl: "4.250 TL" },
    { orderTl: "10.000 TL", commTl: "1.500 TL", payoutTl: "8.500 TL" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div
        role="note"
        className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950"
      >
        <strong>Erken erişim beta: </strong>
        Bu sayfadaki tutarlar örnek hesaplamalardır. Canlı sipariş veya ödeme
        alınmamaktadır.
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900">
        Influencer Reklam Fiyatları ve Planlanan %15 Komisyon Modeli
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Üyelik ücretsizdir. Canlı iş akışı açıldığında, içerik üreticilerinin
        belirlediği hizmet bedellerinde tamamlanan işler için %15 platform
        komisyonu uygulanması planlanıyor. Aşağıdaki hesaplamalar bu planlanan
        modeli örnekler; şu anda kampanya, sipariş veya ödeme özelliği canlı
        değildir.
      </p>

      <div className="mt-8">
        <CommissionCalculatorWidget locale="tr" />
      </div>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">
          Planlanan Komisyon ve Üretici Payı Örnek Tablosu
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-2.5">Örnek Hizmet Bedeli</th>
                <th className="py-2.5">Planlanan %15 Komisyon</th>
                <th className="py-2.5">Planlanan %85 Üretici Payı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {examples.map((row) => (
                <tr key={row.orderTl}>
                  <td className="py-3 font-bold text-slate-900">
                    {row.orderTl}
                  </td>
                  <td className="py-3 text-indigo-700">{row.commTl}</td>
                  <td className="py-3 font-bold text-emerald-700">
                    {row.payoutTl}
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
