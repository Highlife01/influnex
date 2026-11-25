# InfluNex — Test ve Kalite Kontrol Rehberi (TESTING.md)

## 1. Test Katmanları

- **Unit & Integration Testleri (Vitest):** `npm test`
  - %15 komisyon ve %85 hakediş kuruş hesaplamaları (100 TL, 1.000 TL, 5.000 TL, 10.000 TL, küsuratlı kuruş yuvarlamaları, kısmi iade, fazla/eksik ödeme)
  - 15 durumlu sipariş state machine geçişleri, yetkisiz geçiş engelleri ve audit trail
  - Mükerrer banka referans numarası (`bankTransactionRef`) ve mükerrer hakediş ödemesi (idempotency & concurrency) engelleme
  - RBAC, kaynak sahipliği (IDOR engeli), public/private profil izolasyonu ve PII sızıntı testleri
  - Dekont yükleme MIME type, dosya boyutu (5 MB) ve magic-byte / XSS zararlı içerik testleri
  - SSRF koruması ve prompt injection temizleme testleri
  - SEO metadata, Canonical, Hreflang, Sitemap, JSON-LD ve Index Quality Gate (3 onaylı profil eşiği) testleri
- **End-to-End Testler (Playwright):** `npm run test:e2e`
  - Masaüstü ve mobil (Pixel 7) görünüm, ana sayfa, keşfet filtreleri, kampanya oluşturma ve SEO etiketleri kontrolü.
