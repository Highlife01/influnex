import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Crown,
  Globe,
  Layers,
  Lock,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Video,
  Zap,
} from "lucide-react";
import { AiNaturalLanguageSearchBox } from "@/components/AiNaturalLanguageSearchBox";
import { CommissionCalculatorWidget } from "@/components/CommissionCalculatorWidget";
import { CreatorCard } from "@/components/CreatorCard";
import { PlatformStatisticsSection } from "@/components/PlatformStatisticsSection";
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
        ? "Influencer ve UGC İçerik Üretici Pazaryeri"
        : "Global Influencer & UGC Creator Marketplace",
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
      question: "InfluNex nedir ve nasıl çalışır?",
      answer:
        "InfluNex, markaları doğrulanmış influencer ve UGC içerik üreticileriyle buluşturan iki taraflı bir pazaryeridir. Profilleri karşılaştırabilir, AI destekli kampanya briefi hazırlayabilir ve 15 durumlu sipariş/bloke güvencesiyle iş birliği yürütebilirsiniz.",
    },
    {
      question: "Üyelik ve komisyon ücretleri nasıl çalışır?",
      answer:
        "Üyelik, profil oluşturma ve kampanya listeleme tamamen ücretsizdir. Tamamlanan iş birliklerinde vergi ve yasal kesintiler öncesi brüt hizmet bedelinin %15'i platform komisyonu olarak ayrılır, %85'i doğrudan içerik üreticisinin brüt hakedişidir.",
    },
    {
      question: "Influencer'lar için ödeme ve telif güvencesi nasıl sağlanır?",
      answer:
        "Her siparişte fiyat, komisyon, revizyon sayısı ve 6 boyutlu kullanım hakkı (Organik / Paid Ads / Süre / Coğrafya) değiştirilemez snapshot olarak sabitlenir. Ödeme onaylanıp bloke edilmeden çekim süreci başlamaz.",
    },
    {
      question: "UGC içerik üreticisi ile influencer arasındaki fark nedir?",
      answer:
        "Influencer'lar içeriği kendi sosyal medya hesaplarında takipçileriyle paylaşır. UGC içerik üreticileri ise içeriği markaya teslim eder; markanın kendi kanallarında veya reklamlarında kullanması için gereken haklar pakette net olarak tanımlanır.",
    },
  ],
  en: [
    {
      question: "What is InfluNex, and what can I do in the beta?",
      answer:
        "InfluNex is a next-generation marketplace connecting brands with influencers and UGC creators. You can browse sample profiles, prepare AI campaign briefs, explore transparent format benchmarks, and test the Super Admin, Creator, and Advertiser dashboards.",
    },
    {
      question: "How do membership and commission fees work?",
      answer:
        "Membership, listing, and campaign creation are 100% free. On completed collaborations, the platform takes a 15% commission on the gross service fee before taxes, leaving an 85% gross payout to the creator.",
    },
    {
      question: "How are creator payments and usage rights protected?",
      answer:
        "Every order locks price, commission, revision limits, and 6-dimensional usage rights (Organic / Paid Ads / Duration / Geography) as an immutable snapshot.",
    },
    {
      question: "What is the difference between a UGC creator and an influencer?",
      answer:
        "Influencers publish content on their own social accounts. UGC creators deliver content to a brand for use on the brand's channels or paid ads according to the agreed usage license.",
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

      {/* Single Top Status Bar — Clear, Honest & Direct Dashboard Shortcuts */}
      <div
        role="status"
        className="border-b border-indigo-200 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 px-4 py-2 text-center text-xs font-medium text-indigo-100"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span>
            <strong className="text-emerald-300">
              InfluNex Global Marketplace:
            </strong>{" "}
            {locale === "tr"
              ? "%85 Üretici Hakedişi • %15 Tamamlanan İş Komisyonu • 15 Durumlu Sipariş & Bloke Mimarisi"
              : "85% Creator Payout • 15% Commission on Completed Deals • 15-State Order Protection"}
          </span>
          <span className="inline-flex items-center gap-2 font-bold">
            <Link
              href={`/${locale}/yayinci/panel`}
              className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-emerald-300 hover:bg-emerald-500/30"
            >
              {locale === "tr" ? "Influencer Paneli →" : "Creator Panel →"}
            </Link>
            <Link
              href={`/${locale}/yonetim`}
              className="rounded-md bg-indigo-500/25 px-2 py-0.5 text-indigo-200 hover:bg-indigo-500/40"
            >
              {locale === "tr" ? "Süperadmin Kokpiti →" : "Super Admin →"}
            </Link>
          </span>
        </div>
      </div>

      {/* 1. EXECUTIVE ABOVE-THE-FOLD HERO WITH CREATOR-MAGNETIC & BRAND CARDS */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-indigo-50/70 via-white to-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-indigo-200 bg-white px-3.5 py-1.5 text-xs font-bold text-indigo-950 shadow-2xs">
                <Sparkles size={14} className="text-indigo-600" />
                <span>
                  {t.slogan} • %0 Sabit Ücret • %85 Influencer Hakedişi
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl sm:leading-[1.12]">
                {locale === "tr"
                  ? "İyi bir iş birliği, doğru buluşmayla başlar. 💙"
                  : t.hero.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                {locale === "tr"
                  ? "InfluNex, markalarla içerik üreticilerini bir araya getirir. Markanız için yaratıcı içerikler üretecek kişilerle tanışın; içerik üreticisiyseniz tarzınıza ve kitlenize uygun markalarla yeni iş birliklerinin kapısını açın."
                  : t.hero.subtitle}
              </p>

              {/* Featured Influencer Leader Above-the-Fold Spotlight Card */}
              <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-50 via-white to-teal-50 p-4 shadow-md sm:flex-row sm:items-center">
                <div className="flex items-center gap-3.5">
                  <img
                    src="/creators/guldkoc.jpg"
                    alt="Gül Koç (@guldkoc)"
                    width={60}
                    height={60}
                    className="h-15 w-15 rounded-2xl border-2 border-emerald-500 object-cover shadow-xs"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-emerald-600 to-teal-700 px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                        👑 {locale === "tr" ? "Influencer Lideri" : "Influencer Leader"}
                      </span>
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-900">
                        Adana • Güzellik, Moda & UGC
                      </span>
                    </div>
                    <h2 className="mt-1 text-base font-black text-slate-950">
                      Gül Koç{" "}
                      <span className="text-xs font-bold text-indigo-700">
                        (@guldkoc)
                      </span>
                    </h2>
                    <p className="text-xs font-medium text-slate-600">
                      10,4 B Takipçi • %5,8 Etkileşim • Instagram Reels, Story & UGC İş Birlikleri
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="https://www.instagram.com/guldkoc/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-pink-300 bg-pink-50 px-3 py-2 text-xs font-bold text-pink-800 hover:bg-pink-100"
                  >
                    Instagram ↗
                  </a>
                  <Link
                    href={`/${locale}/influencer/guldkoc`}
                    className="rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-emerald-800"
                  >
                    {locale === "tr" ? "Profili & Paketleri Gör →" : "View Leader Profile →"}
                  </Link>
                </div>
              </div>

              {/* Primary Dual-Role Action Cards */}
              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link
                  href={`${signupHref}?role=CREATOR`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-emerald-600 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 text-white shadow-md transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-2.5 py-1 text-xs font-extrabold text-white">
                        <Crown size={14} />
                        {locale === "tr"
                          ? "Influencer & UGC Üreticileri (%85 Pay)"
                          : "For Creators (85% Payout)"}
                      </span>
                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                    <h2 className="mt-3 text-lg font-black">
                      {locale === "tr"
                        ? "Yaratıcılığın yeni iş birliklerine dönüşsün. ✨"
                        : t.hero.ctaJoinCreator}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-50">
                      {locale === "tr"
                        ? "İçerik üretmeyi seviyor, kendi tarzınla markalara değer katmak istiyorsan InfluNex ile tanış. Ürettiğin içerikleri, ilgi alanlarını ve kitleni anlat; %85 brüt hakedişle kazan."
                        : "Launch your free creator showcase, set your own prices and usage rights, and keep 85% gross payout."}
                    </p>
                  </div>
                </Link>

                <Link
                  href={exploreHref}
                  className="group flex flex-col justify-between rounded-2xl border-2 border-indigo-600 bg-indigo-600 p-5 text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-bold">
                        <BriefcaseBusiness size={14} />
                        {locale === "tr" ? "Markalar & Ajanslar İçin" : "For Brands"}
                      </span>
                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                    <h2 className="mt-3 text-lg font-black">
                      {locale === "tr"
                        ? "Markanızın hikâyesini kim anlatsın? 🎯"
                        : t.hero.ctaFindCreator}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-indigo-100">
                      {locale === "tr"
                        ? `Ürününüzü, hedef kitlenizi ve kampanya fikrinizi paylaşın. İçeriğiyle markanıza uyum sağlayabilecek ${totalCreatorsCount} doğrulanmış üreticiyle tanışın.`
                        : `Filter ${totalCreatorsCount} showcase profiles by city, category, ER, and budget.`}
                    </p>
                  </div>
                </Link>
              </div>

              {/* Trust Strip */}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-700">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  Abonelik veya Jeton Yok
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  Ödeme Bloke & 6 Boyutlu Telif Koruması
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-indigo-600" />
                  Ticaret Bakanlığı #reklam Uyumlu
                </span>
              </div>
            </div>

            {/* Right Column: Quick Channel Matrix & Live Dashboard Access */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-950/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Çok Kanallı Keşif Matrisi
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                    4 Ana Kanal • 12 Format
                  </span>
                </div>
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
                      className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-indigo-500 hover:bg-indigo-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                    >
                      <span className="text-[11px] font-bold uppercase text-indigo-600">
                        {info.slug.toUpperCase()}
                      </span>
                      <strong className="mt-0.5 block text-base font-extrabold text-slate-900 group-hover:text-indigo-950">
                        {locale === "tr" ? info.nameTr : info.nameEn}
                      </strong>
                      <span className="mt-1 block text-xs font-semibold text-slate-500 group-hover:text-indigo-700">
                        Profilleri İncele →
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-indigo-100 bg-slate-50 p-4 text-xs text-slate-600">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Şeffaf Hakediş Matematiği (10.000 TL)</span>
                    <Link
                      href={pricingHref}
                      className="text-indigo-600 hover:underline"
                    >
                      Komisyon Politikası →
                    </Link>
                  </div>
                  <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-white p-2.5 shadow-2xs">
                      <span className="block text-[10px] text-slate-500">
                        Brüt Sipariş
                      </span>
                      <strong className="text-sm font-black text-slate-900">
                        10.000 TL
                      </strong>
                    </div>
                    <div className="rounded-xl bg-indigo-50 p-2.5">
                      <span className="block text-[10px] text-indigo-700">
                        %15 Komisyon
                      </span>
                      <strong className="text-sm font-black text-indigo-900">
                        1.500 TL
                      </strong>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-2.5">
                      <span className="block text-[10px] text-emerald-700">
                        %85 Influencer Payı
                      </span>
                      <strong className="text-sm font-black text-emerald-900">
                        8.500 TL
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Quick Cockpit Switcher */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                  <Link
                    href={`/${locale}/yayinci/panel`}
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-2 text-emerald-900 hover:bg-emerald-100"
                  >
                    Yayıncı Paneli
                  </Link>
                  <Link
                    href={`/${locale}/reklamveren/panel`}
                    className="rounded-xl border border-indigo-200 bg-indigo-50 px-2 py-2 text-indigo-900 hover:bg-indigo-100"
                  >
                    Reklamveren Paneli
                  </Link>
                  <Link
                    href={`/${locale}/yonetim`}
                    className="rounded-xl border border-slate-300 bg-slate-900 px-2 py-2 text-white hover:bg-slate-800"
                  >
                    Süperadmin Paneli
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CREATOR-MAGNETIC VALUE PROPOSITION: WHY TOP INFLUENCERS & UGC CREATORS CHOOSE INFLUNEX */}
      <section className="border-b border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800">
                <Crown size={14} />
                {locale === "tr"
                  ? "İçerik Üreticisi Öncelikli Mimari"
                  : "Creator-First Marketplace Architecture"}
              </span>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                {locale === "tr"
                  ? "Influencer ve UGC Üreticileri Neden InfluNex'i Seçiyor?"
                  : "Why Influencers & UGC Creators Choose InfluNex"}
              </h2>
              <p className="mt-1 max-w-3xl text-sm text-slate-600">
                {locale === "tr"
                  ? "DM karmaşası, belirsiz revizyon talepleri, geciken ödemeler ve izinsiz reklam kullanımlarına son veren 4 temel üretici güvencesi."
                  : "Four core creator protections that eliminate DM chaos, endless revisions, late payouts, and unauthorized ad usage."}
              </p>
            </div>
            <Link
              href={`/${locale}/yayinci/panel`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-950"
            >
              <Video size={15} />
              {locale === "tr"
                ? "Yayıncı Kokpitini Canlı İncele →"
                : "Open Creator Cockpit →"}
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-3xl border border-emerald-200 bg-gradient-to-b from-emerald-50/70 to-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                <TrendingUp size={20} />
              </div>
              <span className="mt-4 inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold text-emerald-900">
                8500 BPS Hakediş
              </span>
              <h3 className="mt-2 text-base font-black text-slate-950">
                %85 Yüksek Gelir Payı & Sıfır Sabit Ücret
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Aylık abonelik, teklif jetonu veya vitrin öne çıkarma ücreti
                ödemezsin. Yalnızca tamamlanan iş birliğinde %15 komisyon
                kesilir; %85 brüt hakediş senindir.
              </p>
            </article>

            <article className="rounded-3xl border border-indigo-200 bg-gradient-to-b from-indigo-50/70 to-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                <Lock size={20} />
              </div>
              <span className="mt-4 inline-block rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-extrabold text-indigo-900">
                Bloke (Escrow) Koruması
              </span>
              <h3 className="mt-2 text-base font-black text-slate-950">
                Ödeme Bloke Edilmeden Çekime Başlama Riski Yok
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Marka ödemesi tekil sipariş koduyla doğrulanıp bloke hesabına
                alındığında (<code>PAID</code>) çekime başlarsın; içerik teslim
                sonrası ödeme peşinde koşmazsın.
              </p>
            </article>

            <article className="rounded-3xl border border-violet-200 bg-gradient-to-b from-violet-50/70 to-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm">
                <Layers size={20} />
              </div>
              <span className="mt-4 inline-block rounded-md bg-violet-100 px-2 py-0.5 text-[11px] font-extrabold text-violet-900">
                Immutable Snapshot
              </span>
              <h3 className="mt-2 text-base font-black text-slate-950">
                6 Boyutlu Telif & Revizyon Sınırı Güvencesi
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Organik paylaşım mı, Paid Ads sponsorlu reklam mı, kaç gün ve
                kaç revizyon hakkı var? Sipariş anında snapshot olarak
                kilitlenir; kapsam dışı ek iş istenemez.
              </p>
            </article>

            <article className="rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50/70 to-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-sm">
                <Globe size={20} />
              </div>
              <span className="mt-4 inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-extrabold text-amber-900">
                SEO & AI Görünürlüğü
              </span>
              <h3 className="mt-2 text-base font-black text-slate-950">
                Google & Yapay Zekâ Aramalarında Kişisel Vitrin
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                <code>/tr/influencer/kullanici-adi</code> adresin Schema.org
                JSON-LD yapısıyla Google ve AI arama motorlarında markaların
                seni organik olarak bulmasını sağlar.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* 3. FEATURED SHOWCASE CREATOR PROFILES + AI NATURAL LANGUAGE SEARCH */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Şeffaf Veri Kaynağı & Hizmet Paketleri
              </span>
              <Link
                href={`/${locale}/influencer/guldkoc`}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-0.5 text-xs font-extrabold text-emerald-900 hover:bg-emerald-100"
              >
                👑 Influencer Lideri: Gül Koç (@guldkoc) →
              </Link>
            </div>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Öne Çıkan Influencer & UGC Vitrin Profilleri
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

        {/* AI Natural Language Search Assistant */}
        <div className="mt-10">
          <AiNaturalLanguageSearchBox locale={locale} />
        </div>
      </section>

      {/* 4. PROFESSIONAL PLATFORM STATISTICS, FORMAT BENCHMARKS & CREATOR INCOME SIMULATOR */}
      <PlatformStatisticsSection
        locale={locale}
        approvedCreatorCount={totalCreatorsCount}
        openCampaignCount={openCampaigns.length}
      />

      {/* 5. HOW IT WORKS (3 CLEAR STEPS) & LIVE COMMISSION CALCULATOR */}
      <section className="border-b border-slate-200 bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {locale === "tr" ? "Uçtan Uca Güvenli Akış" : "End-to-End Workflow"}
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
                        ? "Profilleri Karşılaştırın & AI Brief Hazırlayın"
                        : "Compare Profiles & Prepare an AI Brief"}
                    </strong>
                    {locale === "tr"
                      ? "Doğrulanmış etkileşim oranlarını, 6 boyutlu kullanım haklarını ve paket fiyatlarını karşılaştırıp brief oluşturun."
                      : "Compare engagement rates, 6-dimensional usage rights, and package prices to prepare your campaign brief."}
                  </div>
                </li>
                <li className="flex gap-3.5 rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-950 text-xs font-bold text-white">
                    2
                  </span>
                  <div>
                    <strong className="block text-slate-900">
                      {locale === "tr"
                        ? "Sabit Snapshot & 15 Durumlu Sipariş Güvencesi"
                        : "Immutable Snapshot & 15-State Order Protection"}
                    </strong>
                    {locale === "tr"
                      ? "Sipariş başlatıldığında fiyat, %15 komisyon, %85 üretici hakedişi ve revizyon hakkı snapshot olarak sabitlenir."
                      : "When an order starts, price, 15% commission, 85% creator payout, and revision limits are locked as a snapshot."}
                  </div>
                </li>
                <li className="flex gap-3.5 rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-950 text-xs font-bold text-white">
                    3
                  </span>
                  <div>
                    <strong className="block text-slate-900">
                      {locale === "tr"
                        ? "#reklam Doğrulaması & %85 Hakediş Aktarımı"
                        : "#ad Disclosure Verification & 85% Payout"}
                    </strong>
                    {locale === "tr"
                      ? "Taslak onaylanıp Ticaret Bakanlığı #reklam etiketiyle yayına alındığında %85 brüt hakediş üretici ödeme kuyruğuna aktarılır."
                      : "Once the draft is approved and published with #ad disclosure, the 85% gross payout moves to the creator settlement queue."}
                  </div>
                </li>
              </ol>
              <div className="mt-4">
                <Link
                  href={howItWorksHref}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  {locale === "tr"
                    ? "Tüm 15 sipariş durumunu ve iş akışını incele →"
                    : "See all 15 order states and workflow details →"}
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <CommissionCalculatorWidget locale={locale} />
            </div>
          </div>
        </div>
      </section>

      {/* 6. SAMPLE CAMPAIGNS & UGC vs INFLUENCER COMPARISON */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              {locale === "tr" ? "Açık Kampanya Briefleri" : "Open Campaign Briefs"}
            </span>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
              Açık Reklam Kampanyaları & %85 Hakediş Fırsatları
            </h2>
          </div>
          <Link
            href={campaignsHref}
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            Tüm Kampanyaları İncele →
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
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-indigo-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-bold text-indigo-900">
                      {cmp.brandName}
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

      {/* 7. COMPACT SEO DISCOVERY HUB (CATEGORIES, CITIES & SERVICES) */}
      <section className="border-t border-slate-200 bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-extrabold text-slate-900">
            Sektör, Şehir ve Hizmet Türüne Göre Hızlı Keşif
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            25 uzmanlık kategorisi, 81 Türkiye şehri ve 12 reklam hizmet
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

      {/* 8. FAQ SECTION */}
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
