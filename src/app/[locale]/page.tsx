import type { Metadata } from "next";
import Link from "next/link";
import { AiNaturalLanguageSearchBox } from "@/components/AiNaturalLanguageSearchBox";
import { CommissionCalculatorWidget } from "@/components/CommissionCalculatorWidget";
import { CreatorCard } from "@/components/CreatorCard";
import {
  INITIAL_CATEGORIES,
  INITIAL_CITIES,
  PLATFORM_LABELS,
  SERVICE_TEMPLATES,
} from "@/lib/data/catalog";
import { marketplaceStore } from "@/lib/data/marketplaceStore";
import { formatMinorUnits } from "@/lib/finance/commission";
import { DICTIONARY, normalizeLocale } from "@/lib/i18n/dictionary";
import {
  buildFaqJsonLd,
  buildOrganizationAndWebsiteJsonLd,
} from "@/lib/seo/jsonLd";
import { buildHreflangAlternates } from "@/lib/seo/routeRegistry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const alternates = buildHreflangAlternates("/tr", "/en", locale);

  return {
    title:
      locale === "tr"
        ? "InfluNex | Influencer ve UGC İçerik Üretici Pazaryeri"
        : "InfluNex | Global Influencer & UGC Creator Marketplace",
    description:
      locale === "tr"
        ? "Markanız için doğru Instagram, TikTok, YouTube influencer'ını ve UGC içerik üreticisini bulun. Ücretsiz katılın, yalnızca tamamlanan iş birliklerinden %15 komisyon ödeyin."
        : "Find verified Instagram, TikTok, YouTube influencers and UGC creators. Free membership, 15% commission only on completed collaborations.",
    alternates,
  };
}

const HOME_FAQS_TR = [
  {
    question: "InfluNex nedir ve nasıl çalışır?",
    answer:
      "InfluNex, reklamveren markaları Instagram, TikTok, YouTube influencer'ları ve UGC içerik üreticileriyle buluşturan dijital bir reklam pazaryeridir. Reklamverenler doğrudan influencer hizmetini seçerek sipariş oluşturabilir veya açık kampanya ilanı yayınlayarak teklif toplayabilir.",
  },
  {
    question: "InfluNex ücretsiz mi? Komisyon oranı nedir?",
    answer:
      "Evet. Reklamveren ve influencer üyeliği, profil oluşturma, kampanya yayınlama, teklif verme ve mesajlaşma tamamen ücretsizdir. Abonelik, jeton veya premium paket yoktur. Tek gelir modeli tamamlanan iş birliklerinden alınan %15 (1500 BPS) platform komisyonudur; sipariş tutarının %85'i influencer hakedişidir.",
  },
  {
    question: "Ödemeler nasıl yapılır?",
    answer:
      "İlk sürümde ödemeler yalnızca şirket banka hesabına Havale, EFT veya FAST yöntemiyle yapılır. Reklamveren sipariş kodu ile ödeme dekontunu yükler; yönetici banka hareketini doğruladıktan sonra sipariş başlar ve içerik onaylanıp yayınlandığında %85 influencer hakedişi ödenir.",
  },
  {
    question: "UGC içerik üreticisi ile influencer arasındaki fark nedir?",
    answer:
      "Influencer'lar hazırladıkları içeriği kendi sosyal medya hesaplarında takipçileriyle paylaşır. UGC (User Generated Content) içerik üreticileri ise markanın kendi sosyal medya hesaplarında ve Meta/TikTok ücretli reklamlarında kullanabileceği doğal ürün deneyim videoları üretip kullanım haklarıyla teslim eder.",
  },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = DICTIONARY[locale];

  const { items: featuredCreators } = marketplaceStore.searchCreators({
    sortBy: "RECOMMENDED",
    limit: 6,
  });
  const { items: ugcCreators } = marketplaceStore.searchCreators({
    ugcOnly: true,
    limit: 4,
  });
  const openCampaigns = marketplaceStore.getOpenCampaigns();

  const orgJsonLd = buildOrganizationAndWebsiteJsonLd(locale);
  const faqJsonLd = buildFaqJsonLd(HOME_FAQS_TR);
  const exploreBase = locale === "tr" ? "/tr/influencer" : "/en/creators";

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* 1. HERO SECTION */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-800">
              {t.slogan} • %0 Üyelik Ücreti • Yalnızca Başarılı İşlemden %15 Komisyon
            </span>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              {t.hero.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              {t.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={exploreBase}
                className="rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                {t.hero.ctaFindCreator}
              </Link>
              <Link
                href="/tr/kayit?role=CREATOR"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition-colors hover:border-indigo-400 hover:bg-slate-50"
              >
                {t.hero.ctaJoinCreator}
              </Link>
            </div>
          </div>

          {/* 2. SMART AI & FILTER SEARCH */}
          <div className="mx-auto mt-10 max-w-4xl">
            <AiNaturalLanguageSearchBox />
          </div>
        </div>
      </section>

      {/* 3. POPULAR PLATFORMS */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Popüler Sosyal Medya Platformları
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Markanızın hedef kitlesine uygun kanalda doğrudan içerik siparişi verin.
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Object.entries(PLATFORM_LABELS).map(([key, info]) => (
            <Link
              key={key}
              href={
                info.slug === "ugc"
                  ? locale === "tr"
                    ? "/tr/ugc"
                    : "/en/ugc-creators"
                  : `${exploreBase}/${info.slug}`
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-400 hover:shadow-sm"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Platform
              </span>
              <h3 className="mt-1 text-lg font-bold text-slate-900 group-hover:text-indigo-600">
                {locale === "tr" ? info.nameTr : info.nameEn}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Onaylı profilleri ve hizmet fiyatlarını incele →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED REAL APPROVED CREATOR PROFILES */}
      {featuredCreators.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Öne Çıkan Onaylı Influencer Profilleri
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Takipçi ve etkileşim veri kaynağı şeffafça etiketlenmiş içerik üreticileri.
              </p>
            </div>
            <Link
              href={exploreBase}
              className="text-sm font-semibold text-indigo-600 hover:underline"
            >
              Tüm Influencer&apos;ları Gör →
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCreators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}

      {/* 5. POPULAR CATEGORIES (25 Sectors) */}
      <section className="border-y border-slate-200 bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Popüler Sektörler ve İçerik Kategorileri
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                25 farklı uzmanlık kategorisinde markanıza en uygun içerik üreticilerini keşfedin.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {INITIAL_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`${exploreBase}/${locale === "tr" ? cat.slugTr : cat.slugEn}`}
                className="rounded-xl border border-slate-200 bg-white p-3.5 text-sm font-semibold text-slate-800 transition-colors hover:border-indigo-400 hover:text-indigo-600"
              >
                {locale === "tr" ? cat.nameTr : cat.nameEn}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS & TRANSPARENT 15% COMMISSION CALCULATOR */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Sade Deneyim • Güçlü Altyapı
            </span>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              InfluNex Nasıl Çalışır?
            </h2>
            <ol className="mt-6 space-y-5 text-sm text-slate-600">
              <li className="flex gap-3.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-950 text-xs font-bold text-white">
                  1
                </span>
                <div>
                  <strong className="block text-slate-900">
                    Influencer Seçin veya Kampanya Açın
                  </strong>
                  Profil üzerinden hazır hizmeti doğrudan sipariş edin ya da ücretsiz kampanya ilanı açıp teklif toplayın.
                </div>
              </li>
              <li className="flex gap-3.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-950 text-xs font-bold text-white">
                  2
                </span>
                <div>
                  <strong className="block text-slate-900">
                    Banka Havalesi / EFT / FAST ve Dekont Onayı
                  </strong>
                  Sipariş kodu (`INF-2026-XXXXXX`) ile ödemenizi gerçekleştirip dekontu yükleyin; finans ekibi banka hareketini doğruladığında sipariş başlar.
                </div>
              </li>
              <li className="flex gap-3.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-950 text-xs font-bold text-white">
                  3
                </span>
                <div>
                  <strong className="block text-slate-900">
                    İçerik Onayı, #reklam Yayını ve %85 Hakediş
                  </strong>
                  İçeriği inceleyin, gerekirse revizyon isteyin. Yayın tamamlandığında %15 komisyon düşülerek %85 hakediş influencer&apos;a ödenir.
                </div>
              </li>
            </ol>
          </div>

          <div className="lg:col-span-7">
            <CommissionCalculatorWidget />
          </div>
        </div>
      </section>

      {/* 7. OPEN ADVERTISING CAMPAIGNS */}
      {openCampaigns.length > 0 ? (
        <section className="border-t border-slate-200 bg-slate-50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Açık Reklam Kampanyaları
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Markaların yayınladığı güncel iş birliği ilanlarına ücretsiz teklif verin.
                </p>
              </div>
              <Link
                href={locale === "tr" ? "/tr/kampanyalar" : "/en/campaigns"}
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                Tüm Kampanyaları İncele →
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {openCampaigns.map((cmp) => (
                <article
                  key={cmp.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-indigo-600">
                        {cmp.brandName}
                      </span>
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800">
                        Bütçe: {formatMinorUnits(cmp.budgetMinorUnits)}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-bold text-slate-900">
                      {cmp.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">
                      {cmp.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <span className="text-slate-500">
                      Son Başvuru: {cmp.applicationDeadline}
                    </span>
                    <Link
                      href="/tr/kampanyalar"
                      className="font-bold text-indigo-600 hover:underline"
                    >
                      Ücretsiz Teklif Ver →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 8. EXPLORE BY CITY & SERVICE TYPES */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Şehirlere Göre Influencer Keşfedin
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Bölgesel işletmeniz veya ulusal kampanyanız için şehir bazlı içerik üreticileri.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {INITIAL_CITIES.map((city) => (
                <Link
                  key={city.id}
                  href={`${exploreBase}/${city.slug}`}
                  className="rounded-xl border border-slate-200 bg-white p-3 text-center text-sm font-semibold text-slate-800 hover:border-indigo-400 hover:text-indigo-600"
                >
                  {city.nameTr}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Popüler Reklam Hizmetleri
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Hizmet türüne göre şeffaf fiyatları ve teslim sürelerini karşılaştırın.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SERVICE_TEMPLATES.slice(0, 6).map((srv) => (
                <Link
                  key={srv.slug}
                  href={`/tr/hizmetler/${srv.slug}`}
                  className="rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-800 hover:border-indigo-400 hover:text-indigo-600"
                >
                  {srv.nameTr}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. UGC CREATORS SHOWCASE */}
      {ugcCreators.length > 0 ? (
        <section className="border-t border-slate-200 bg-slate-50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  UGC İçerik Üreticileri (Meta & TikTok Reklam Kreatifleri)
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Markanızın kendi reklamlarında kullanabileceği doğal ürün deneyim videoları.
                </p>
              </div>
              <Link
                href="/tr/ugc"
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                Tüm UGC Üreticilerini Gör →
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {ugcCreators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 10. ADVERTISER & CREATOR VALUE PROPOSITIONS */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Reklamverenler İçin
            </span>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Neden Markalar InfluNex&apos;i Tercih Ediyor?
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>• Ücretsiz üyelik ve ücretsiz kampanya ilanı oluşturma</li>
              <li>• Doğrulanmış ve kullanıcı beyanlı istatistiklerin açık ayrımı</li>
              <li>• Sipariş anında sabitlenen fiyat, teslim süresi ve içerik kullanım hakları</li>
              <li>• Ticaret Bakanlığı #reklam / #işbirliği mevzuatına tam uyumlu teslimat kontrolü</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
              Influencer ve UGC Üreticileri İçin
            </span>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              İçerik Üreterek Güvenle Kazanın
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>• Abonelik, jeton veya profil listeleme ücreti olmadan %100 ücretsiz katılım</li>
              <li>• Tamamlanan her siparişte %85 net brüt hakediş oranı</li>
              <li>• Ödeme onayı alınmadan işe başlama riskinin ortadan kaldırılması</li>
              <li>• SEO uyumlu kalıcı profil sayfası (`/tr/influencer/kullanici-adi`)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 11. FAQ SECTION */}
      <section className="border-t border-slate-200 bg-slate-50 py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Sık Sorulan Sorular
          </h2>
          <div className="mt-8 space-y-4">
            {HOME_FAQS_TR.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-slate-200 bg-white p-5"
                open
              >
                <summary className="cursor-pointer text-base font-bold text-slate-900">
                  {faq.question}
                </summary>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
