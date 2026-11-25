import { NextResponse } from "next/server";
import { SITE_BASE_URL } from "@/lib/seo/routeRegistry";

const SUB_SITEMAPS = [
  { file: "profiles-1.xml", lastmod: "2026-11-24T12:00:00.000Z" },
  { file: "categories.xml", lastmod: "2026-11-24T12:00:00.000Z" },
  { file: "cities.xml", lastmod: "2026-11-24T12:00:00.000Z" },
  { file: "services.xml", lastmod: "2026-11-24T12:00:00.000Z" },
  { file: "blog.xml", lastmod: "2026-11-24T10:00:00.000Z" },
  { file: "pages.xml", lastmod: "2026-11-25T00:00:00.000Z" },
] as const;

export async function GET() {
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...SUB_SITEMAPS.map(
      (s) =>
        `  <sitemap>\n    <loc>${SITE_BASE_URL}/sitemaps/${s.file}</loc>\n    <lastmod>${s.lastmod}</lastmod>\n  </sitemap>`
    ),
    "</sitemapindex>",
  ].join("\n");

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
