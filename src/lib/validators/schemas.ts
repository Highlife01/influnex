import { z } from "zod";
import { ORDER_STATUSES } from "../types/domain";

export const SupportedPlatformSchema = z.enum([
  "INSTAGRAM",
  "TIKTOK",
  "YOUTUBE",
  "UGC",
]);

export const UserRegistrationSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz.").max(160),
  displayName: z
    .string()
    .trim()
    .min(2, "Ad veya marka adı en az 2 karakter olmalıdır.")
    .max(100),
  role: z.enum(["ADVERTISER", "CREATOR"]),
  birthYear: z.number().int().min(1930).max(2026).optional(),
  acceptedTermsVersion: z.string().min(3),
}).superRefine((data, ctx) => {
  if (data.role === "CREATOR") {
    const currentYear = 2026;
    if (!data.birthYear || currentYear - data.birthYear < 18) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthYear"],
        message: "Influencer üyeliği için 18 yaş sınırı zorunludur.",
      });
    }
  }
});

export const CreatorServiceInputSchema = z.object({
  creatorId: z.string().min(3).max(128),
  creatorUsername: z.string().regex(/^[a-z0-9-]+$/).min(3).max(60),
  titleTr: z.string().trim().min(5).max(120),
  titleEn: z.string().trim().min(5).max(120),
  serviceTypeSlug: z.string().regex(/^[a-z0-9-]+$/),
  platform: SupportedPlatformSchema,
  descriptionTr: z.string().trim().min(20).max(1500),
  descriptionEn: z.string().trim().min(20).max(1500),
  /** Minimum 100 TL = 10000 kuruş */
  priceMinorUnits: z.number().int().min(10000).max(500_000_000),
  currency: z.enum(["TRY", "USD", "EUR"]).default("TRY"),
  deliveryDays: z.number().int().min(1).max(60),
  revisionCount: z.number().int().min(0).max(10),
  videoDurationSeconds: z.number().int().min(5).max(3600).optional(),
  postRetentionDays: z.number().int().min(0).max(3650),
  usageRightsTr: z.string().trim().min(5).max(400),
  usageRightsEn: z.string().trim().min(5).max(400),
  paidAdsReuseAllowed: z.boolean(),
  usageDurationDays: z.number().int().min(0).max(3650),
  exclusivityTermsTr: z.string().trim().min(2).max(400),
  isUgcService: z.boolean(),
});

export const CampaignCreateInputSchema = z.object({
  advertiserId: z.string().min(3).max(128),
  title: z.string().trim().min(8).max(140),
  brandName: z.string().trim().min(2).max(100),
  brandWebsite: z.string().url().optional(),
  description: z.string().trim().min(30).max(3000),
  productOrService: z.string().trim().min(3).max(200),
  targetCountryCode: z.string().length(2).default("TR"),
  targetCitySlug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  targetAudience: z.string().trim().min(5).max(400),
  requestedPlatforms: z.array(SupportedPlatformSchema).min(1),
  requestedContentType: z.string().trim().min(3).max(120),
  categorySlug: z.string().regex(/^[a-z0-9-]+$/),
  budgetMinorUnits: z.number().int().min(50000).max(500_000_000),
  currency: z.enum(["TRY"]).default("TRY"),
  minFollowers: z.number().int().min(0).max(50_000_000),
  maxFollowers: z.number().int().min(0).max(100_000_000).optional(),
  deliveryDeadline: z.string().min(8),
  applicationDeadline: z.string().min(8),
  requiresProductSampleShipping: z.boolean(),
  usageRights: z.string().trim().min(5).max(500),
  brandRules: z.string().trim().min(5).max(1000),
  firmanexCompanyId: z.string().max(120).optional(),
});

export const ProposalCreateInputSchema = z.object({
  campaignId: z.string().min(3).max(128),
  creatorId: z.string().min(3).max(128),
  creatorUsername: z.string().regex(/^[a-z0-9-]+$/),
  creatorDisplayName: z.string().trim().min(2).max(100),
  priceMinorUnits: z.number().int().min(10000).max(500_000_000),
  deliveryDays: z.number().int().min(1).max(60),
  pitchMessage: z.string().trim().min(20).max(1500),
});

export const OrderCreateInputSchema = z.object({
  sourceType: z.enum(["DIRECT_SERVICE", "CAMPAIGN_PROPOSAL"]),
  advertiserId: z.string().min(3).max(128),
  advertiserBrandName: z.string().trim().min(2).max(120),
  serviceId: z.string().min(3).max(128).optional(),
  proposalId: z.string().min(3).max(128).optional(),
  acceptedTermsVersion: z.string().min(3),
});

export const OrderStateTransitionInputSchema = z.object({
  orderId: z.string().min(3).max(128),
  actorId: z.string().min(3).max(128),
  actorRole: z.enum(["ADVERTISER", "CREATOR", "ADMIN"]),
  targetStatus: z.enum(ORDER_STATUSES),
  reason: z.string().trim().min(3).max(1000),
  receiptFilePath: z.string().max(400).optional(),
  bankTransactionRef: z.string().trim().min(4).max(120).optional(),
  paidAmountMinorUnits: z.number().int().positive().optional(),
  submittedContentUrl: z.string().url().optional(),
  publishedPostUrl: z.string().url().optional(),
  sponsorDisclosureConfirmed: z.boolean().optional(),
  idempotencyKey: z.string().min(6).max(160).optional(),
});

export const AiRecommendationQuerySchema = z.object({
  query: z.string().trim().min(8).max(500),
  locale: z.enum(["tr", "en"]).default("tr"),
  maxResults: z.number().int().min(1).max(12).default(6),
});

export const AiCampaignDraftInputSchema = z.object({
  brandName: z.string().trim().min(2).max(100),
  brandWebsite: z.string().url(),
  productDescription: z.string().trim().min(15).max(1500),
  budgetMinorUnits: z.number().int().min(50000).max(500_000_000),
  targetCitySlug: z.string().optional(),
  locale: z.enum(["tr", "en"]).default("tr"),
});
