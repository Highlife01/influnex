# InfluNex — Komisyon ve Muhasebe Politikası (COMMISSION-POLICY.md)

## 1. Sabit Komisyon Oranı: %15 (`1500 BPS`)

- **Platform Komisyonu:** `1500 BPS` (%15)
- **Influencer Brüt Hakedişi:** `8500 BPS` (%85)
- Hiçbir abonelik, gizli hizmet bedeli veya reklamveren ek komisyonu yoktur.

## 2. Kuruş (Integer Minor Units) Hesaplama Standardı

Floating-point (`0.1 + 0.2`) yuvarlama hatalarını tamamen ortadan kaldırmak için tüm tutarlar kuruş (`1 TL = 100 kuruş`) cinsinden tam sayı (`integer`) olarak saklanır ve hesaplanır:

$$\text{Komisyon (Kuruş)} = \text{round}\left(\frac{\text{Sipariş Tutarı (Kuruş)} \times 1500}{10000}\right)$$

$$\text{Influencer Hakedişi (Kuruş)} = \text{Sipariş Tutarı (Kuruş)} - \text{Komisyon (Kuruş)}$$

Her durumda $\text{Komisyon} + \text{Hakediş} \equiv \text{Sipariş Tutarı}$ eşitliği matematiksel olarak korunur.

## 3. Doğrulanmış Hesaplama Tablosu

| Sipariş Tutarı (TL) | Kuruş (`minorUnits`) | %15 Komisyon (TL / Kuruş) | %85 Hakediş (TL / Kuruş) |
|---|---|---|---|
| 100,00 TL | `10000` | 15,00 TL (`1500`) | 85,00 TL (`8500`) |
| 1.000,00 TL | `100000` | 150,00 TL (`15000`) | 850,00 TL (`85000`) |
| 5.000,00 TL | `500000` | 750,00 TL (`75000`) | 4.250,00 TL (`425000`) |
| 10.000,00 TL | `1000000` | 1.500,00 TL (`150000`) | 8.500,00 TL (`850000`) |

## 4. Değiştirilemez Muhasebe Defteri (`influnex_financialLedger`)

- Finansal kayıtlar hiçbir zaman silinmez (`allow delete: if false`).
- İptal, kısmi iade veya fazla ödeme düzeltmeleri gerekçeli **ters kayıt (`REVERSAL` / `REFUND`)** ile muhasebeleştirilir.
- CSV ve Excel (UTF-8 BOM) dışa aktarımı desteklenir.
