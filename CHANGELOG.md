# Changelog (CHANGELOG.md)

## [1.0.0] - 2026-11-25

### Added
- **Veri İzolasyonu (`karacateknik-b202f` / `influnex`):** Named Firestore DB (`influnex-db`), koleksiyon ön eki (`influnex_`), belge bazlı `tenantId: "influnex"`, fiziksel `publicCreatorProfiles` / `privateCreatorProfiles` ayrımı ve `/influnex/...` Storage yolu izolasyonu.
- **Değiştirilemez İş Modeli:** Ücretsiz reklamveren ve influencer üyeliği; yalnızca tamamlanan iş birliklerinden %15 (`1500 BPS`) komisyon ve %85 (`8500 BPS`) influencer hakedişi hesaplayan kuruş (`minorUnits`) tabanlı backend muhasebe motoru.
- **Sipariş State Machine & Havale/EFT/FAST:** 15 durumlu backend yetkilendirmeli sipariş yaşam döngüsü, PDF/JPG/PNG magic-byte doğrulamalı dekont yükleme, mükerrer banka işlem referansı engelleme ve Ticaret Bakanlığı `#reklam` / `#işbirliği` kontrolü.
- **SEO & GEO Master Altyapısı:** TR/EN çok dilli App Router, merkezi route registry, Index Quality Gate (minimum 3 onaylı profil eşiği), `/sitemap.xml` ve 6 alt sitemap, dinamik `/robots.txt`, `/llms.txt`, Schema.org JSON-LD ve SEO/GEO Admin Merkezi.
- **AI & REST API v1:** Doğal dilde gerçek veri tabanlı influencer önerisi (`POST /api/v1/recommendations`), SSRF korumalı kampanya taslağı hazırlayıcı (`POST /api/v1/campaigns/ai-draft`), OpenAPI 3.1 dokümantasyonu ve Firmanex entegrasyon kancaları.
