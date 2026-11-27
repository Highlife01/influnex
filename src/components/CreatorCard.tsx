import Link from "next/link";
import type { PublicCreatorProfile, SupportedLocale } from "@/lib/types/domain";
import { formatMinorUnits } from "@/lib/finance/commission";

const PLATFORM_NAMES: Record<string, string> = {
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
  UGC: "UGC Video",
};

export function CreatorCard({
  creator,
  locale = "tr",
}: {
  creator: PublicCreatorProfile;
  locale?: SupportedLocale;
}) {
  const profileHref =
    locale === "tr"
      ? `/tr/influencer/${creator.username}`
      : `/en/creators/${creator.username}`;

  return (
    <article
      className={`group flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-2xs transition hover:border-indigo-400 hover:shadow-md ${
        creator.isInfluencerLeader
          ? "border-emerald-500 ring-1 ring-emerald-500/20"
          : "border-slate-200"
      }`}
    >
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          {creator.isInfluencerLeader ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-3 py-0.5 text-xs font-bold text-white">
              👑{" "}
              {locale === "tr"
                ? creator.leaderTitleTr || "Öne Çıkan Üretici"
                : creator.leaderTitleEn || "Featured Creator"}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              ✓ {locale === "tr" ? "Onaylı Profil" : "Verified"}
            </span>
          )}
          <span className="text-xs font-medium text-slate-500">
            {creator.cityNameTr}
          </span>
        </div>

        <div className="flex items-start gap-3.5">
          <img
            src={creator.avatarUrl}
            alt={creator.displayName}
            width={60}
            height={60}
            loading="lazy"
            className="h-15 w-15 rounded-2xl object-cover ring-1 ring-slate-200"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-indigo-600">
              <Link
                href={profileHref}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                {creator.displayName}
              </Link>
            </h3>
            <p className="text-xs text-slate-500">@{creator.username}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
              {locale === "tr" ? creator.headlineTr : creator.headlineEn}
            </p>
          </div>
        </div>

        {/* Clean Platform Tags */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          {creator.platforms.map((p) => (
            <span
              key={p}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
            >
              {PLATFORM_NAMES[p] || p}
            </span>
          ))}
        </div>

        {/* 3 Clear Numbers */}
        <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
          <div>
            <dt className="text-[11px] text-slate-500">
              {locale === "tr" ? "Takipçi" : "Followers"}
            </dt>
            <dd className="mt-0.5 text-sm font-bold text-slate-900">
              {Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
                notation: "compact",
              }).format(creator.totalFollowers)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-slate-500">
              {locale === "tr" ? "Etkileşim" : "Engagement"}
            </dt>
            <dd className="mt-0.5 text-sm font-bold text-emerald-700">
              %{creator.averageEngagementRate}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-slate-500">
              {locale === "tr" ? "Teslim" : "Delivery"}
            </dt>
            <dd className="mt-0.5 text-sm font-bold text-slate-900">
              {creator.averageDeliveryDays} {locale === "tr" ? "Gün" : "Days"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
        <div>
          <span className="block text-[11px] text-slate-500">
            {locale === "tr" ? "Başlangıç Fiyatı" : "Starting at"}
          </span>
          <span className="text-base font-extrabold text-slate-900">
            {formatMinorUnits(creator.startingPriceMinorUnits, "TRY", locale)}
          </span>
        </div>

        <Link
          href={profileHref}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
        >
          {locale === "tr" ? "Profili İncele" : "View Profile"}
        </Link>
      </div>
    </article>
  );
}
