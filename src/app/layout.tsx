import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
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
    "Markanız için doğru Instagram, TikTok, YouTube influencer'ını ve UGC içerik üreticisini bulun. Ücretsiz üyelik, yalnızca tamamlanan iş birliklerinden %15 komisyon.",
  applicationName: "InfluNex",
  manifest: "/manifest.webmanifest",
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
      </body>
    </html>
  );
}
