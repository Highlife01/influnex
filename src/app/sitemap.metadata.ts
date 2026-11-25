// Preserved metadata prototype; sitemap.xml/route.ts owns the public URL.
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.influnex.com.tr/tr",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          tr: "https://www.influnex.com.tr/tr",
          en: "https://www.influnex.com.tr/en",
        },
      },
    },
  ];
}
