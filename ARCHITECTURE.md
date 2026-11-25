# InfluNex — Sistem Mimarisi (ARCHITECTURE.md)

## 1. Mimari Yaklaşım: Modüler Monolit (Modular Monolith)

InfluNex, gereksiz mikroservis veya Kubernetes karmaşıklığı olmadan düşük gecikme, sıfır soğuk başlangıç maliyeti ve yüksek SEO performansı sağlamak üzere **Next.js App Router (TypeScript Strict Mode)** tabanlı **Modüler Monolit** olarak tasarlanmıştır. Her iş alanı (`domain`) kendi şeması, servis katmanı ve adaptörüyle bağımsızdır; platform büyüdüğünde herhangi bir modül bağımsız bir Cloud Run mikroservisine ayrılabilir.

```
src/
├── app/                          # Next.js App Router (SSR / ISR / API v1)
│   ├── [locale]/                 # Çok dilli yönlendirme (/tr, /en, /de, /ar, /fr, /es hazırlığı)
│   │   ├── page.tsx              # Ana Sayfa (Hero, Akıllı Arama, Gerçek Profiller, Kampanyalar, SSS)
│   │   ├── influencer/           # TR Influencer Keşif & Programatik SEO (/tr/influencer/[slug]/[subslug])
│   │   ├── creators/             # EN Creator Discovery (/en/creators/[slug])
│   │   ├── ugc/                  # UGC İçerik Üreticileri (/tr/ugc, /tr/ugc/[city])
│   │   ├── kampanyalar/          # Açık Reklam Kampanyaları & Teklif Verme
│   │   ├── hizmetler/[slug]/     # Hizmet Bazlı SEO Sayfaları (/tr/hizmetler/instagram-reels vb.)
│   │   ├── nasil-calisir/        # Nasıl Çalışır & GEO Rehberi
│   │   ├── influencer-reklam-fiyatlari/ # Şeffaf %15 Komisyon & Fiyat Hesaplama Rehberi
│   │   ├── blog/                 # Editoryal Blog & GEO Kaynak İçerikleri
│   │   ├── hukuki/[slug]/        # KVKK, GDPR, Ticaret Bakanlığı & Sözleşme Taslakları
│   │   ├── giris/ & kayit/       # Ücretsiz Reklamveren & Influencer Kayıt/Giriş
│   │   ├── panel/                # Reklamveren & Influencer İşlem, Sipariş, Dekont ve Hakediş Paneli
│   │   └── admin/                # Yönetici Paneli (Profil/Ödeme Onayı, Muhasebe, SEO & GEO Merkezi)
│   ├── api/v1/                   # REST API v1 (Creators, Categories, Campaigns, Proposals, Orders, AI, Firmanex)
│   ├── sitemap.xml/              # Sitemap Index
│   ├── sitemaps/[type]/          # Bölünmüş Alt Sitemap'ler (profiles-1, categories, cities, services, blog, pages)
│   ├── robots.txt/               # Dinamik Robots.txt (AI Search vs AI Training bot ayrımı)
│   └── llms.txt/                 # GEO Entity & Doğrulanmış Platform Özeti
├── lib/
│   ├── firebase/                 # İzole Firebase Client & Admin SDK (databaseId: "influnex-db", prefix: "influnex_")
│   ├── finance/                  # Kuruş (integer minor units) & 1500 BPS (%15) Komisyon Hesaplama Motoru
│   ├── orders/                   # 15 Durumlu Sipariş State Machine & Denetim İzi (Audit Trail)
│   ├── payments/                 # Havale/EFT/FAST Dekont Doğrulama & Mükerrer Referans Önleme
│   ├── seo/                      # Programatik SEO Motoru, Index Quality Gate, Canonical, Hreflang & JSON-LD
│   ├── ai/                       # Doğal Dil Influencer Önerisi & SSRF Korumalı Kampanya Taslağı Üretici
│   ├── data/                     # Kategoriler (25), Şehirler (81 İl), Hizmet Türleri (12) ve İzole Veri Deposu
│   ├── i18n/                     # Çok Dilli Sözlükler ve Locale Yönetimi (TR, EN + RTL Arapça hazırlığı)
│   ├── security/                 # Rate Limiter, SSRF Guard, Dosya MIME/Magic-Byte Doğrulayıcı, RBAC
│   └── validators/               # Zod Strict Şemaları
└── components/                   # Kurumsal UI Bileşenleri (WCAG 2.2 AA, Mobil Öncelikli, RTL Uyumlu)
```

## 2. Ortam Ayrımı (Development, Staging, Production)

- **Development:** Yerel bellek-içi / emülatör destekli izole veri katmanı; gerçek banka bilgisi veya production verisi içermez.
- **Staging:** Test ve E2E doğrulama ortamı (`X-Robots-Tag: noindex`).
- **Production:** Google Cloud Run (`influnex-web`) + Firebase Hosting (`site: influnex`) + Named Firestore (`influnex-db`) + Secret Manager.
