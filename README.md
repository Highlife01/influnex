# InfluNex — Global Influencer & UGC Creator Marketplace

## Ana sayfa: keşif ve brief ön izlemesi

`/tr` ana sayfası kategori/platform/şehir/bütçe filtreleme, fiyat ve teslim süresine göre sıralama, tarayıcıda saklanan favoriler, üçlü profil karşılaştırma ve profil detaylarını içerir. Katalog açıkça etiketlenmiş örnek verilerden oluşur (`src/lib/marketplace/catalog.ts`); gerçek üye veya doğrulanmış metrik değildir.

Ürün deneyimi, lansman ve inceleme şablonlarıyla brief hazırlanabilir. Form ve seçilen örnek profil bu tarayıcıya kaydedilebilir; tamamlanan brief `.txt` olarak indirilebilir. Bu özellik kampanya yayınlamaz, hesap/sipariş oluşturmaz ve ödeme almaz. Taslak verileri sunucuya gönderilmez. Kazanç hesaplayıcı, tamamlanan iş birliği tutarının %85 üretici / %15 platform dağılımını örnekler.

Doğrulama: `npm test`, `npm run build`. Çalışan yerel sunucuyla `npm run test:e2e -- --workers=1` masaüstü ve Pixel 7 akışlarını kontrol eder. Paralel bir Next.js süreci varsa `INFLUNEX_BUILD_DIR` ortam değişkeniyle ayrı bir `.next-*` klasörü kullanılabilir.

**Slogan (TR):** İş birliği yap. Birlikte kazan.  
**Slogan (EN):** Connect. Collaborate. Earn.

InfluNex, reklamveren markaları ve işletmeleri doğrulanmış influencer'lar (Instagram, TikTok, YouTube) ve UGC içerik üreticileriyle buluşturan, **ücretsiz üyelikli**, **yalnızca tamamlanan iş birliklerinden %15 komisyon (`1500 BPS`)** alan, teknik SEO, Programatik SEO ve GEO (Generative Engine Optimization) odaklı global bir dijital pazaryeridir.

---

## 1. Değiştirilemez İş Modeli (Immutable Business Model)

- **Reklamveren ve Influencer üyeliği:** %100 Ücretsiz
- **Profil oluşturma, listeleme, kampanya açma, teklif verme ve mesajlaşma:** %100 Ücretsiz
- **Abonelik, premium paket, jeton, dijital cüzdan, ücretli profil öne çıkarma veya gizli ek hizmet bedeli:** **YOK**
- **Tek gelir modeli:** Başarıyla tamamlanan siparişlerden **%15 Platform Komisyonu (`1500 BPS`)** ve **%85 Influencer Hakedişi (`8500 BPS`)**
- **İlk sürüm ödeme yöntemi:** Yalnızca Banka Havalesi / EFT / FAST ve yönetici tarafından manuel banka hareketi + dekont doğrulaması (6493 sayılı Kanun uyumluluğu kapsamında izinsiz emanet cüzdan veya elektronik para saklama yapılmaz; tüm finansal hesaplamalar kuruş/minor unit integer aritmetiği ile yalnızca backend üzerinde yürütülür).

---

## 2. Çok Katmanlı Veri İzolasyonu (`karacateknik-b202f` / `influnex`)

Paylaşımlı Firebase projesi (`karacateknik-b202f`) üzerinde diğer hiçbir proje veya veritabanıyla çakışmamak için **4 katmanlı veri izolasyonu (Defense-in-Depth Data Isolation)** uygulanmıştır:

1. **Named Firestore Database İzolasyonu:** `firebase.json` ve uygulama SDK'ları yalnızca `influnex-db` veritabanına bağlanır (`FIRESTORE_DATABASE_ID="influnex-db"`). `(default)`, `ilanturkiye` veya `kuzeydenizi-db` veritabanlarına dokunmaz.
2. **Koleksiyon Namespace Ön Eki (`influnex_`):** Tüm 28 Firestore koleksiyonu `influnex_` ön ekiyle (`influnex_users`, `influnex_publicCreatorProfiles`, `influnex_privateCreatorProfiles`, `influnex_orders`, `influnex_financialLedger`, vb.) fiziksel olarak ayrılmıştır.
3. **Belge Bazlı Tenant Kimliği (`tenantId: "influnex"`) & Public/Private Fiziksel Ayrım:** Her belge `tenantId: "influnex"` taşır ve `firestore.rules` bunu zorunlu tutar. Ayrıca halka açık influencer profilleri (`influnex_publicCreatorProfiles`) ile gizli finansal/kimlik verileri (`influnex_privateCreatorProfiles` — IBAN, TCKN/VKN, telefon, özel e-posta) fiziksel olarak farklı koleksiyonlarda tutulur.
4. **Cloud Storage & Hosting İzolasyonu:** Firebase Hosting yalnızca `site: "influnex"` hedefine dağıtılır; Storage dosyaları `influnex-b202f` kovası ve `/influnex/{public|private}/...` kök yolu altında izole edilir.

---

## 3. Hızlı Başlangıç

```bash
# 1. Güncel kodu çekin ve bağımlılıkları kurun
node scripts/auto-pull.cjs
npm install

# 2. Ortam değişkenlerini hazırlayın
cp .env.example .env.local

# 3. Geliştirme sunucusunu başlatın
npm run dev

# 4. Tip kontrolü, birim/entegrasyon testleri ve üretim derlemesi
npm run typecheck
npm test
npm run build
```

Google girişini kullanmak için Firebase Authentication'da Google sağlayıcısını etkinleştirin. `.env.local` içinde Firebase istemci ayarları ve sunucuya özel `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` değerleri tanımlı olmalıdır. `SUPERADMIN_EMAIL` varsayılanı `cebrailkara@gmail.com` olup yönetici rolü yalnızca sunucuda atanır. Ayrıntılar için [DEPLOYMENT.md](./DEPLOYMENT.md) dosyasına bakın.

---

## 4. Dokümantasyon İndeksi

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Modüler monolit mimarisi ve katmanlar
- [DATABASE.md](./DATABASE.md) — 28 izole Firestore koleksiyonu, indeksler ve veri izolasyonu
- [SECURITY.md](./SECURITY.md) — OWASP, RBAC, App Check, SSRF ve dosya güvenliği
- [SEO-STRATEGY.md](./SEO-STRATEGY.md) — SSR/ISR, Programatik SEO, Index Quality Gate, Canonical, Hreflang ve Sitemap
- [GEO-STRATEGY.md](./GEO-STRATEGY.md) — Generative Engine Optimization, Entity Graph, `llms.txt` ve AI Bot yönetimi
- [API.md](./API.md) — REST API v1, OpenAPI 3.1, CLI/MCP ve Firmanex entegrasyon hazırlığı
- [PAYMENT-FLOW.md](./PAYMENT-FLOW.md) — Havale/EFT/FAST, dekont doğrulama ve 15 durumlu sipariş state machine
- [COMMISSION-POLICY.md](./COMMISSION-POLICY.md) — Kuruş (minor unit) muhasebe motoru, %15 komisyon / %85 hakediş
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Cloud Run / Firebase Hosting (`influnex`) ve son 5 deploy kuralı
- [TESTING.md](./TESTING.md) — Vitest birim/entegrasyon ve Playwright E2E test senaryoları
- [COST-CONTROL.md](./COST-CONTROL.md) — Firestore, Cloud Run, Storage ve AI maliyet optimizasyonu
- [ROADMAP.md](./ROADMAP.md) — Faz 1–6 geliştirme yol haritası
- [CHANGELOG.md](./CHANGELOG.md) — Sürüm geçmişi
