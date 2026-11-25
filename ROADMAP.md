# InfluNex — Geliştirme Yol Haritası (ROADMAP.md)

- **Faz 1 — Temel Mimari & Veri İzolasyonu (Tamamlandı):** Next.js App Router, TypeScript strict mode, `influnex-db` ve `influnex_` 4 katmanlı veri izolasyonu, 28 koleksiyon şeması, `firestore.rules`, `storage.rules`, TR/EN çok dilli altyapı.
- **Faz 2 — Pazaryeri (Tamamlandı):** Influencer profilleri, doğrulama rozetleri (`API_VERIFIED`, `ADMIN_VERIFIED`, `USER_DECLARED`), 25 kategori, 81 şehir, 12 hizmet şablonu, çok filtreli arama motoru, kampanya ve teklif sistemi, mesajlaşma.
- **Faz 3 — Ticari İşlemler (Tamamlandı):** 15 durumlu sipariş state machine, Havale/EFT/FAST dekont yükleme, mükerrer banka referans kontrolü, %15 (`1500 BPS`) komisyon / %85 (`8500 BPS`) hakediş muhasebe motoru, Ticaret Bakanlığı `#reklam` bildirimi kontrolü, uyuşmazlık ve iade yönetimi.
- **Faz 4 — SEO & GEO Motoru (Tamamlandı):** SSR/ISR, merkezi route registry, Index Quality Gate (en az 3 onaylı profil), Sitemap Index ve 6 alt sitemap, dinamik `robots.txt`, `/llms.txt`, Schema.org JSON-LD, blog ve SEO/GEO Admin Merkezi.
- **Faz 5 — AI, Analitik & PWA (Tamamlandı):** Doğal dil AI influencer önerisi, SSRF korumalı AI kampanya hazırlayıcı, GA4 dönüşüm olayları, PWA manifest ve mobil alt navigasyon.
- **Faz 6 — Production Hazırlığı (Tamamlandı):** Kapsamlı Vitest birim/entegrasyon testleri, CI/CD, hukuki onay ve banka konfigürasyon bloklayıcı kontrolleri.
