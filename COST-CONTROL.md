# InfluNex — Maliyet Kontrolü ve Optimizasyon (COST-CONTROL.md)

## 1. Google Cloud & Firebase Maliyet Önlemleri

1. **Cloud Run Sınırları:**
   - `min-instances=0` (başlangıç aşamasında) veya `1` (yoğun trafikte), `max-instances=10`, `concurrency=80`, `memory=512Mi-1Gi`.
2. **Firestore Sorgu Optimizasyonu:**
   - Hiçbir zaman tüm koleksiyon (`getDocs` limitsiz) çekilmez; tüm listeleme sorgularında `limit(24)` ve cursor pagination zorunludur.
   - Sınırsız `onSnapshot` realtime listener kullanılmaz; yalnızca aktif mesajlaşma penceresinde sınırlı dinleme veya SWR/polling kullanılır.
3. **ISR ve Server-Side Caching:**
   - Programatik SEO sayfaları, kategori/şehir vitrinleri ve sitemap çıktıları ISR (`revalidate = 3600`) ile önbelleğe alınır.
4. **AI API Maliyet Kontrolü:**
   - Varsayılan model `gpt-4o-mini` olarak yapılandırılmıştır.
   - Kullanıcı başına günlük istek sınırı (`AI_DAILY_USER_RATE_LIMIT=20`) ve deterministik önbellek (`AI_CACHE_TTL_SECONDS=3600`) aktiftir.
   - OpenAI anahtarı tanımlı olmadığında sıfır maliyetli deterministik kural motoru devreye girer.
