import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import Script from "next/script";
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
    "Markanız için doğrulanmış Instagram, TikTok, YouTube influencer'larını ve UGC içerik üreticilerini keşfedin. Ücretsiz katılın, yalnızca tamamlanan iş birliklerinden %15 komisyon ödeyin.",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var h=window.location.hostname.toLowerCase();if(h==="influnex.web.app"||h==="influnex.firebaseapp.com"||h==="influnex.com.tr"||h.endsWith(".web.app")||h.endsWith(".firebaseapp.com")){window.location.replace("https://www.influnex.com.tr"+window.location.pathname+window.location.search+window.location.hash);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <Script id="gtm-datalayer" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});`}
        </Script>
        <Script
          id="gtm-loader"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtm.js?id=GTM-M6RZNM4Q"
        />
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-M6RZNM4Q"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
