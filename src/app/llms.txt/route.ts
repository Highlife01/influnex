import { NextResponse } from "next/server";
import { SITE_BASE_URL } from "@/lib/seo/routeRegistry";

export async function GET() {
  const content = `# InfluNex — Global Influencer & UGC Creator Marketplace

> Slogan (TR): İş birliği yap. Birlikte kazan.
> Slogan (EN): Connect. Collaborate. Earn.

InfluNex is a digital marketplace connecting brands and advertisers with verified Instagram, TikTok, YouTube influencers and UGC content creators.

## Business & Commission Model
- Advertiser Membership: 100% Free
- Creator Membership & Listing: 100% Free
- Campaign Publishing & Proposal Submission: 100% Free
- Platform Commission: 15% (1500 BPS) charged only on completed collaborations
- Creator Net Payout: 85% (8500 BPS) before applicable statutory taxes
- No subscriptions, no premium tiers, no tokens, no paid ranking boosts.

## Metric Verification Methodology
Every creator profile explicitly attributes follower and engagement statistics to one of three sources:
1. API_VERIFIED: Verified directly via official platform OAuth/API.
2. ADMIN_VERIFIED: Verified by InfluNex moderation team via live screen/analytics evidence.
3. USER_DECLARED: Self-declared by the creator (never presented as verified data).

## Key Public URLs
- Turkish Home: ${SITE_BASE_URL}/tr
- English Home: ${SITE_BASE_URL}/en
- Explore Influencers (TR): ${SITE_BASE_URL}/tr/influencer
- Explore Creators (EN): ${SITE_BASE_URL}/en/creators
- UGC Content Creators: ${SITE_BASE_URL}/tr/ugc
- Open Campaigns: ${SITE_BASE_URL}/tr/kampanyalar
- Transparent Pricing & 15% Commission Calculator: ${SITE_BASE_URL}/tr/influencer-reklam-fiyatlari
- Editorial Blog & Guides: ${SITE_BASE_URL}/tr/blog
- Sitemap Index: ${SITE_BASE_URL}/sitemap.xml
- OpenAPI 3.1 Specification: ${SITE_BASE_URL}/api/v1/openapi
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
