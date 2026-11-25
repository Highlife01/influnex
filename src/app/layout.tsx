import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://influnex.com"
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" dir="ltr">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
