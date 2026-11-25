// Preserved metadata prototype; robots.txt/route.ts owns the public URL.
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/yonetim/", "/siparisler/", "/mesajlar/"],
      },
    ],
    sitemap: "https://influnex.com/sitemap.xml",
  };
}
