# InfluNex — Veritabanı Mimarisi ve Veri İzolasyonu (DATABASE.md)

## 1. Veri İzolasyonu Prensibi (`karacateknik-b202f`)

`karacateknik-b202f` Firebase projesi üzerinde çalışan diğer sistemlerle (`ilanturkiye` / FirmaNex, `kuzeydenizi-db`, `(default)`) **sıfır veri kesişimi** sağlamak için:

1. **Veritabanı Kimliği:** `FIRESTORE_DATABASE_ID = "influnex-db"`
2. **Koleksiyon Ön Eki:** Tüm koleksiyonlar `influnex_` ön eki ile adlandırılır (`getIsolatedCollectionName(name)`).
3. **Tenant Etiketi:** Her kayıt `tenantId: "influnex"` alanı içerir ve `firestore.rules` tarafından doğrulanır.
4. **Public / Private Fiziksel Ayrımı:** Firestore'da belge içi alan gizlemeye güvenilmez. Herkese açık profil verileri `influnex_publicCreatorProfiles` koleksiyonunda, TC Kimlik / Vergi No, IBAN, banka hesap sahibi, telefon ve özel e-posta bilgileri ise yalnızca sahibi ve yetkili admin tarafından okunabilen `influnex_privateCreatorProfiles` koleksiyonunda saklanır.

---

## 2. 28 İzole Firestore Koleksiyonu

| # | Mantıksal Ad | Fiziksel Koleksiyon Adı (`influnex-db`) | Erişim Politikası | Açıklama |
|---|---|---|---|---|
| 1 | `users` | `influnex_users` | Sahibi / Admin | Kullanıcı rolü (`ADVERTISER`, `CREATOR`, `ADMIN`), durum ve doğrulama rozetleri |
| 2 | `publicCreatorProfiles` | `influnex_publicCreatorProfiles` | Herkese Açık (`APPROVED`) | SEO uyumlu influencer vitrin profili, şehir, kategoriler, onaylı metrikler |
| 3 | `privateCreatorProfiles` | `influnex_privateCreatorProfiles` | Yalnızca Sahibi / Admin | IBAN, yasal ad-soyad, TCKN/VKN, telefon, doğum tarihi (18+ onayı) |
| 4 | `advertiserProfiles` | `influnex_advertiserProfiles` | Sahibi / Admin | Reklamveren firma/şahıs bilgileri, vergi dairesi, Firmanex bağlantı ID'si |
| 5 | `socialAccounts` | `influnex_socialAccounts` | Herkese Açık Okuma | Instagram, TikTok, YouTube, UGC hesapları ve `verificationSource` (`API_VERIFIED`, `ADMIN_VERIFIED`, `USER_DECLARED`) |
| 6 | `categories` | `influnex_categories` | Herkese Açık Okuma / Admin Yazma | 25 başlangıç kategorisi (TR/EN ad, slug, SEO metadata) |
| 7 | `countries` | `influnex_countries` | Herkese Açık Okuma / Admin Yazma | Ülke kodları, para birimi ve dil ayarları |
| 8 | `cities` | `influnex_cities` | Herkese Açık Okuma / Admin Yazma | Türkiye 81 il ve uluslararası şehir tanımları |
| 9 | `services` | `influnex_services` | Herkese Açık Okuma / Creator Yazma | Influencer hizmetleri, `priceMinorUnits` (kuruş), teslim süresi, kullanım hakları |
| 10 | `campaigns` | `influnex_campaigns` | Açık Okuma / Reklamveren Yazma | Reklamveren kampanya ilanları ve bütçe (`budgetMinorUnits`) |
| 11 | `proposals` | `influnex_proposals` | Taraflar / Admin | Influencer kampanya teklifleri |
| 12 | `orders` | `influnex_orders` | Taraflar / Admin (Yazma: Backend) | Sipariş kaydı, değiştirilemez fiyat/komisyon (`1500 BPS`) anlık görüntüsü (snapshot) |
| 13 | `orderEvents` | `influnex_orderEvents` | Taraflar / Admin (Yazma: Backend) | Sipariş state machine geçişlerinin değiştirilemez denetim kaydı |
| 14 | `paymentRecords` | `influnex_paymentRecords` | Reklamveren / Admin (Yazma: Backend) | Havale/EFT/FAST dekont kayıtları ve benzersiz `bankTransactionRef` |
| 15 | `payoutRecords` | `influnex_payoutRecords` | Influencer / Admin (Yazma: Backend) | %85 influencer hakediş kayıtları ve ödeme dekont/referans numaraları |
| 16 | `financialLedger` | `influnex_financialLedger` | Yalnızca Admin (Append-Only Backend) | Çift taraflı muhasebe defteri (Brüt tahsilat, %15 komisyon, %85 hakediş, iade, ters kayıt) |
| 17 | `conversations` | `influnex_conversations` | Katılımcılar | Sipariş veya kampanya bağlantılı mesajlaşma başlıkları |
| 18 | `messages` | `influnex_messages` | Katılımcılar | Spam korumalı mesajlar ve okundu bilgileri |
| 19 | `notifications` | `influnex_notifications` | Alıcı Kullanıcı | Uygulama içi ve işlemsel e-posta bildirim kayıtları |
| 20 | `reviews` | `influnex_reviews` | Herkese Açık (`isPublished`) | Yalnızca `COMPLETED` sipariş sonrası oluşturulan gerçek değerlendirmeler |
| 21 | `disputes` | `influnex_disputes` | Taraflar / Admin | Sipariş itiraz ve uyuşmazlık dosyaları |
| 22 | `reports` | `influnex_reports` | Yalnızca Admin (Oluşturma: Üye) | Profil veya mesaj şikâyet kayıtları |
| 23 | `documents` | `influnex_documents` | Sahibi / Admin | Özel dekont ve teslimat dosyası referansları |
| 24 | `seoPages` | `influnex_seoPages` | Herkese Açık Okuma / Admin Yazma | Programatik SEO sayfa kalite skorları, Index Quality Gate ve editoryal onay durumu |
| 25 | `blogPosts` | `influnex_blogPosts` | Herkese Açık (`PUBLISHED`) | Editoryal blog ve GEO rehber içerikleri |
| 26 | `redirects` | `influnex_redirects` | Herkese Açık Okuma / Admin Yazma | Kullanıcı adı değişikliklerinde eski URL'den yeni URL'ye 301 yönlendirme tablosu |
| 27 | `platformSettings` | `influnex_platformSettings` | Yalnızca Admin | Hukuki onay, banka bilgileri ve AI/SEO bayrakları |
| 28 | `adminAuditLogs` | `influnex_adminAuditLogs` | Yalnızca Admin (Append-Only) | Yönetici işlemlerinin silinemez denetim kayıtları |
| + | `consentRecords` | `influnex_consentRecords` | Sahibi / Admin (Append-Only) | KVKK/GDPR ve sözleşme sürümü onay kayıtları |
| + | `verificationRequests` | `influnex_verificationRequests` | Sahibi / Admin | Kimlik (18+) ve sosyal medya doğrulama talepleri |
