import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEGAL_DOCUMENTS } from "@/lib/data/blogAndLegal";
import { buildCanonicalUrl } from "@/lib/seo/routeRegistry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = LEGAL_DOCUMENTS.find((d) => d.slug === slug);
  if (!doc) {
    return { title: "Belge Bulunamadı", robots: { index: false, follow: false } };
  }
  return {
    title: `${doc.titleTr} (${doc.version})`,
    description: `InfluNex ${doc.titleTr} metni ve KVKK/ticari mevzuat bilgilendirmesi.`,
    alternates: { canonical: buildCanonicalUrl(`/tr/hukuki/${doc.slug}`) },
  };
}

export default async function LegalDocumentPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const doc = LEGAL_DOCUMENTS.find((d) => d.slug === slug);
  if (!doc) notFound();

  const isLegalApproved = process.env.LEGAL_TERMS_APPROVED === "true";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {!isLegalApproved ? (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs font-medium text-amber-900"
        >
          <strong>HUKUKİ UYARI (TASLAK METİN):</strong> Bu sayfadaki metin{" "}
          <code>{doc.version}</code> sürüm numaralı taslaktır ve şirket hukuk
          müşavirinin nihai onayı (<code>LEGAL_TERMS_APPROVED=true</code>)
          tamamlanana kadar bağlayıcı nihai sözleşme olarak kabul edilemez.
        </div>
      ) : null}

      <h1 className="text-3xl font-extrabold text-slate-900">{doc.titleTr}</h1>
      <p className="mt-1 text-xs text-slate-500">
        Sürüm: {doc.version} • Son Güncelleme: {doc.lastUpdated}
      </p>

      <div className="mt-8 space-y-6">
        {doc.sectionsTr.map((sec) => (
          <section
            key={sec.heading}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <h2 className="text-base font-bold text-slate-900">
              {sec.heading}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {sec.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
