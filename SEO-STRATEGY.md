# InfluNex — SEO Master Strategy (SEO-STRATEGY.md)

## 1. Teknik SEO ve SSR/ISR Mimarisi

- Tüm herkese açık sayfalar Next.js App Router Server Components ile **ilk HTML yanıtında** eksiksiz `title`, `meta description`, tek ve anlamlı `H1`, breadcrumb, influencer kartları, hizmet fiyatları, JSON-LD yapılandırılmış veri, self-referencing `canonical` ve karşılıklı `hreflang` (`tr-TR`, `en`, `x-default`) içerir.
- Boş SPA kabuğu veya yalnızca istemci tarafı JS çalıştıktan sonra görünen içerik problemi yoktur.
- Googlebot ile normal kullanıcıya birebir aynı içerik sunulur (cloaking yapılmaz).

## 2. Merkezi Route Registry ve URL Mimarisi

Şehir, kategori, platform ve influencer kullanıcı adı çakışmalarını önlemek için merkezi doğrulama (`src/lib/seo/routeRegistry.ts`) kullanılır:

- **Türkçe URL'ler:**
  - `/tr`
  - `/tr/influencer`
  - `/tr/influencer/istanbul`, `/tr/influencer/adana`, `/tr/influencer/mersin`, `/tr/influencer/izmir`, `/tr/influencer/ankara`
  - `/tr/influencer/otomotiv`, `/tr/influencer/moda`, `/tr/influencer/teknoloji`
  - `/tr/influencer/instagram`, `/tr/influencer/tiktok`, `/tr/influencer/youtube`
  - `/tr/influencer/istanbul/moda`, `/tr/influencer/ankara/teknoloji`, `/tr/influencer/adana/otomotiv`
  - `/tr/influencer/[kullanici-adi]` (301 eski kullanıcı adı yönlendirme destekli)
  - `/tr/ugc`, `/tr/ugc/istanbul`
  - `/tr/kampanyalar`
  - `/tr/hizmetler/instagram-reels`, `/tr/hizmetler/tiktok-video`
  - `/tr/blog`, `/tr/nasil-calisir`, `/tr/influencer-reklam-fiyatlari`
- **İngilizce URL'ler:**
  - `/en`, `/en/creators`, `/en/creators/turkiye`, `/en/creators/istanbul`, `/en/creators/automotive`, `/en/ugc-creators`, `/en/campaigns`, `/en/how-it-works`

## 3. Programatik SEO ve Index Quality Gate

Binlerce boş sayfa üretilmesini önlemek için her programatik açılış sayfası `evaluateIndexQualityGate()` fonksiyonundan geçer:

- **Otomatik İndeksleme Eşikleri:**
  1. En az **3 aktif ve onaylı (`APPROVED`) influencer profili** (veya açık editoryal onay `editorialOverride === true`)
  2. Gerçek ve aktif hizmet/fiyat verisi
  3. En az 120 karakter özgün, konuma/kategoriye özel açıklama
  4. Duplicate olmayan kanonik URL ve HTTP 200 durumu
  5. Dahili bağlantı ağından erişilebilirlik
- Eşiğin altındaki sayfalar sahte profil üretmez; otomatik olarak `robots: { index: false, follow: true }` (`noindex, follow`) alır ve `/sitemap.xml` ile alt sitemap'lerden çıkarılır.
