import { NextResponse } from "next/server";
import { SITE_BASE_URL } from "@/lib/seo/routeRegistry";

export async function GET() {
  const allowAiSearchBots = process.env.ALLOW_AI_SEARCH_BOTS !== "false";
  const allowAiTrainingBots = process.env.ALLOW_AI_TRAINING_BOTS === "true";

  const protectedPaths = [
    "Disallow: /api/",
    "Disallow: /tr/admin",
    "Disallow: /en/admin",
    "Disallow: /tr/panel",
    "Disallow: /en/panel",
    "Disallow: /tr/giris",
    "Disallow: /en/giris",
  ];

  const lines: string[] = [
    "# InfluNex Dynamic Robots.txt — Search & Generative Engine Policy",
    "User-agent: *",
    "Allow: /",
    ...protectedPaths,
    "",
    "# Generative Search Engines (ChatGPT Search, Perplexity, Google AI, Bing Copilot)",
    "User-agent: OAI-SearchBot",
    "User-agent: ChatGPT-User",
    "User-agent: PerplexityBot",
    allowAiSearchBots ? "Allow: /" : "Disallow: /",
    ...protectedPaths,
    "",
    "# Foundation Model Training Crawlers (Configured Separately from Search Bots)",
    "User-agent: GPTBot",
    "User-agent: Google-Extended",
    "User-agent: CCBot",
    allowAiTrainingBots ? "Allow: /" : "Disallow: /",
    "",
    `Sitemap: ${SITE_BASE_URL}/sitemap.xml`,
  ];

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
