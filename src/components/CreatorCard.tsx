import Link from "next/link";
import type { PublicCreatorProfile, SupportedLocale } from "@/lib/types/domain";
import { formatMinorUnits } from "@/lib/finance/commission";
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

  const sourceBadgeStyle =
    creator.metricVerificationSource === "API_VERIFIED"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : creator.metricVerificationSource === "ADMIN_VERIFIED"
        ? "bg-indigo-50 text-indigo-800 border-indigo-200"
        : "bg-amber-50 text-amber-800 border-amber-200";

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-indigo-300 hover:shadow-md">
      <div>
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
                <Link href={profileHref}>{creator.displayName}</Link>
              </h3>
              {creator.verificationBadges.identityVerified ? (
                <span
                  title={
                    locale === "tr"
                      ? "Kimliği Doğrulanmış Üretici"
                      : "Identity Verified Creator"
                  }
                  className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-800"
                >
                  Kimlik Onaylı
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

        {/* Strict Metric Source Attribution Badge (Section 8) */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${sourceBadgeStyle}`}
          >
            {t.metricSource[creator.metricVerificationSource]}
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
              {locale === "tr" ? "Takipçi" : "Followers"}
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
              {locale === "tr" ? "Tamamlanan" : "Orders"}
            </dt>
            <dd className="text-sm font-bold text-slate-900">
              {creator.completedOrdersCount}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
        <div>
          <span className="block text-[11px] text-slate-500">
            {locale === "tr" ? "Başlangıç Hizmet Fiyatı" : "Starting at"}
          </span>
          <span className="text-base font-extrabold text-slate-900">
            {formatMinorUnits(creator.startingPriceMinorUnits, "TRY", locale)}
          </span>
        </div>

        <Link
          href={profileHref}
          className="rounded-xl bg-indigo-950 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          {locale === "tr" ? "Profili & Hizmetleri Gör" : "View Profile"}
        </Link>
      </div>
    </article>
  );
}
