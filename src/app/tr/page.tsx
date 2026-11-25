import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  ShieldCheck,
  Sparkles,
  Camera,
  FileText,
  Heart,
  ChevronDown,
} from "lucide-react";
import { Navigation } from "@/components/home/navigation";
import { Marketplace } from "@/components/home/marketplace";
import { Workflow, EarningsCalculator } from "@/components/home/workflow";
import { faqs } from "@/lib/marketplace/content";
import { INITIAL_CATEGORIES, INITIAL_CITIES } from "@/lib/data/catalog";
import {
  buildFaqJsonLd,
  buildOrganizationAndWebsiteJsonLd,
} from "@/lib/seo/jsonLd";
import { SITE_BASE_URL } from "@/lib/seo/routeRegistry";

export const metadata: Metadata = {
  title: "Influencer keşfet, iş birliğini planla | InfluNex",
  description:
    "Influencer ve UGC içerik üreticilerini keşfet, örnek profilleri karşılaştır ve kampanya brief’ini hazırla. InfluNex: ücretsiz üyelik, tamamlanan işte %15 komisyon modeli.",
  alternates: {
    canonical: `${SITE_BASE_URL}/tr`,
    languages: {
      "tr-TR": `${SITE_BASE_URL}/tr`,
      en: `${SITE_BASE_URL}/en`,
      "x-default": `${SITE_BASE_URL}/tr`,
    },
  },
  openGraph: {
    title: "InfluNex · İş birliği yap. Birlikte kazan.",
    description:
      "Doğru içerik üreticisini keşfet, bir sonraki iş birliğini planla.",
    locale: "tr_TR",
    type: "website",
    url: `${SITE_BASE_URL}/tr`,
  },
};

export default function TurkishHomePage() {
  const orgJsonLd = buildOrganizationAndWebsiteJsonLd("tr");
  const faqJsonLd = buildFaqJsonLd(faqs);

  return (
    <div className="marketplace-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <a className="skip-link" href="#main">
        İçeriğe geç
      </a>
      <Navigation />

      {/* Single Unified Platform Status Banner (Audit Section 2 Fix - No contradictory or repeated status messages) */}
      <div
        role="status"
        className="border-b border-amber-200 bg-amber-50/90 px-4 py-2.5 text-center text-xs font-medium text-amber-950"
      >
        <strong>Erken Erişim Beta & Örnek Vitrin Modu:</strong> Keşif, yan yana
        karşılaştırma, brief planlama, 15 durumlu örnek sipariş simülasyonu ve
        Google ile beta ön kaydı açıktır. Vitrin profilleri örnek veridir; canlı
        banka transferi tahsilatı hukuki sözleşme aktivasyonu sonrasında
        başlatılacaktır.
      </div>

      <main id="main">
        <section className="hero shell">
          <div className="hero-text">
            <div className="eyebrow">
              <Sparkles size={15} />
              Markalar ve içerik üreticileri burada buluşuyor.
            </div>
            <h1>
              İş birliği yap.
              <br />
              <span>Birlikte kazan.</span>
            </h1>
            <p className="hero-copy">
              Markanız için doğru influencer&apos;ı bulun veya içerik üreterek
              kazanmaya başlayın. Ücretsiz katılın, kolayca iş birliği yapın.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="/tr/kayit?role=ADVERTISER">
                Reklamveren olarak katıl
              </a>
              <a className="secondary-button" href="/tr/kayit?role=CREATOR">
                Yayıncı olarak katıl
              </a>
            </div>
            <div className="trust-row">
              <span>
                <Check size={16} />
                Ücretsiz üyelik modeli
              </span>
              <span>
                <Check size={16} />
                Abonelik yok
              </span>
              <span>
                <Check size={16} />
                Tamamlanan işte %15
              </span>
            </div>
          </div>
          <div
            className="hero-visual"
            aria-label="İçerik üreticilerini temsil eden görseller"
          >
            <div className="visual-orbit" />
            <div className="float-card">
              <span className="float-icon">
                <Heart size={20} />
              </span>
              <div>
                Doğru insan.
                <br />
                <span>Güzel iş birliği.</span>
              </div>
            </div>
            <div className="portrait-main">
              <span className="portrait-label">
                <Camera size={15} />
                Yaşamın içinden içerikler
              </span>
            </div>
            <div className="portrait-small">
              <span className="portrait-label">Bir fikirle başlar.</span>
            </div>
            <div className="commission-card">
              <small>Üreticinin brüt payı</small>
              <strong>
                %85<span>senin.</span>
              </strong>
            </div>
            <span className="hero-image-note">Temsili görseller</span>
          </div>
        </section>

        <div className="value-strip">
          <div className="shell">
            <span>
              <Camera size={19} />
              Instagram · TikTok · YouTube · UGC
            </span>
            <span>
              <FileText size={19} />
              6 Boyutlu Kullanım Hakkı & Sabit Snapshot
            </span>
            <span>
              <ShieldCheck size={19} />
              Vergi Hariç Brüt Tutar Üzerinden %15 Komisyon
            </span>
          </div>
        </div>

        <Marketplace />
        <Workflow />
        <EarningsCalculator />

        {/* Programmatic SEO Internal Link Matrix (Human-readable names with spaces) */}
        <section className="shell py-10" aria-labelledby="seo-hub-heading">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
            <h2
              id="seo-hub-heading"
              className="text-lg font-extrabold text-slate-900"
            >
              Şehir, Kategori ve Hizmet Rehberleri
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              İlgili şehir ve sektörlerdeki örnek vitrin profillerini, hizmet
              paketlerini ve editoryal rehberleri inceleyin.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Link
                href="/tr/influencer"
                className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 font-bold text-indigo-800 hover:bg-indigo-100"
              >
                Influencer Keşfet
              </Link>
              <Link
                href="/tr/ugc"
                className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 font-bold text-violet-800 hover:bg-violet-100"
              >
                UGC İçerik Üreticileri
              </Link>
              <Link
                href="/tr/kampanyalar"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:border-indigo-400"
              >
                Örnek Kampanyalar
              </Link>
              <Link
                href="/tr/influencer/adana/otomotiv"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:border-indigo-400"
              >
                Adana Otomotiv Influencer&apos;ları
              </Link>
              <Link
                href="/tr/influencer/istanbul/moda"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:border-indigo-400"
              >
                İstanbul Moda Influencer&apos;ları
              </Link>
              <Link
                href="/tr/hizmetler/instagram-reels"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:border-indigo-400"
              >
                Instagram Reels Paketleri
              </Link>
              <Link
                href="/tr/influencer-reklam-fiyatlari"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:border-indigo-400"
              >
                %15 Komisyon & Hakediş Tablosu
              </Link>
              <Link
                href="/tr/blog"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:border-indigo-400"
              >
                Rehber & Blog
              </Link>
              {INITIAL_CITIES.slice(0, 6).map((city) => (
                <Link
                  key={city.id}
                  href={`/tr/influencer/${city.slug}`}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-indigo-400"
                >
                  {city.nameTr} Influencer&apos;ları
                </Link>
              ))}
              {INITIAL_CATEGORIES.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/tr/influencer/${cat.slugTr}`}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-indigo-400"
                >
                  {cat.nameTr} Influencer&apos;ları
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section
          className="creator-invite shell"
          id="ureticiler"
          aria-labelledby="creator-title"
        >
          <div className="invite-art" aria-hidden="true">
            <Camera size={52} />
            <span>
              Sen üret.
              <br />
              Hikâyen konuşsun.
            </span>
            <Sparkles className="invite-sparkle" size={31} />
          </div>
          <div>
            <span className="section-kicker">YETENEĞİNİN BİR KARŞILIĞI VAR</span>
            <h2 id="creator-title">
              İçerik üreticisi misin?
              <br />
              Burada sana da yer var.
            </h2>
            <p>
              İster ilk portföyünü oluştur, ister yeni markalarla çalışmaya
              hazırlan. InfluNex’in ücretsiz üyelik ve vergi öncesi %85 brüt
              üretici payı modelini keşfet.
            </p>
            <a className="primary-button" href="/tr/kayit?role=CREATOR">
              Yayıncı olarak ücretsiz katıl
            </a>
            <a className="underlined-link invite-link" href="#nasil-calisir">
              İş birliği adımlarını incele
            </a>
          </div>
        </section>

        <section
          className="faq-section shell section-space"
          id="sss"
          aria-labelledby="faq-title"
        >
          <div>
            <span className="section-kicker">AKLINDA SORU KALMASIN</span>
            <h2 id="faq-title">Merak ettiklerin.</h2>
            <p>
              İlk iş birliğinden önce
              <br />
              bilmek isteyeceklerin burada.
            </p>
          </div>
          <div className="faq-list">
            {faqs.map((faq) => (
              <details className="faq-item" key={faq.question}>
                <summary>
                  {faq.question}
                  <ChevronDown size={20} />
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="closing-cta">
          <div className="shell">
            <span className="section-kicker">
              BİR SONRAKİ HİKÂYENİ BAŞLAT
            </span>
            <h2>
              Güzel fikirler,
              <br />
              doğru insanlarla büyür.
            </h2>
            <p>Keşfet, karşılaştır ve brief’ini hazırla. İlk adım senden.</p>
            <a className="primary-button" href="#kesfet">
              İçerik üreticilerini keşfet
            </a>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="shell footer-inner">
          <a className="brand" href="/tr">
            <span className="brand-mark">IN</span>influnex
          </a>
          <span>© 2026 InfluNex. Birlikte üret, birlikte kazan.</span>
          <div className="footer-links">
            <a href="#kampanyalar">Brief oluştur</a>
            <a href="#sss">Sorular ve koşullar</a>
            <Link href="/tr/hukuki/kullanim-kosullari">Hukuki Metinler</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
