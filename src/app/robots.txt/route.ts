import { NextResponse } from "next/server";
import { SITE_BASE_URL } from "@/lib/seo/routeRegistry";

export async function GET(request: Request) {
  const hostname = request.headers
    .get("host")
    ?.split(":")[0]
    ?.toLowerCase();
  const canonicalHostname = new URL(SITE_BASE_URL).hostname.toLowerCase();
  if (hostname && hostname !== canonicalHostname) {
    return new NextResponse("User-agent: *\nDisallow: /\n", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

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
    "Disallow: /tr/kayit",
    "Disallow: /en/kayit",
    "Disallow: /tr/reklamveren/",
    "Disallow: /en/reklamveren/",
    "Disallow: /tr/yayinci/",
    "Disallow: /en/yayinci/",
    "Disallow: /tr/yonetim",
    "Disallow: /en/yonetim",
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
