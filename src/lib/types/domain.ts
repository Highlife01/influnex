/**
 * INFLUNEX CORE DOMAIN TYPES
 * Strict TypeScript domain definitions covering Users, Creators, Advertisers,
 * Social Accounts, Categories, Cities, Services, Campaigns, Proposals,
 * 15-State Order Machine, Basis-Point Commission Accounting, and SEO/GEO.
 */

export type SupportedLocale = "tr" | "en";
export type FutureLocale = "tr" | "en" | "de" | "ar" | "fr" | "es";

export type UserRole = "ADVERTISER" | "CREATOR" | "ADMIN";

export type SupportedPlatform = "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "UGC";
export type FuturePlatform =
  | SupportedPlatform
  | "FACEBOOK"
  | "LINKEDIN"
  | "TWITCH"
  | "X"
  | "SNAPCHAT";

export type MetricVerificationSource =
  | "API_VERIFIED"
  | "ADMIN_VERIFIED"
  | "USER_DECLARED";

export type ProfileApprovalStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "SUSPENDED";

export type CurrencyCode = "TRY" | "USD" | "EUR";

export interface VerificationBadges {
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  socialVerified: boolean;
}

export interface SocialAccountRecord {
  id: string;
  tenantId: "influnex";
  creatorId: string;
  platform: SupportedPlatform;
  handle: string;
  profileUrl: string;
  followersCount: number;
  engagementRatePercent: number;
  averageViewsCount: number;
  verificationSource: MetricVerificationSource;
  verifiedAt?: string;
  updatedAt: string;
}

export interface CreatorPortfolioItem {
  id: string;
  title: string;
  platform: SupportedPlatform;
  format: "VIDEO" | "IMAGE" | "SHORT" | "REEL";
  thumbnailUrl: string;
  contentUrl?: string;
  brandCategorySlug: string;
  durationSeconds?: number;
}

export interface CreatorServiceRecord {
  id: string;
  tenantId: "influnex";
  creatorId: string;
  creatorUsername: string;
  titleTr: string;
  titleEn: string;
  serviceTypeSlug: string;
  platform: SupportedPlatform;
  descriptionTr: string;
  descriptionEn: string;
  /** Integer minor units (kuruş): e.g., 5000 TL = 500000 */
  priceMinorUnits: number;
  currency: CurrencyCode;
  deliveryDays: number;
  revisionCount: number;
  videoDurationSeconds?: number;
  postRetentionDays: number;
  usageRightsTr: string;
  usageRightsEn: string;
  paidAdsReuseAllowed: boolean;
  usageDurationDays: number;
  exclusivityTermsTr: string;
  isUgcService: boolean;
  isActive: boolean;
  updatedAt: string;
}

export interface PublicCreatorProfile {
  id: string;
  tenantId: "influnex";
  username: string;
  previousUsernames: string[];
  displayName: string;
  headlineTr: string;
  headlineEn: string;
  bioTr: string;
  bioEn: string;
  avatarUrl: string;
  coverUrl: string;
  countryCode: string;
  citySlug: string;
  cityNameTr: string;
  spokenLanguages: string[];
  categorySlugs: string[];
  platforms: SupportedPlatform[];
  primaryPlatform: SupportedPlatform;
  totalFollowers: number;
  averageEngagementRate: number;
  averageViews: number;
  metricVerificationSource: MetricVerificationSource;
  audienceSummaryTr: string;
  audienceSummaryEn: string;
  startingPriceMinorUnits: number;
  currency: CurrencyCode;
  averageDeliveryDays: number;
  completedOrdersCount: number;
  verifiedReviewCount: number;
  averageRating: number | null;
  offersUgc: boolean;
  verificationBadges: VerificationBadges;
  status: ProfileApprovalStatus;
  qualityScore: number;
  portfolio: CreatorPortfolioItem[];
  updatedAt: string;
}

export interface PrivateCreatorProfile {
  creatorId: string;
  tenantId: "influnex";
  legalFullName: string;
  birthYear: number;
  isAdultConfirmed: boolean;
  nationalIdMasked: string;
  phone: string;
  privateEmail: string;
  iban: string;
  bankName: string;
  bankAccountHolder: string;
  taxStatus: "INDIVIDUAL_WITHHOLDING" | "COMPANY_INVOICE";
  taxOffice?: string;
  taxNumber?: string;
  updatedAt: string;
}

export interface CategoryRecord {
  id: string;
  tenantId: "influnex";
  slugTr: string;
  slugEn: string;
  nameTr: string;
  nameEn: string;
  descriptionTr: string;
  descriptionEn: string;
  seoTitleTr: string;
  seoTitleEn: string;
  seoDescriptionTr: string;
  seoDescriptionEn: string;
  iconName: string;
  isActive: boolean;
}

export interface CityRecord {
  id: string;
  tenantId: "influnex";
  plateCode: number;
  slug: string;
  nameTr: string;
  nameEn: string;
  countryCode: "TR";
  regionTr: string;
  descriptionTr: string;
  descriptionEn: string;
}

export interface CampaignRecord {
  id: string;
  tenantId: "influnex";
  advertiserId: string;
  title: string;
  brandName: string;
  brandWebsite?: string;
  description: string;
  productOrService: string;
  targetCountryCode: string;
  targetCitySlug?: string;
  targetAudience: string;
  requestedPlatforms: SupportedPlatform[];
  requestedContentType: string;
  categorySlug: string;
  /** Integer minor units (kuruş) */
  budgetMinorUnits: number;
  currency: CurrencyCode;
  minFollowers: number;
  maxFollowers?: number;
  deliveryDeadline: string;
  applicationDeadline: string;
  requiresProductSampleShipping: boolean;
  usageRights: string;
  brandRules: string;
  status: "OPEN" | "IN_REVIEW" | "CLOSED";
  proposalsCount: number;
  firmanexCompanyId?: string;
  createdAt: string;
}

export interface ProposalRecord {
  id: string;
  tenantId: "influnex";
  campaignId: string;
  advertiserId: string;
  creatorId: string;
  creatorUsername: string;
  creatorDisplayName: string;
  priceMinorUnits: number;
  currency: CurrencyCode;
  deliveryDays: number;
  pitchMessage: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

export const ORDER_STATUSES = [
  "PAYMENT_PENDING",
  "PAYMENT_REVIEW",
  "PAID",
  "IN_PROGRESS",
  "CONTENT_SUBMITTED",
  "REVISION_REQUESTED",
  "CONTENT_APPROVED",
  "PUBLISHED",
  "COMPLETED",
  "PAYOUT_PENDING",
  "PAYOUT_COMPLETED",
  "CANCELLED",
  "DISPUTED",
  "REFUND_PENDING",
  "REFUNDED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderSnapshot {
  serviceId: string;
  serviceTitle: string;
  platform: SupportedPlatform;
  grossAmountMinorUnits: number;
  commissionBps: 1500;
  creatorPayoutBps: 8500;
  platformCommissionMinorUnits: number;
  creatorNetPayoutMinorUnits: number;
  currency: CurrencyCode;
  deliveryDays: number;
  maxRevisions: number;
  usageRights: string;
  paidAdsReuseAllowed: boolean;
  requiresSponsorDisclosure: boolean;
  acceptedTermsVersion: string;
  capturedAt: string;
}

export interface OrderRecord {
  id: string;
  orderCode: string;
  tenantId: "influnex";
  sourceType: "DIRECT_SERVICE" | "CAMPAIGN_PROPOSAL";
  campaignId?: string;
  proposalId?: string;
  advertiserId: string;
  advertiserBrandName: string;
  creatorId: string;
  creatorUsername: string;
  status: OrderStatus;
  snapshot: OrderSnapshot;
  revisionsUsed: number;
  submittedContentUrl?: string;
  submittedContentNotes?: string;
  publishedPostUrl?: string;
  sponsorDisclosureTagVerified: boolean;
  receiptFilePath?: string;
  bankTransactionRef?: string;
  payoutTransactionRef?: string;
  disputeReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderEventRecord {
  id: string;
  tenantId: "influnex";
  orderId: string;
  orderCode: string;
  advertiserId: string;
  creatorId: string;
  actorId: string;
  actorRole: UserRole | "SYSTEM";
  previousStatus: OrderStatus | null;
  newStatus: OrderStatus;
  reason: string;
  referenceFileUrl?: string;
  bankReferenceId?: string;
  createdAt: string;
}

export interface FinancialLedgerEntry {
  id: string;
  tenantId: "influnex";
  orderId: string;
  orderCode: string;
  entryType:
    | "PAYMENT_COLLECTED"
    | "COMMISSION_RECOGNIZED"
    | "CREATOR_PAYOUT_ACCRUED"
    | "CREATOR_PAYOUT_SETTLED"
    | "REFUND_ISSUED"
    | "REVERSAL_ADJUSTMENT";
  amountMinorUnits: number;
  currency: CurrencyCode;
  direction: "CREDIT" | "DEBIT";
  bankReferenceId?: string;
  idempotencyKey: string;
  notes: string;
  createdBy: string;
  createdAt: string;
}
