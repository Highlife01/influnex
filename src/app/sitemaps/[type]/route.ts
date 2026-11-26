import { NextResponse } from "next/server";
import { EDITORIAL_BLOG_POSTS } from "@/lib/data/blogAndLegal";
import {
  INITIAL_CATEGORIES,
  INITIAL_CITIES,
  SERVICE_TEMPLATES,
} from "@/lib/data/catalog";
import { marketplaceStore } from "@/lib/data/marketplaceStore";
import { evaluateIndexQualityGate } from "@/lib/seo/qualityGate";
import { SITE_BASE_URL } from "@/lib/seo/routeRegistry";

interface SitemapUrlEntry {
  loc: string;
  lastmod: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: string;
}

function renderUrlSetXml(entries: SitemapUrlEntry[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      (e) =>
        `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
    ),
    "</urlset>",
  ].join("\n");
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ type: string }> }
) {
  const { type } = await context.params;
  const entries: SitemapUrlEntry[] = [];

  if (type === "profiles-1.xml") {
    const { items: approved } = marketplaceStore.searchCreators({ limit: 1000 });
    for (const c of approved) {
      if (c.status === "APPROVED" && c.qualityScore >= 70) {
        entries.push({
          loc: `${SITE_BASE_URL}/tr/influencer/${c.username}`,
          lastmod: c.updatedAt,
          changefreq: "weekly",
          priority: "0.8",
        });
        entries.push({
          loc: `${SITE_BASE_URL}/en/creators/${c.username}`,
          lastmod: c.updatedAt,
          changefreq: "weekly",
          priority: "0.7",
        });
      }
    }
  } else if (type === "categories.xml") {
    for (const cat of INITIAL_CATEGORIES) {
      const { items } = marketplaceStore.searchCreators({
        categorySlug: cat.slugTr,
      });
      const gate = evaluateIndexQualityGate({
        path: `/tr/influencer/${cat.slugTr}`,
        approvedCreatorCount: items.length,
        activeServiceCount: items.length,
        uniqueDescriptionText: `${cat.descriptionTr} ${cat.seoDescriptionTr}`,
      });
      if (gate.includeInSitemap) {
        entries.push({
          loc: `${SITE_BASE_URL}/tr/influencer/${cat.slugTr}`,
          lastmod: "2026-11-24T12:00:00.000Z",
          changefreq: "daily",
          priority: "0.8",
        });
      }
    }
  } else if (type === "cities.xml") {
    for (const city of INITIAL_CITIES) {
      const { items } = marketplaceStore.searchCreators({
        citySlug: city.slug,
      });
      const gate = evaluateIndexQualityGate({
        path: `/tr/influencer/${city.slug}`,
        approvedCreatorCount: items.length,
        activeServiceCount: items.length,
        uniqueDescriptionText: `${city.descriptionTr} ${city.descriptionEn}`,
      });
      if (gate.includeInSitemap) {
        entries.push({
          loc: `${SITE_BASE_URL}/tr/influencer/${city.slug}`,
          lastmod: "2026-11-24T12:00:00.000Z",
          changefreq: "daily",
          priority: "0.8",
        });
      }

      // City x Category programmatic combinations passing the Index Quality Gate (>= 3 approved creators)
      for (const cat of INITIAL_CATEGORIES) {
        const comboCreators = marketplaceStore.searchCreators({
          citySlug: city.slug,
          categorySlug: cat.slugTr,
        }).items;
        const comboGate = evaluateIndexQualityGate({
          path: `/tr/influencer/${city.slug}/${cat.slugTr}`,
          approvedCreatorCount: comboCreators.length,
          activeServiceCount: comboCreators.length,
          uniqueDescriptionText: `${city.nameTr} ${cat.nameTr} influencer ve UGC içerik üreticileri. ${city.descriptionTr}`,
        });
        if (comboGate.includeInSitemap) {
          entries.push({
            loc: `${SITE_BASE_URL}/tr/influencer/${city.slug}/${cat.slugTr}`,
            lastmod: "2026-11-24T12:00:00.000Z",
            changefreq: "daily",
            priority: "0.8",
          });
        }
      }
    }
  } else if (type === "services.xml") {
    for (const srv of SERVICE_TEMPLATES) {
      const activeServices = marketplaceStore.getServicesByTypeSlug(srv.slug);
      if (activeServices.length > 0) {
        entries.push({
          loc: `${SITE_BASE_URL}/tr/hizmetler/${srv.slug}`,
          lastmod: "2026-11-24T12:00:00.000Z",
          changefreq: "weekly",
          priority: "0.7",
        });
      }
    }
  } else if (type === "blog.xml") {
    for (const post of EDITORIAL_BLOG_POSTS) {
      if (post.status === "PUBLISHED" && post.indexable) {
        entries.push({
          loc: `${SITE_BASE_URL}/tr/blog/${post.slug}`,
          lastmod: post.updatedAt,
          changefreq: "monthly",
          priority: "0.7",
        });
      }
    }
  } else if (type === "pages.xml") {
    const corePaths = [
      { path: "/tr", priority: "1.0" },
      { path: "/en", priority: "0.9" },
      { path: "/tr/influencer", priority: "0.9" },
      { path: "/en/creators", priority: "0.9" },
      { path: "/tr/ugc", priority: "0.8" },
      { path: "/en/ugc-creators", priority: "0.8" },
      { path: "/tr/kampanyalar", priority: "0.8" },
      { path: "/en/campaigns", priority: "0.8" },
      { path: "/tr/nasil-calisir", priority: "0.8" },
      { path: "/en/how-it-works", priority: "0.8" },
      { path: "/tr/influencer-reklam-fiyatlari", priority: "0.8" },
      { path: "/tr/blog", priority: "0.7" },
    ];
    for (const p of corePaths) {
      entries.push({
        loc: `${SITE_BASE_URL}${p.path}`,
        lastmod: "2026-11-25T00:00:00.000Z",
        changefreq: "daily",
        priority: p.priority,
      });
    }
  } else {
    return new NextResponse("Not Found", { status: 404 });
  }

  return new NextResponse(renderUrlSetXml(entries), {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
