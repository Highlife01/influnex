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
import { AiNaturalLanguageSearchBox } from "@/components/AiNaturalLanguageSearchBox";
import { faqs } from "@/lib/marketplace/content";
import { INITIAL_CATEGORIES, INITIAL_CITIES } from "@/lib/data/catalog";
import {
  buildFaqJsonLd,
  buildOrganizationAndWebsiteJsonLd,
} from "@/lib/seo/jsonLd";

export const metadata: Metadata = {
  title: "Influencer keşfet, iş birliğini planla | InfluNex",
  description:
    "Influencer ve UGC içerik üreticilerini keşfet, örnek profilleri karşılaştır ve kampanya brief’ini hazırla. InfluNex: ücretsiz üyelik, tamamlanan işte %15 komisyon modeli.",
  alternates: {
    canonical: "https://influnex.com/tr",
    languages: {
      "tr-TR": "https://influnex.com/tr",
      en: "https://influnex.com/en",
      "x-default": "https://influnex.com/tr",
    },
  },
  openGraph: {
    title: "InfluNex · İş birliği yap. Birlikte kazan.",
    description:
      "Doğru içerik üreticisini keşfet, bir sonraki iş birliğini planla.",
    locale: "tr_TR",
    type: "website",
    url: "https://influnex.com/tr",
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
              <small>Üreticinin payı</small>
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
              Bir brief, net beklentiler
            </span>
            <span>
              <ShieldCheck size={19} />
              Açık koşullar, şeffaf model
            </span>
          </div>
        </div>

        {/* AI Natural Language Search Box (Section 18) */}
        <section className="shell py-8" aria-label="Yapay Zekâ Influencer Arama">
          <AiNaturalLanguageSearchBox />
        </section>

        <Marketplace />
        <Workflow />
        <EarningsCalculator />

        {/* 3 Collaboration Methods & UGC vs Influencer Matrix (Inspired by Collabstr, Markast, CreatorTR & Influs) */}
        <section className="shell py-12" aria-labelledby="collab-models-heading">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              ESNEK İŞ BİRLİĞİ VE GÜVENLİ SİPARİŞ MİMARİSİ
            </span>
            <h2
              id="collab-models-heading"
              className="mt-2 text-2xl font-extrabold text-slate-900"
            >
              3 Farklı İş Birliği Yöntemi & Influencer / UGC Ayrımı
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <span className="text-xs font-bold text-indigo-700">
                  Yöntem 1 • Hazır Paketler
                </span>
                <h3 className="mt-1 text-base font-bold text-slate-900">
                  Sabit Fiyatlı Hizmet Satın Al
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Influencer profilindeki hazır paketlerden (1 Instagram Reels,
                  3 Kare Story, YouTube İnceleme veya UGC Reklam Videosu)
                  birini seçerek anında sipariş başlatın.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <span className="text-xs font-bold text-indigo-700">
                  Yöntem 2 • Açık İlan & Brief
                </span>
                <h3 className="mt-1 text-base font-bold text-slate-900">
                  Ücretsiz Kampanya Aç, Teklif Topla
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Bütçenizi ve ürün beklentinizi yayınlayın; kriterlerinize uyan
                  onaylı içerik üreticilerinden fiyat ve teslim süresi teklifleri
                  alarak karşılaştırın.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <span className="text-xs font-bold text-indigo-700">
                  Yöntem 3 • Sabitlenen Sipariş Özeti
                </span>
                <h3 className="mt-1 text-base font-bold text-slate-900">
                  Değiştirilemez Snapshot & #reklam Kontrolü
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Sipariş başladığında fiyat, %15 komisyon, revizyon hakkı ve
                  ücretli reklam kullanım izinleri değiştirilemez şekilde
                  sabitlenir.
                </p>
              </div>
            </div>

            {/* Programmatic SEO Internal Link Hub (Section 20, 21 & 26) */}
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-bold text-slate-900">
                Şehir, Kategori ve Hizmet Rehberleri (Programatik SEO Keşif Ağı)
              </h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Link
                  href="/tr/influencer"
                  className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 font-bold text-indigo-800 hover:bg-indigo-100"
                >
                  Tüm Onaylı Influencer&apos;lar
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
                  Açık Kampanyalar
                </Link>
                <Link
                  href="/tr/influencer/adana/otomotiv"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:border-indigo-400"
                >
                  Adana Otomotiv Influencer
                </Link>
                <Link
                  href="/tr/influencer/istanbul/moda"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:border-indigo-400"
                >
                  İstanbul Moda Influencer
                </Link>
                <Link
                  href="/tr/hizmetler/instagram-reels"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:border-indigo-400"
                >
                  Instagram Reels Fiyatları
                </Link>
                <Link
                  href="/tr/influencer-reklam-fiyatlari"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:border-indigo-400"
                >
                  %15 Komisyon & Fiyat Hesaplama
                </Link>
                <Link
                  href="/tr/blog"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:border-indigo-400"
                >
                  Influencer Pazarlama Blogu
                </Link>
                {INITIAL_CITIES.slice(0, 6).map((city) => (
                  <Link
                    key={city.id}
                    href={`/tr/influencer/${city.slug}`}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-indigo-400"
                  >
                    {city.nameTr}
                  </Link>
                ))}
                {INITIAL_CATEGORIES.slice(0, 6).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/tr/influencer/${cat.slugTr}`}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-indigo-400"
                  >
                    {cat.nameTr}
                  </Link>
                ))}
              </div>
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
              hazırlan. InfluNex’in ücretsiz üyelik ve %85 üretici payı modelini
              keşfet.
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
        <p className="shell footer-note">
          Keşif ve brief planlama ön izlemesi · Örnek katalog · Henüz üyelik ve
          ödeme alınmıyor.
        </p>
      </footer>
    </div>
  );
}
