import { NextResponse } from "next/server";
import { SITE_BASE_URL } from "@/lib/seo/routeRegistry";

export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "InfluNex Global Influencer & UGC Marketplace API",
      version: "1.0.0",
      description:
        "API-first REST interface for InfluNex (15% commission on completed orders, 85% creator payout, zero subscriptions). Ready for future CLI, MCP, and Firmanex integrations.",
    },
    servers: [{ url: `${SITE_BASE_URL}/api/v1` }],
    paths: {
      "/creators": {
        get: {
          operationId: "search_creators",
          summary: "Search and filter approved influencer & UGC profiles",
        },
      },
      "/creators/{id}": {
        get: {
          operationId: "get_creator_profile",
          summary: "Get creator public profile and active services by username",
        },
      },
      "/categories": {
        get: {
          operationId: "list_categories",
          summary: "List all 25 creator categories with TR/EN SEO metadata",
        },
      },
      "/campaigns": {
        get: {
          operationId: "list_campaigns",
          summary: "List open advertising campaigns",
        },
        post: {
          operationId: "create_campaign",
          summary: "Publish a new advertiser campaign",
        },
      },
      "/campaigns/ai-draft": {
        post: {
          operationId: "create_campaign_draft",
          summary: "SSRF-protected AI campaign brief generator",
        },
      },
      "/proposals": {
        post: {
          operationId: "submit_proposal",
          summary: "Submit a creator proposal to an open campaign",
        },
      },
      "/orders": {
        post: {
          operationId: "create_order",
          summary:
            "Create an order with immutable 15% commission / 85% payout snapshot",
        },
      },
      "/orders/{id}": {
        get: {
          operationId: "get_order_status",
          summary: "Inspect order status and state machine audit trail",
        },
        post: {
          operationId: "transition_order_state",
          summary: "Execute authorized backend order state transition",
        },
      },
      "/recommendations": {
        post: {
          operationId: "recommend_creators",
          summary:
            "Natural language creator recommendation grounded strictly in real platform profiles",
        },
      },
    },
  };

  return NextResponse.json(spec);
}
