import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.influnex.com.tr"
  ),
  title: {
    default: "InfluNex | Markalar, Influencer ve UGC İçerik Üreticileri Pazaryeri",
    template: "%s | InfluNex",
  },
  description:
    "InfluNex beta sürümünde örnek Instagram, TikTok ve YouTube içerik üreticilerini keşfedin, brief taslağı hazırlayın. Canlı kampanya, sipariş ve ödeme henüz açık değildir.",
  applicationName: "InfluNex",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.png?v=2", sizes: "512x512", type: "image/png" },
      { url: "/icon-mark.png?v=2", type: "image/png" },
      { url: "/icon.svg?v=2", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.png?v=2",
    apple: [{ url: "/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    siteName: "InfluNex",
    images: [{ url: "/logo.png?v=2", width: 898, height: 170, alt: "InfluNex" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#1e1b4b",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await headers()).get("x-influnex-locale") === "en" ? "en" : "tr";

  return (
    <html lang={locale} dir="ltr">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
