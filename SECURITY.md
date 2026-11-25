# InfluNex — Güvenlik Mimarisi (SECURITY.md)

## 1. OWASP Top 10 ve Savunma Katmanları

1. **Broken Access Control & IDOR Koruması:**
   - Her backend endpoint'i kullanıcı kimliğini, rolünü (`ADVERTISER`, `CREATOR`, `ADMIN`) ve kaynak sahipliğini (`advertiserId === uid` veya `creatorId === uid`) doğrular.
   - Admin yetkileri yalnızca sunucu tarafında doğrulanan RBAC ve Firebase Custom Claims (`token.role === "ADMIN"`) üzerinden verilir.
2. **Finansal Bütünlük ve İstemci Güvensizliği (Zero-Trust Frontend):**
   - İstemciden gelen hiçbir komisyon veya hakediş tutarı kabul edilmez.
   - Tüm para hesaplamaları sunucu tarafında (`src/lib/finance/commission.ts`) kuruş (`minorUnits` integer) ve `1500 BPS` (%15) üzerinden gerçekleştirilir.
   - `influnex_orders`, `influnex_paymentRecords`, `influnex_payoutRecords` ve `influnex_financialLedger` koleksiyonlarına istemci üzerinden doğrudan yazma (`allow write: if false`) tamamen kapalıdır.
3. **SSRF (Server-Side Request Forgery) ve Prompt Injection Koruması:**
   - AI kampanya hazırlama modülündeki marka web sitesi doğrulayıcısı (`src/lib/security/ssrfGuard.ts`), `localhost`, `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.169.254` (cloud metadata), `.internal` ve HTTP şemalarını kesin olarak reddeder.
   - Kullanıcı girdileri LLM'e gönderilmeden önce kontrol karakterlerinden ve prompt injection kalıplarından arındırılır.
4. **Dosya Yükleme Güvenliği (Dekont Doğrulama):**
   - Yalnızca `application/pdf`, `image/jpeg` ve `image/png` MIME türleri kabul edilir.
   - Dosya boyutu maksimum 5 MB ile sınırlandırılmıştır.
   - Magic-byte (dosya başlığı imzası: `%PDF`, `FF D8 FF`, `89 50 4E 47`) kontrolü ve gömülü script (`<script`, `/JS`, `/JavaScript`) taraması uygulanır.
   - Dekontlar `/influnex/private/receipts/{advertiserId}/{orderId}/{fileName}` yolunda private olarak saklanır.
5. **Güvenli HTTP Başlıkları:**
   - `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` ve `Permissions-Policy` `next.config.ts` ve `firebase.json` üzerinde aktiftir.
6. **Log Gizliliği:**
   - Uygulama ve denetim loglarına hiçbir zaman API anahtarı, TCKN, tam IBAN veya parola yazılmaz (`maskIban`, `redactSensitiveFields`).
