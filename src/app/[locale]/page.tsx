import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
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
import {
  calculateCommissionBreakdown,
  formatMinorUnits,
} from "@/lib/finance/commission";
import { DICTIONARY, normalizeLocale } from "@/lib/i18n/dictionary";
import {
  categoryPath,
  localizedPath,
  servicePath,
} from "@/lib/i18n/paths";
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

const HOME_FAQS = {
  tr: [
    {
      question: "InfluNex nedir ve beta sürümünde neler yapabilirim?",
      answer:
        "InfluNex, markaları influencer ve UGC içerik üreticileriyle buluşturmayı hedefleyen bir pazaryeridir. Bu beta sürümünde örnek profilleri inceleyip brief taslağı hazırlayabilirsiniz; kampanya yayınlama, teklif, sipariş ve ödeme özellikleri henüz canlı değildir.",
    },
    {
      question: "Üyelik ve komisyon ücretleri nasıl olacak?",
      answer:
        "Üyelik ücretsizdir. Canlı iş akışı açıldığında tamamlanan iş birliklerinde vergi ve yasal kesintiler öncesi hizmet bedelinin %15'i oranında komisyon alınması planlanıyor. Bu sayfadaki tutarlar örnek hesaplamadır; şu anda sipariş veya ödeme alınmamaktadır.",
    },
    {
      question: "Ödeme ve bloke süreci aktif mi?",
      answer:
        "Hayır. Canlı ödeme, dekont doğrulama veya para bloke etme özelliği henüz etkin değil. Sipariş ve ödeme ekranları yalnızca iş akışını anlatan simülasyonlardır; lütfen ödeme göndermeyin.",
    },
    {
      question: "UGC içerik üreticisi ile influencer arasındaki fark nedir?",
      answer:
        "Influencer'lar içeriği kendi sosyal medya hesaplarında takipçileriyle paylaşır. UGC içerik üreticileri ise içeriği markaya teslim eder; markanın kendi kanallarında veya reklamlarında kullanması için gereken haklar ayrıca kararlaştırılır.",
    },
  ],
  en: [
    {
      question: "What is InfluNex, and what can I do in the beta?",
      answer:
        "InfluNex is a marketplace designed to connect brands with influencers and UGC creators. In this beta, you can browse sample profiles and prepare a campaign brief; publishing campaigns, proposals, orders, and payments are not live yet.",
    },
    {
      question: "How will membership and commission fees work?",
      answer:
        "Membership is free. Once the live workflow launches, the planned model is a 15% commission on completed collaborations, before taxes and statutory deductions. Amounts on this page are examples; orders and payments are not currently processed.",
    },
    {
      question: "Are payments and escrow active?",
      answer:
        "No. Live payments, receipt verification, and holding funds are not enabled. Order and payment screens are workflow simulations only; please do not send money.",
    },
    {
      question: "What is the difference between a UGC creator and an influencer?",
      answer:
        "Influencers publish content on their own social accounts. UGC creators deliver content to a brand; any rights for using it on the brand's channels or in ads must be agreed separately.",
    },
  ],
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = DICTIONARY[locale];

  const { items: featuredCreators, total: totalCreatorsCount } =
    marketplaceStore.searchCreators({
      sortBy: "RECOMMENDED",
      limit: 6,
    });
  const openCampaigns = marketplaceStore.getOpenCampaigns();

  const orgJsonLd = buildOrganizationAndWebsiteJsonLd(locale);
  const faqJsonLd = buildFaqJsonLd(HOME_FAQS[locale]);

  const exploreHref = localizedPath(locale, "creators");
  const campaignsHref = localizedPath(locale, "campaigns");
  const ugcHref = localizedPath(locale, "ugc");
  const signupHref = localizedPath(locale, "signup");
  const pricingHref = localizedPath(locale, "pricing");
  const howItWorksHref = localizedPath(locale, "howItWorks");

  return (
    <div className="bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Single Top Status Bar — Clear, Honest & Non-Repetitive */}
      <div
        role="status"
        className="border-b border-amber-200 bg-amber-50/90 px-4 py-2 text-center text-xs font-medium text-amber-950"
      >
        <strong>Erken Erişim Beta & Örnek Vitrin:</strong>{" "}
        {locale === "tr"
          ? "Örnek profilleri karşılaştırabilir, brief hazırlayabilir ve 15 durumlu sipariş/komisyon simülasyonunu inceleyebilirsiniz."
          : "Compare sample showcase profiles, prepare campaign briefs, and explore the 15-state order & commission workflow."}
      </div>

      {/* 1. EXECUTIVE ABOVE-THE-FOLD HERO WITH DUAL-ROLE DECISION CARDS */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-900">
                <Sparkles size={14} className="text-indigo-600" />
                <span>
                  {t.slogan} • %0 Üyelik Ücreti • Tamamlanan İşte %15 Komisyon
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl sm:leading-[1.12]">
                {t.hero.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                {t.hero.subtitle}
              </p>

              {/* Primary Dual-Role Action Cards (Audit P2-10: Clear single decision path per role) */}
              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link
                  href={exploreHref}
                  className="group flex flex-col justify-between rounded-2xl border-2 border-indigo-600 bg-indigo-600 p-5 text-white shadow-sm transition-[background-color,box-shadow] hover:bg-indigo-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-bold">
                        <BriefcaseBusiness size={14} />
                        {locale === "tr" ? "Markalar İçin" : "For Brands"}
                      </span>
                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                    <h2 className="mt-3 text-lg font-extrabold">
                      {t.hero.ctaFindCreator}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-indigo-100">
                      {locale === "tr"
                        ? `${totalCreatorsCount} örnek vitrin profilini şehir, kategori ve bütçeye göre filtrele.`
                        : `Filter ${totalCreatorsCount} sample showcase profiles by city, category, and budget.`}
                    </p>
                  </div>
                </Link>

                <Link
                  href={`${signupHref}?role=CREATOR`}
                  className="group flex flex-col justify-between rounded-2xl border-2 border-slate-200 bg-white p-5 text-slate-900 shadow-2xs transition-[border-color,box-shadow] hover:border-indigo-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                        <Video size={14} />
                        {locale === "tr"
                          ? "Üreticiler İçin (%85 Pay)"
                          : "For Creators (85% Payout)"}
                      </span>
                      <ArrowRight
                        size={18}
                        className="text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600"
                      />
                    </div>
                    <h2 className="mt-3 text-lg font-extrabold">
                      {t.hero.ctaJoinCreator}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {locale === "tr"
                        ? "Abonelik veya jeton olmadan hizmet paketlerini tanımla, %85 brüt payla kazan."
                        : "List service packages for free with zero subscriptions and earn 85% gross payout."}
                    </p>
                  </div>
                </Link>
              </div>

              {/* Trust Strip */}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  Abonelik veya Jeton Yok
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  6 Boyutlu Kullanım Hakkı & Sabit Snapshot
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-indigo-600" />
                  Ticaret Bakanlığı #reklam Uyumlu
                </span>
              </div>
            </div>

            {/* Right Column: Quick Summary & Platform Navigation Matrix */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Hızlı Kanal Seçimi
                </span>
                <h2 className="mt-1 text-lg font-extrabold text-slate-900">
                  Hangi Platformda İş Birliği Arıyorsunuz?
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {Object.entries(PLATFORM_LABELS).map(([key, info]) => (
                    <Link
                      key={key}
                      href={
                        info.slug === "ugc"
                          ? ugcHref
                          : categoryPath(locale, info.slug)
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-4 transition-[border-color,box-shadow] hover:border-indigo-400 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                    >
                      <span className="text-[11px] font-bold uppercase text-indigo-600">
                        {info.slug.toUpperCase()}
                      </span>
                      <strong className="mt-0.5 block text-base font-extrabold text-slate-900">
                        {locale === "tr" ? info.nameTr : info.nameEn}
                      </strong>
                      <span className="mt-1 block text-xs text-slate-500">
                        Profilleri İncele →
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-indigo-100 bg-white p-4 text-xs text-slate-600">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Örnek Sipariş Matematik Özeti</span>
                    <Link
                      href={pricingHref}
                      className="text-indigo-600 hover:underline"
                    >
                      Detaylı Tablo →
                    </Link>
                  </div>
                  <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-slate-50 p-2">
                      <span className="block text-[10px] text-slate-500">
                        Brüt Sipariş
                      </span>
                      <strong className="text-sm font-extrabold text-slate-900">
                        10.000 TL
                      </strong>
                    </div>
                    <div className="rounded-lg bg-indigo-50 p-2">
                      <span className="block text-[10px] text-indigo-700">
                        %15 Komisyon
                      </span>
                      <strong className="text-sm font-extrabold text-indigo-900">
                        1.500 TL
                      </strong>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-2">
                      <span className="block text-[10px] text-emerald-700">
                        %85 Üretici Payı
                      </span>
                      <strong className="text-sm font-extrabold text-emerald-900">
                        8.500 TL
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED SHOWCASE CREATOR PROFILES + SECONDARY AI SEARCH */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Şeffaf Veri Kaynağı & Hizmet Paketleri
            </span>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
              Örnek Vitrin Profilleri
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Her kartta metrik doğrulama kaynağı, son güncelleme tarihi, toplam
              brüt hizmet bedeli ve %85 üretici payı birlikte gösterilir.
            </p>
          </div>
          <Link
            href={exploreHref}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            Tüm Filtreleri ve Profilleri Aç ({totalCreatorsCount}) →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} locale={locale} />
          ))}
        </div>

        {/* Secondary Task: AI Natural Language Search Assistant */}
        <div className="mt-10">
          <AiNaturalLanguageSearchBox locale={locale} />
        </div>
      </section>

      {/* 3. HOW IT WORKS (3 CLEAR STEPS) & LIVE COMMISSION CALCULATOR */}
      <section className="border-y border-slate-200 bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {locale === "tr" ? "Beta önizlemesi" : "Beta preview"}
              </span>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                {locale === "tr" ? "InfluNex Nasıl Çalışır?" : "How InfluNex Works"}
              </h2>
              <ol className="mt-6 space-y-4 text-sm text-slate-600">
                <li className="flex gap-3.5 rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-950 text-xs font-bold text-white">
                    1
                  </span>
                  <div>
                    <strong className="block text-slate-900">
                      {locale === "tr"
                        ? "Örnekleri İnceleyin, Brief Hazırlayın"
                        : "Explore Samples, Prepare a Brief"}
                    </strong>
                    {locale === "tr"
                      ? "Örnek profilleri ve paketleri karşılaştırıp brief taslağı hazırlayın. Bu adım kampanya yayınlamaz veya teklif toplamaz."
                      : "Compare sample profiles and packages, then prepare a campaign brief. This does not publish a campaign or collect proposals."}
                  </div>
                </li>
                <li className="flex gap-3.5 rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-950 text-xs font-bold text-white">
                    2
                  </span>
                  <div>
                    <strong className="block text-slate-900">
                      {locale === "tr"
                        ? "Sipariş ve Ödeme Akışı Simülasyonu"
                        : "Order and Payment Workflow Simulation"}
                    </strong>
                    {locale === "tr"
                      ? "Ekranlardaki sipariş kodu, dekont ve bloke adımları örnektir. Gerçek ödeme veya para bloke etme yapılmaz; lütfen para göndermeyin."
                      : "Order codes, receipts, and escrow steps shown in the interface are examples. No real payment or funds are processed; please do not send money."}
                  </div>
                </li>
                <li className="flex gap-3.5 rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-950 text-xs font-bold text-white">
                    3
                  </span>
                  <div>
                    <strong className="block text-slate-900">
                      {locale === "tr"
                        ? "Canlı İş Birlikleri Açıldığında"
                        : "When Live Collaborations Launch"}
                    </strong>
                    {locale === "tr"
                      ? "İçerik onayı, reklam açıklamaları ve hakedişler canlı hizmet açıldığında devreye girecek. Şu an sipariş veya ödeme alınmıyor."
                      : "Content approval, ad disclosures, and payouts will be part of the live service when it launches. No orders or payments are processed now."}
                  </div>
                </li>
              </ol>
              <div className="mt-4">
                <Link
                  href={howItWorksHref}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  {locale === "tr"
                    ? "Örnek iş akışını ve planlanan kuralları incele →"
                    : "See the sample workflow and planned rules →"}
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <CommissionCalculatorWidget locale={locale} />
            </div>
          </div>
        </div>
      </section>

      {/* 4. SAMPLE CAMPAIGNS & UGC vs INFLUENCER COMPARISON */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              {locale === "tr" ? "Örnek kampanya briefleri" : "Sample campaign briefs"}
            </span>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
              Örnek Reklam Kampanyaları
            </h2>
          </div>
          <Link
            href={campaignsHref}
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            Tüm Örnek Kampanyaları İncele →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {openCampaigns.map((cmp) => {
            const breakdown = calculateCommissionBreakdown(
              cmp.budgetMinorUnits,
              cmp.currency
            );
            return (
              <article
                key={cmp.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 font-bold text-amber-900">
                      Örnek • {cmp.brandName}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-900">
                      Brüt: {formatMinorUnits(cmp.budgetMinorUnits)}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-base font-bold text-slate-900">
                    {cmp.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">
                    {cmp.description}
                  </p>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Üretici Brüt Payı (%85):</span>
                    <strong className="text-emerald-800">
                      {formatMinorUnits(breakdown.creatorNetPayoutMinorUnits)}
                    </strong>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-slate-500">
                      Teslim: {cmp.deliveryDeadline}
                    </span>
                    <Link
                      href={campaignsHref}
                      className="font-bold text-indigo-600 hover:underline"
                    >
                      Detayları Gör →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 5. COMPACT SEO DISCOVERY HUB (CATEGORIES, CITIES & SERVICES) */}
      <section className="border-t border-slate-200 bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-extrabold text-slate-900">
            Sektör, Şehir ve Hizmet Türüne Göre Hızlı Keşif
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            25 uzmanlık kategorisi, Türkiye şehirleri ve 12 reklam hizmet
            formatı.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Popüler Sektörler
              </h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {INITIAL_CATEGORIES.slice(0, 12).map((cat) => (
                  <Link
                    key={cat.id}
                    href={categoryPath(
                      locale,
                      locale === "tr" ? cat.slugTr : cat.slugEn
                    )}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-semibold text-slate-800 hover:border-indigo-400 hover:text-indigo-600"
                  >
                    {locale === "tr" ? cat.nameTr : cat.nameEn}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Şehir Bazlı Influencer&apos;lar
              </h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {INITIAL_CITIES.map((city) => (
                  <Link
                    key={city.id}
                    href={categoryPath(locale, city.slug)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-semibold text-slate-800 hover:border-indigo-400 hover:text-indigo-600"
                  >
                    {city.nameTr} Influencer&apos;ları
                  </Link>
                ))}
                <Link
                  href={`${exploreHref}/adana/otomotiv`}
                  className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 font-bold text-indigo-800"
                >
                  Adana Otomotiv Influencer&apos;ları
                </Link>
                <Link
                  href={`${exploreHref}/istanbul/moda`}
                  className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 font-bold text-indigo-800"
                >
                  İstanbul Moda Influencer&apos;ları
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Hizmet Paketleri
              </h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {SERVICE_TEMPLATES.slice(0, 8).map((srv) => (
                  <Link
                    key={srv.slug}
                    href={servicePath(locale, srv.slug)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-semibold text-slate-800 hover:border-indigo-400 hover:text-indigo-600"
                  >
                    {locale === "tr" ? srv.nameTr : srv.nameEn}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-extrabold text-slate-900">
          {locale === "tr" ? "Sık Sorulan Sorular" : "Frequently Asked Questions"}
        </h2>
        <div className="mt-8 space-y-3">
          {HOME_FAQS[locale].map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-slate-200 bg-white p-5"
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
      </section>
    </div>
  );
}
