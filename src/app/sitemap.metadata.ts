// Preserved metadata prototype; sitemap.xml/route.ts owns the public URL.
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://influnex.com/tr",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          tr: "https://influnex.com/tr",
          en: "https://influnex.com/en",
        },
      },
    },
  ];
}
