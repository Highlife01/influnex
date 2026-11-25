# InfluNex Site Denetim Raporu

**Tarih:** 25 Kasım 2026  
**Kapsam:** Yerel kaynak kodu, Next.js App Router, ana sayfa, navigasyon, SEO, erişilebilirlik, güvenlik, test ve yayın yapılandırması.

> Bu denetimde kaynak kodu değiştirilmemiştir. `https://superb-horse-334644.netlify.app/` canlı adresinden içerik çıkarımı ve PowerShell HTTP isteği bağlantı/yanıt hatası nedeniyle tamamlanamamıştır. Canlı ortam değerlendirmesi bu nedenle yerel kaynak ve yayın ayarlarıyla sınırlıdır.

## Yönetici özeti

Proje güçlü bir marketplace temeline sahip: Next.js App Router, çoklu dil route'ları, Firebase, AI öneri API'si, komisyon hesaplama, kampanyalar, ödeme akışı, SEO kalite kapısı ve güvenlik kuralları mevcut. Server-rendered içerik ve finansal hesaplamaların integer minor-unit/BPS yaklaşımı doğru bir temel oluşturuyor.

Bununla birlikte yayın güvenilirliğini doğrudan etkileyen üç kritik problem var. `src/lib/security/apiGuard.ts:28-47` TypeScript derlemesini kırıyor. Production build, derleme başarılı olmasına rağmen `.next/server/pages-manifest.json` eksikliğiyle duruyor. Ayrıca `e2e/home-discovery.spec.ts` mevcut parametrik homepage ile uyuşmayan eski bir ürün sözleşmesini test ediyor.

## Kritik bulgular

### P0 — Yayına çıkışı engelleyenler

#### 1. TypeScript hatası

**Dosya:** `src/lib/security/apiGuard.ts:28-47`

`verifyApiMutationRequest` async olmasına rağmen dönüş tipi global `Promise<T>` biçiminde doğru yazılmamış. `npm.cmd run typecheck` şu nedenle başarısız oluyor: `TS1064: The return type of an async function ... must be the global Promise<T> type.`

Bir type alias kullanılması önerilir:

```ts
type ApiMutationVerification =
  | { allowed: true; actorUid: string; actorRole: UserRole }
  | { allowed: false; status: number; error: string };

export async function verifyApiMutationRequest(...): Promise<ApiMutationVerification> {
```

**Kabul kriteri:** Typecheck hatasız tamamlanmalı; token eksikliği, yanlış origin, rate limit, geçersiz rol ve başarılı istek için testler bulunmalı.

#### 2. Production build kırılması

`npm.cmd run build` “Compiled successfully” sonrasında `D:\web_siteleri\influnex\.next\server\pages-manifest.json` dosyasını bulamadığı için duruyor. Ayrıca `package.json` Next `15.5.29` bildirirken build çıktısı Next `15.2.0` gösteriyor. Projede `.next`, `.next-creatortr` ve `.next-creatortr-preview` gibi birden fazla build klasörü de bulunuyor.

**Önerilen sıra:** `node_modules/next`, `package.json` ve `package-lock.json` sürümlerini eşitleyin; aynı anda tek build çalıştırın; eski build çıktısını temizleyin; tek `distDir` kullanın; CI sırasını `npm ci && npm run typecheck && npm run build` yapın; ardından `next start` ile `/tr`, `/en`, `/sitemap.xml` ve bilinmeyen route smoke testleri ekleyin.

**Kabul kriteri:** Temiz checkout'ta install, typecheck, test ve build yeşil olmalı; `next start` ana sayfada HTTP 200 dönmeli.

### P1 — Kullanıcı deneyimi, SEO ve güven

#### 3. Çoklu dil navigasyonu tutarsız

**Dosyalar:** `src/components/Navbar.tsx:58-96`, `src/app/[locale]/page.tsx:121,333,405`, `src/components/AiNaturalLanguageSearchBox.tsx:122`, `src/components/Footer.tsx` ve çeşitli `[locale]` route'ları.

Locale parametresi varken bazı linkler sabit `/tr/...` adresine gidiyor. İngilizce sayfadan giriş, kayıt, kampanya, UGC veya blog bağlantıları Türkçe sayfaya düşebilir. AI arama bileşeni de request gövdesinde `locale: "tr"` sabitliyor.

**Öneri:** `localizedPath(locale, routeKey, params)` yardımcı fonksiyonu oluşturun; Navbar, Footer, CTA'lar ve client bileşenleri bunu kullansın. AI bileşeni locale prop'u alsın ve API'ye gerçek locale göndersin.

#### 4. İki farklı ana sayfa sözleşmesi var

**Dosyalar:** `src/app/tr/page.tsx`, `src/app/[locale]/page.tsx`, `src/components/home/*`.

Ayrı `/tr/page.tsx` ve parametrik `[locale]/page.tsx` bulunuyor. E2E testleri eski `src/components/home` akışındaki favoriler, karşılaştırma, rol geçişi ve brief planlama davranışlarını beklerken parametrik ana sayfa AI arama, CreatorCard ve komisyon widget'ı render ediyor.

**Öneri:** Tek canonical home route seçin. Eski route'u kaldırın veya yalnızca redirect/uyumluluk katmanı olarak bırakın. Ortak bir `HomePage` bileşeni kullanın.

#### 5. E2E testleri mevcut UI ile senkron değil

**Dosya:** `e2e/home-discovery.spec.ts:5-65`

Testler `.creator-card`, favoriler, karşılaştırma, `Menüyü aç`, rol değişimi ve brief planlama gibi mevcut parametrik ana sayfada doğrulanmayan seçiciler kullanıyor. Bu testler güncel ürünü güvenilir biçimde korumuyor.

**Öneri:** Testleri `discovery/search`, `creator detail`, `campaign/order`, `auth`, `locale` ve `mobile` akışlarına ayırın. Her senaryo gerçek route, ana başlık ve beklenen kullanıcı aksiyonunu doğrulasın.

#### 6. Canlı domain ile canonical domain çelişiyor

**Dosyalar:** `src/app/layout.tsx:6-7`, `src/middleware.ts:3-5`, `src/lib/seo/routeRegistry.ts`, `firebase.json`.

Kod varsayılan olarak `https://www.influnex.com.tr` canonical origin'ini kullanıyor; verilen canlı adres `superb-horse-334644.netlify.app`. Firebase yapılandırması ise `influnex` Cloud Run/Firebase Hosting akışını gösteriyor.

**Öneri:** Production, preview ve local origin'lerini açıkça ayırın. `NEXT_PUBLIC_SITE_URL` yalnızca production canonical origin olsun; preview host'ları `noindex` alsın. Netlify ile Firebase/Cloud Run'dan hangisinin gerçek canonical yayın olduğunu tek deployment dokümanında kesinleştirin.

#### 7. Sitemap için iki ayrı kaynak var

**Dosyalar:** `src/app/sitemap.metadata.ts:4-19`, `src/app/sitemap.xml/route.ts:4-30`.

` sitemap.metadata.ts` tek URL'lik “prototype” döndürürken public route sitemap index ve alt sitemap'ler döndürüyor. Bu, framework route davranışı değiştiğinde eksik sitemap yayınlama riski yaratır.

**Öneri:** Prototype dosyayı kaldırın veya tek generator'a bağlayın. Sabit `lastmod` yerine gerçek veri güncelleme tarihleri kullanın; yalnızca index quality gate'den geçen URL'leri yayınlayın.

### P2 — Erişilebilirlik, performans ve dönüşüm

#### 8. Focus ve async status geri bildirimi eksik

**Dosyalar:** `src/components/AiNaturalLanguageSearchBox.tsx:60,107-110`, `src/components/CommissionCalculatorWidget.tsx:44`, `src/components/CreatorCard.tsx:35`.

Interaktif elemanlarda açık `focus-visible` sınıfları tutarlı değil. AI arama hata ve sonuç alanlarında `aria-live` yok; ekran okuyucu kullanıcıları sonuç güncellemesini otomatik duymayabilir. `transition-all` da birkaç bileşende kullanılıyor ve performans kurallarına göre açık özellik listesiyle değiştirilmesi gerekir.

**Öneri:** `focus-visible:ring-2` ve kontrastlı focus durumları ekleyin; hata/sonuç alanlarına `role="status"` veya `aria-live="polite"` koyun; `transition-colors` veya açık `transition-[border-color,box-shadow]` kullanın; `prefers-reduced-motion` için global varyant sağlayın.

#### 9. Görsel ve içerik güven sinyalleri karışık

`CreatorCard` tüm kartlarda “Örnek Vitrin Profili (Demo Veri)” gösteriyor. Bu şeffaflık açısından iyi, ancak gerçek kullanıcı profilleri ile demo profilleri aynı keşif yüzeyinde olduğunda satın alma güveni ve dönüşüm düşebilir.

**Öneri:** Demo veriyi ayrı bir demo koleksiyonunda veya açık “Demo” filtresinde tutun. Gerçek onaylı profilleri varsayılan listeye alın. Metrik kaynağı, güncelleme tarihi, kullanım hakkı ve teslim süresi kartta aynı hiyerarşiyle gösterilmeli.

#### 10. Ana sayfa çok geniş ve karar yükü yüksek

Ana sayfa platformlar, profiller, 25 kategori, komisyon hesaplayıcı, kampanyalar, şehirler, hizmetler, UGC, iki rol değer önerisi ve FAQ bölümlerini art arda veriyor. İçerik zengin, fakat ilk ziyarette tek birincil aksiyon yeterince baskın değil.

**Öneri:** İlk ekranı iki net role ayırın: “Markam için üretici bul” ve “Üretici olarak kazan”. AI aramayı ikincil/örnek görev olarak konumlandırın. Above-the-fold alanında sosyal kanıt, sonuç sayısı ve tek ana CTA gösterin. SEO bloklarını koruyup görsel yoğunluğu bölümlere dağıtın.

## Güvenlik değerlendirmesi

Güvenlik temeli güçlü görünüyor. `firestore.rules` default-deny yaklaşımı, finansal koleksiyonlarda client write kapatılması, rol/sahiplik kontrolleri, minor-unit hesaplama, private receipt yolu ve dosya magic-byte kontrolleri doğru yönler.

Yine de `apiGuard.ts` içindeki rate limit bellekteki `Map` üzerinde çalışıyor. Cloud Run/Firebase birden fazla instance çalıştırdığında limit instance'lar arasında paylaşılmaz. Production için Redis/Firestore tabanlı dağıtık rate limit veya platform gateway limiti düşünülmeli. `x-forwarded-for` doğrudan güvenilir client girdisi kabul edilmemeli; yalnızca güvenilir proxy zincirinden normalize edilmelidir.

CSP içinde `'unsafe-inline'` bulunuyor. Next hydration ve Firebase gereksinimi nedeniyle geçici olabilir, ancak nonce/hash tabanlı script politikasıyla daraltılmalı. CSP violation report-only aşamasıyla başlanması güvenli olur.

## SEO değerlendirmesi

SSR ve route bazlı `generateMetadata`, canonical, hreflang, JSON-LD, sitemap index, robots ve `notFound()` kullanımı iyi bir temel. SEO stratejisi dosyası da programatik sayfalarda üç aktif onaylı profil, gerçek hizmet/fiyat verisi ve özgün açıklama gibi kalite eşikleri tanımlıyor.

Öncelikli SEO riski implementation ile dokümantasyon arasındaki tutarsızlık: bazı `[locale]` sayfalarda metadata doğru hazırlanırken içerik içi linkler ve breadcrumb'lar sabit Türkçe URL'lere dönüyor. Ayrıca canlı domain doğrulanmadan canonical, `og:url` ve sitemap mutlak adresleri güvenilir biçimde kabul edilemez. Yayın sonrası ham HTML kontrolü yapılmalı; yalnızca tarayıcıda render edilen DOM veya dashboard SEO skoru yeterli değildir.

Kontrol listesi: `/tr`, `/en`, bir creator detail, bir kategori/şehir sayfası, bir blog yazısı ve bilinmeyen route için status code; ham body'de H1; title/description; canonical; hreflang; OG tags; robots; sitemap kaynakları.

## Önerilen uygulama sırası

**1. gün:** `apiGuard.ts` tip hatasını düzeltin, Next sürümünü eşitleyin, temiz build alın ve tek canonical home route kararını verin.

**2–3. gün:** locale-aware link helper'ı çıkarın; Navbar, Footer, CTA, AI arama ve detail sayfalarındaki sabit `/tr` linklerini dönüştürün. E2E testlerinin eski ve yeni ürün sözleşmelerini ayırın.

**4–5. gün:** focus-visible, aria-live, reduced-motion, status/error tasarımı ve mobil navigation testlerini tamamlayın. Ana sayfanın CTA hiyerarşisini sadeleştirin.

**2. hafta:** production domain/canonical sözleşmesini netleştirin; sitemap tekilleştirin; ham HTML SEO smoke testleri, Lighthouse/axe kontrolleri ve deploy sonrası HTTP smoke testleri ekleyin.

**3. hafta:** dağıtık rate limit, CSP nonce/hash yaklaşımı, audit log kalıcılığı, ödeme ve sipariş akışları için idempotency testleri ve gözlemlenebilirlik metriklerini tamamlayın.

## Ölçülmesi gereken ürün metrikleri

Ana başarı metrikleri; ziyaretçiden arama başlatmaya geçiş, aramadan creator detail görüntülemeye geçiş, detail'dan kayıt olmaya geçiş, kayıt sonrası ilk kampanya veya teklif, AI arama başarı/boş sonuç oranı ve ödeme dekontu yükleme tamamlanma oranı olmalı. Teknik tarafta Core Web Vitals, JS hata oranı, API p95 latency, 4xx/5xx, ödeme state transition hataları ve sitemap indexlenen URL oranı izlenmeli.

## Sonuç

InfluNex'in mimari yönü doğru ve ürün kapsamı güçlü. Ancak yeni özellik eklemekten önce derleme zinciri, canonical route, çoklu dil linkleri ve test sözleşmesi temizlenmeli. Bu dört konu düzeltildiğinde erişilebilirlik ve dönüşüm iyileştirmeleri daha güvenilir ölçülebilir; SEO ve ödeme/güven katmanındaki mevcut yatırım da gerçek kullanıcı trafiğine daha sağlıklı taşınabilir.
