# InfluNex — Sipariş ve Banka Havalesi Akışı (PAYMENT-FLOW.md)

## 1. 6493 Sayılı Kanun Uyumluluğu ve Ticari Model

- İlk sürümde kredi kartı, sanal POS, dijital cüzdan veya kullanıcılar arası bakiye transferi **bulunmaz**.
- Ödemeler yalnızca **Banka Havalesi / EFT / FAST** ile şirket banka hesabına yapılır.
- `BANK_TRANSFER_LIVE_ENABLED=true` ve gerçek şirket IBAN/unvan bilgileri tanımlanmadan ödeme ekranında uydurma IBAN gösterilmez; açıkça konfigürasyon uyarısı sunulur.

## 2. 15 Durumlu Sipariş State Machine

```mermaid
stateDiagram-v2
    [*] --> PAYMENT_PENDING
    PAYMENT_PENDING --> PAYMENT_REVIEW : Reklamveren Dekont Yükler
    PAYMENT_PENDING --> CANCELLED : İptal / Süre Aşımı
    PAYMENT_REVIEW --> PAID : Admin Banka Hareketini Onaylar
    PAYMENT_REVIEW --> PAYMENT_PENDING : Eksik/Hatalı Dekont Reddi
    PAID --> IN_PROGRESS : Influencer İşi Başlatır
    IN_PROGRESS --> CONTENT_SUBMITTED : Influencer İçeriği Teslim Eder
    CONTENT_SUBMITTED --> REVISION_REQUESTED : Reklamveren Revizyon İster
    REVISION_REQUESTED --> CONTENT_SUBMITTED : Influencer Yeni Revizyon Gönderir
    CONTENT_SUBMITTED --> CONTENT_APPROVED : Reklamveren İçeriği Onaylar
    CONTENT_APPROVED --> PUBLISHED : Sponsorlu Yayın Bağlantısı (#reklam) Doğrulanır
    PUBLISHED --> COMPLETED : Sipariş Tamamlanır
    COMPLETED --> PAYOUT_PENDING : %85 Hakediş Kaydı Oluşur
    PAYOUT_PENDING --> PAYOUT_COMPLETED : Admin Banka Transferini Yapar
    PAID --> DISPUTED : Uyuşmazlık Açılır
    IN_PROGRESS --> DISPUTED : Uyuşmazlık Açılır
    CONTENT_SUBMITTED --> DISPUTED : Uyuşmazlık Açılır
    DISPUTED --> REFUND_PENDING : İade Kararı
    REFUND_PENDING --> REFUNDED : Banka İadesi Tamamlanır
```

## 3. Dekont ve Mükerrer Transfer Kontrolleri

- Dekont yüklemek ödemenin onaylandığı anlamına gelmez (`PAYMENT_REVIEW`).
- Yönetici banka ekstresinden gerçek tutarı, tarihi ve **Banka İşlem Referans Numarasını (`bankTransactionRef`)** kontrol ederek onaylar.
- Aynı `bankTransactionRef` numarasının birden fazla siparişte kullanılması backend tarafından kesin olarak engellenir.
