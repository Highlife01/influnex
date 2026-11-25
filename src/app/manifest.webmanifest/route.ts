import { NextResponse } from "next/server";

export async function GET() {
  const manifest = {
    name: "InfluNex — Influencer & UGC Pazaryeri",
    short_name: "InfluNex",
    description:
      "Markalar ve içerik üreticileri burada buluşuyor. Ücretsiz katılın, yalnızca tamamlanan iş birliklerinden %15 komisyon ödeyin.",
    start_url: "/tr",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e1b4b",
    lang: "tr-TR",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
