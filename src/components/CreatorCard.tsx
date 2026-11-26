import Link from "next/link";
import type { PublicCreatorProfile, SupportedLocale } from "@/lib/types/domain";
import {
  calculateCommissionBreakdown,
  formatMinorUnits,
} from "@/lib/finance/commission";
import { DICTIONARY } from "@/lib/i18n/dictionary";

export function CreatorCard({
  creator,
  locale = "tr",
}: {
  creator: PublicCreatorProfile;
  locale?: SupportedLocale;
}) {
  const t = DICTIONARY[locale];
  const profileHref =
    locale === "tr"
      ? `/tr/influencer/${creator.username}`
      : `/en/creators/${creator.username}`;

  const breakdown = calculateCommissionBreakdown(
    creator.startingPriceMinorUnits,
    creator.currency
  );

  const sourceBadgeStyle =
    creator.metricVerificationSource === "API_VERIFIED"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : creator.metricVerificationSource === "ADMIN_VERIFIED"
        ? "bg-indigo-50 text-indigo-800 border-indigo-200"
        : "bg-amber-50 text-amber-800 border-amber-200";

  return (
    <article
      className={`group flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-xs transition-[border-color,box-shadow] hover:border-indigo-300 hover:shadow-md ${
        creator.isInfluencerLeader
          ? "border-emerald-400 ring-2 ring-emerald-500/20"
          : "border-slate-200"
      }`}
    >
      <div>
        {/* Explicit Demo / Showcase Transparency Banner (Audit P0 Item 3) */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {creator.isInfluencerLeader ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-gradient-to-r from-emerald-600 to-teal-700 px-2.5 py-0.5 text-[11px] font-extrabold text-white shadow-2xs">
                👑 {locale === "tr" ? creator.leaderTitleTr || "Influencer Lideri" : creator.leaderTitleEn || "Influencer Leader"}
              </span>
            ) : null}
            <span className="inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
              {locale === "tr"
                ? "Örnek Vitrin Profili (Demo Veri)"
                : "Sample Showcase Profile (Demo Data)"}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Güncelleme: {creator.updatedAt.slice(0, 10)}
          </span>
        </div>

        <div className="flex items-start gap-4">
          <img
            src={creator.avatarUrl}
            alt={creator.displayName}
            width={64}
            height={64}
            loading="lazy"
            className="h-16 w-16 rounded-2xl object-cover ring-2 ring-slate-100"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-indigo-600">
                <Link
                  href={profileHref}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                >
                  {creator.displayName}
                </Link>
              </h3>
              {/* Never show "Kimlik Onaylı" if metrics are USER_DECLARED to avoid misleading trust signals */}
              {creator.verificationBadges.identityVerified &&
              creator.metricVerificationSource !== "USER_DECLARED" ? (
                <span
                  title={
                    locale === "tr"
                      ? "Kimliği Doğrulanmış Üretici (Örnek)"
                      : "Identity Verified Creator (Sample)"
                  }
                  className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-800"
                >
                  Kimlik Doğrulamalı
                </span>
              ) : null}
            </div>
            <p className="text-xs text-slate-500">
              @{creator.username} • {creator.cityNameTr}
            </p>
            <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-700">
              {locale === "tr" ? creator.headlineTr : creator.headlineEn}
            </p>
          </div>
        </div>

        {/* Strict Metric Source Attribution Badge (Section 8 & Audit P1) */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${sourceBadgeStyle}`}
          >
            Metrik Kaynağı: {t.metricSource[creator.metricVerificationSource]}
          </span>
          {creator.offersUgc ? (
            <span className="inline-flex items-center rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-800">
              UGC
            </span>
          ) : null}
          {creator.platforms.map((p) => (
            <span
              key={p}
              className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
            >
              {p}
            </span>
          ))}
        </div>

        {/* Follower & Engagement Metrics */}
        <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
          <div>
            <dt className="text-[11px] text-slate-500">
              {locale === "tr" ? "Takipçi (Örnek)" : "Followers"}
            </dt>
            <dd className="text-sm font-bold text-slate-900">
              {Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
                notation: "compact",
              }).format(creator.totalFollowers)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-slate-500">
              {locale === "tr" ? "Etkileşim" : "Engagement"}
            </dt>
            <dd className="text-sm font-bold text-emerald-700">
              %{creator.averageEngagementRate}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-slate-500">
              {locale === "tr" ? "Ort. Teslim" : "Delivery"}
            </dt>
            <dd className="text-sm font-bold text-slate-900">
              {creator.averageDeliveryDays} Gün
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
        <div>
          <span className="block text-[11px] text-slate-500">
            {locale === "tr"
              ? "Toplam Hizmet Bedeli (Brüt Başlangıç)"
              : "Total Gross Service Price"}
          </span>
          <span className="text-base font-extrabold text-slate-900">
            {formatMinorUnits(creator.startingPriceMinorUnits, "TRY", locale)}
          </span>
          <span className="block text-[11px] text-emerald-700">
            Üretici Payı (%85):{" "}
            {formatMinorUnits(
              breakdown.creatorNetPayoutMinorUnits,
              "TRY",
              locale
            )}
          </span>
        </div>

        <Link
          href={profileHref}
          className="rounded-xl bg-indigo-950 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
        >
          {locale === "tr" ? "Profili & Paketleri Gör" : "View Profile"}
        </Link>
      </div>
    </article>
  );
}
