import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Globe,
  Lock,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Video,
} from "lucide-react";
import { AiNaturalLanguageSearchBox } from "@/components/AiNaturalLanguageSearchBox";
import { BrandIntroOverlay } from "@/components/BrandIntroOverlay";
import { CommissionCalculatorWidget } from "@/components/CommissionCalculatorWidget";
import { CreatorCard } from "@/components/CreatorCard";
import { PlatformStatisticsSection } from "@/components/PlatformStatisticsSection";
import {
  FEATURED_CITIES,
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
        ? "Markanız için doğru Instagram, TikTok, YouTube influencer'ını ve UGC içerik üreticisini bulun. Ücretsiz katılın, kolayca iş birliği yapın."
        : "Find verified Instagram, TikTok, YouTube influencers and UGC creators. Free membership, 15% commission only on completed collaborations.",
    alternates,
  };
}

const HOME_FAQS = {
  tr: [
    {
      question: "InfluNex nedir ve nasıl çalışır?",
      answer:
        "InfluNex, markalarla influencer ve UGC içerik üreticilerini bir araya getiren bir iş birliği platformudur. Profilleri ve paket fiyatlarını inceleyebilir, ücretsiz kampanya ilanı açabilir ve güvenli iş birliği başlatabilirsiniz.",
    },
    {
      question: "Üyelik ücretli mi? Komisyon oranı nedir?",
      answer:
        "Hayır, hem markalar hem de içerik üreticileri için üyelik ve ilan açmak tamamen ücretsizdir. Yalnızca başarıyla tamamlanan iş birliklerinde hizmet bedelinin %15'i platform komisyonu olarak alınır, %85'i içerik üreticisine ödenir.",
    },
    {
      question: "Ödemeler nasıl güvenceye alınıyor?",
      answer:
        "İş birliği başladığında içerik kapsamı, teslim süresi ve ücret sabitlenir. Marka ödemeyi yaptığında tutar güvenceye alınır; içerik hazırlanıp onaylandıktan sonra üreticiye aktarılır.",
    },
    {
      question: "UGC içerik üreticisi ile influencer arasındaki fark nedir?",
      answer:
        "Influencer, hazırladığı içeriği kendi sosyal medya hesabında takipçileriyle paylaşır. UGC içerik üreticisi ise videoyu kendi hesabında paylaşmak zorunda olmadan doğrudan markanın kendi reklamlarında ve sayfasında kullanması için üretir.",
    },
  ],
  en: [
    {
      question: "What is InfluNex and how does it work?",
      answer:
        "InfluNex connects brands with verified influencers and UGC content creators. You can compare profiles and service packages, post a campaign brief for free, and collaborate securely.",
    },
    {
      question: "Is membership free? How does commission work?",
      answer:
        "Membership, profile creation, and campaign posting are 100% free. A 15% platform fee applies only when a collaboration is completed, leaving 85% to the creator.",
    },
    {
      question: "How are payments and deliverables protected?",
      answer:
        "Every order locks the agreed deliverables, timeline, and price upfront so both brands and creators collaborate with full peace of mind.",
    },
    {
      question: "What is the difference between a UGC creator and an influencer?",
      answer:
        "Influencers publish content on their own social media accounts. UGC creators produce videos for the brand to use on the brand's own channels and ads.",
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

      {/* 1. CLEAN, WELCOMING HERO */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-indigo-50/50 via-white to-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-indigo-900">
                  <Sparkles size={14} className="text-indigo-600" />
                  <span>
                    {locale === "tr"
                      ? "Ücretsiz Üyelik • Şeffaf Fiyatlar • %85 Üretici Kazancı"
                      : "Free Membership • Transparent Pricing • 85% Creator Payout"}
                  </span>
                </div>
                <BrandIntroOverlay locale={locale} />
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl sm:leading-[1.15]">
                {locale === "tr"
                  ? "İyi bir iş birliği, doğru buluşmayla başlar."
                  : t.hero.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                {locale === "tr"
                  ? "Markanız için yaratıcı videolar ve içerikler üretecek doğru isimlerle tanışın. İçerik üreticisiyseniz ücretsiz profilinizi açın, sevdiğiniz markalarla kolayca çalışın."
                  : t.hero.subtitle}
              </p>

              {/* 2 Clear Action Cards */}
              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link
                  href={exploreHref}
                  className="group flex flex-col justify-between rounded-2xl bg-indigo-600 p-5 text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-semibold">
                        <BriefcaseBusiness size={14} />
                        {locale === "tr" ? "Markalar İçin" : "For Brands"}
                      </span>
                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                    <h2 className="mt-3 text-lg font-bold">
                      {locale === "tr"
                        ? "Influencer & UGC Üreticisi Bul"
                        : "Find Influencers & Creators"}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-indigo-100">
                      {locale === "tr"
                        ? "Şehir, kategori ve bütçenize uygun içerik üreticilerini inceleyin."
                        : "Browse verified creators by city, category, and budget."}
                    </p>
                  </div>
                </Link>

                <Link
                  href={`${signupHref}?role=CREATOR`}
                  className="group flex flex-col justify-between rounded-2xl border-2 border-emerald-600 bg-emerald-600 p-5 text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold">
                        <Video size={14} />
                        {locale === "tr"
                          ? "İçerik Üreticileri İçin"
                          : "For Creators"}
                      </span>
                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                    <h2 className="mt-3 text-lg font-bold">
                      {locale === "tr"
                        ? "Ücretsiz Profilini Oluştur"
                        : "Create Your Free Profile"}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-50">
                      {locale === "tr"
                        ? "Hizmet paketlerini ekle, tamamlanan işlerden %85 kazanç elde et."
                        : "Add your service packages and keep 85% of every collaboration."}
                    </p>
                  </div>
                </Link>
              </div>

              {/* Simple Trust Points */}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  Aylık Abonelik Ücreti Yok
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  Güvenli Ödeme ve Net İş Tanımı
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-indigo-600" />
                  Resmî #reklam Mevzuatına Uygun
                </span>
              </div>
            </div>

            {/* Right Column: Simple Platform Selection + Featured Creator */}
            <div className="space-y-4 lg:col-span-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">
                  Hangi Kanalda İçerik Arıyorsunuz?
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  İhtiyacınız olan platformu seçerek profilleri hemen listeleyin:
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {Object.entries(PLATFORM_LABELS).map(([key, info]) => (
                    <Link
                      key={key}
                      href={
                        info.slug === "ugc"
                          ? ugcHref
                          : categoryPath(locale, info.slug)
                      }
                      className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-indigo-500 hover:bg-indigo-50/40"
                    >
                      <strong className="block text-base font-bold text-slate-900 group-hover:text-indigo-700">
                        {locale === "tr" ? info.nameTr : info.nameEn}
                      </strong>
                      <span className="mt-1 block text-xs text-slate-500 group-hover:text-indigo-600">
                        Profilleri Gör →
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Featured Creator Spotlight: Gül Koç */}
                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                  <div className="flex items-center gap-3">
                    <img
                      src="/creators/guldkoc.jpg"
                      alt="Gül Koç (@guldkoc)"
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-xl object-cover ring-2 ring-emerald-500"
                    />
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800">
                        👑 Öne Çıkan Üretici • Adana
                      </span>
                      <p className="text-sm font-bold text-slate-900">
                        Gül Koç{" "}
                        <span className="text-xs font-normal text-slate-500">
                          (@guldkoc)
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Güzellik, Moda & UGC • 10,4 B Takipçi
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/${locale}/influencer/guldkoc`}
                    className="shrink-0 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                  >
                    Profili Gör
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CREATOR PROFILES + SIMPLE SEARCH */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Öne Çıkan İçerik Üreticileri
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Profilleri, takipçi etkileşimlerini ve başlangıç fiyatlarını
              karşılaştırın.
            </p>
          </div>
          <Link
            href={exploreHref}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:border-indigo-400"
          >
            Tüm Profilleri Gör ({totalCreatorsCount.toLocaleString("tr-TR")}) →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} locale={locale} />
          ))}
        </div>

        <div className="mt-10">
          <AiNaturalLanguageSearchBox locale={locale} />
        </div>
      </section>

      {/* 3. WHY CREATORS & BRANDS LOVE INFLUNEX (4 SIMPLE HUMAN CARDS) */}
      <section className="border-t border-slate-200 bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">
              {locale === "tr"
                ? "Neden InfluNex ile Çalışmalısınız?"
                : "Why Collaborate on InfluNex?"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {locale === "tr"
                ? "Karışık DM mesajlaşmaları ve belirsiz fiyatlar yerine her iki tarafı da koruyan sade ve anlaşılır bir süreç."
                : "A simple, transparent workflow that protects both creators and brands."}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <TrendingUp size={20} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Kazancın %85&apos;i Üreticide Kalır
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Üyelik, profil açma veya başvuru için hiçbir sabit ücret
                ödemezsiniz. Yalnızca tamamlanan işlerde %15 hizmet komisyonu
                uygulanır.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <Lock size={20} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Ödeme Güvencesi
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Marka ödemeyi yapmadan çekim başlamaz. İçerik teslim edilip
                onaylandığında ödeme sorunsuz şekilde üreticiye aktarılır.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Net İş ve Telif Şartları
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Videonun süresi, teslim günü, revizyon sayısı ve nerede
                kullanılacağı işin başında netleşir; sonradan sürpriz istekler
                çıkmaz.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Globe size={20} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Markaların Sizi Kolayca Bulması
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Kendi şehir ve uzmanlık alanınızdaki kişisel vitrin sayfanızla
                markalar sizi kolayca keşfeder ve doğrudan teklif gönderir.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* 4. SIMPLE RATES & CREATOR EARNINGS CALCULATOR */}
      <PlatformStatisticsSection
        locale={locale}
        approvedCreatorCount={totalCreatorsCount}
        openCampaignCount={openCampaigns.length}
      />

      {/* 5. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section className="border-b border-slate-200 bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="text-2xl font-bold text-slate-900">
                {locale === "tr" ? "3 Adımda Nasıl Çalışır?" : "How It Works in 3 Steps"}
              </h2>
              <ol className="mt-6 space-y-4 text-sm text-slate-600">
                <li className="flex gap-3.5 rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    1
                  </span>
                  <div>
                    <strong className="block text-slate-900">
                      {locale === "tr"
                        ? "Uygun Profili Seçin veya İlan Açın"
                        : "Choose a Creator or Post a Brief"}
                    </strong>
                    {locale === "tr"
                      ? "İçerik üreticilerinin paketlerini inceleyin ya da ihtiyacınızı anlatan ücretsiz bir kampanya ilanı oluşturun."
                      : "Browse creator packages or post a free campaign brief."}
                  </div>
                </li>
                <li className="flex gap-3.5 rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    2
                  </span>
                  <div>
                    <strong className="block text-slate-900">
                      {locale === "tr"
                        ? "Detaylarda Anlaşın ve İş Birliğini Başlatın"
                        : "Agree on Details & Start the Order"}
                    </strong>
                    {locale === "tr"
                      ? "Teslim süresi, içerik detayı ve ücret netleşir. Ödeme güvenceye alındığında üretici çekime başlar."
                      : "Timeline, deliverables, and price are agreed upfront before production starts."}
                  </div>
                </li>
                <li className="flex gap-3.5 rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    3
                  </span>
                  <div>
                    <strong className="block text-slate-900">
                      {locale === "tr"
                        ? "İçerik Onaylansın, Ödeme Aktarılsın"
                        : "Approve Content & Complete Payout"}
                    </strong>
                    {locale === "tr"
                      ? "Hazırlanan içerik onaylanıp paylaşıldığında %85 kazanç içerik üreticisine ödenir."
                      : "Once content is approved and published, the 85% payout is released to the creator."}
                  </div>
                </li>
              </ol>
              <div className="mt-4">
                <Link
                  href={howItWorksHref}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  {locale === "tr"
                    ? "Detaylı bilgi için Nasıl Çalışır sayfasını inceleyin →"
                    : "Learn more on our How It Works page →"}
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <CommissionCalculatorWidget locale={locale} />
            </div>
          </div>
        </div>
      </section>

      {/* 6. OPEN CAMPAIGNS */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Açık Reklam Kampanyaları
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Markaların güncel iş birliği ilanlarını inceleyin ve ücretsiz
              başvurun.
            </p>
          </div>
          <Link
            href={campaignsHref}
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            Tüm Kampanyaları Gör →
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
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-indigo-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="rounded-md bg-indigo-50 px-2.5 py-1 font-bold text-indigo-900">
                      {cmp.brandName}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 font-bold text-slate-900">
                      Bütçe: {formatMinorUnits(cmp.budgetMinorUnits)}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-slate-900">
                    {cmp.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">
                    {cmp.description}
                  </p>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Üreticiye Ödenecek (%85):</span>
                    <strong className="text-emerald-700">
                      {formatMinorUnits(breakdown.creatorNetPayoutMinorUnits)}
                    </strong>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-slate-500">
                      Son Teslim: {cmp.deliveryDeadline}
                    </span>
                    <Link
                      href={campaignsHref}
                      className="font-bold text-indigo-600 hover:underline"
                    >
                      İlanı İncele →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 7. CATEGORIES, CITIES & SERVICES */}
      <section className="border-t border-slate-200 bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-slate-900">
            Kategori, Şehir ve İçerik Türüne Göre Keşfedin
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Popüler Kategoriler
              </h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {INITIAL_CATEGORIES.slice(0, 12).map((cat) => (
                  <Link
                    key={cat.id}
                    href={categoryPath(
                      locale,
                      locale === "tr" ? cat.slugTr : cat.slugEn
                    )}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-medium text-slate-800 hover:border-indigo-400 hover:text-indigo-600"
                  >
                    {locale === "tr" ? cat.nameTr : cat.nameEn}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Türkiye 81 İl
                </h3>
                <Link
                  href={`${exploreHref}/turkiye`}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Tüm 81 İli Gör →
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {FEATURED_CITIES.map((city) => (
                  <Link
                    key={city.id}
                    href={categoryPath(locale, city.slug)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-medium text-slate-800 hover:border-indigo-400 hover:text-indigo-600"
                  >
                    {city.nameTr}
                  </Link>
                ))}
                <Link
                  href={`${exploreHref}/turkiye`}
                  className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 font-bold text-indigo-800 hover:bg-indigo-100"
                >
                  + Tüm 81 İl Rehberi ({INITIAL_CITIES.length} İl)
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                İçerik Türleri
              </h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {SERVICE_TEMPLATES.slice(0, 8).map((srv) => (
                  <Link
                    key={srv.slug}
                    href={servicePath(locale, srv.slug)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-medium text-slate-800 hover:border-indigo-400 hover:text-indigo-600"
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
        <h2 className="text-center text-2xl font-bold text-slate-900">
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
