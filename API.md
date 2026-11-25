# InfluNex — REST API v1, CLI, MCP ve Firmanex Entegrasyonu (API.md)

## 1. REST API v1 Endpoint'leri

Tüm uç noktalar JSON döndürür, Zod ile doğrulanır ve `Cache-Control: no-store` başlığı taşır:

| Metod | Endpoint | Yetki | Açıklama |
|---|---|---|---|
| `GET` | `/api/v1/creators` | Public | Çoklu filtre (şehir, kategori, platform, bütçe, UGC, doğrulanmış) ve sıralama ile influencer listesi |
| `GET` | `/api/v1/creators/:id` | Public | Kullanıcı adı veya ID ile influencer profili, sosyal hesapları ve aktif hizmetleri |
| `GET` | `/api/v1/categories` | Public | 25 kategori ve SEO metadata listesi |
| `GET` | `/api/v1/campaigns` | Public | Açık reklam kampanyaları listesi |
| `POST` | `/api/v1/campaigns` | Advertiser | Yeni reklam kampanyası oluşturma (Zod doğrulamalı) |
| `POST` | `/api/v1/proposals` | Creator | Kampanyaya fiyat (kuruş), teslim süresi ve açıklama ile teklif verme |
| `POST` | `/api/v1/orders` | Advertiser | Doğrudan hizmet satın alma veya teklif kabulü ile güvenli sipariş oluşturma (`INF-2026-XXXXXX`) |
| `GET` | `/api/v1/orders/:id` | Participant / Admin | Sipariş detayı, %15 komisyon / %85 hakediş dökümü ve state machine geçmişi |
| `POST` | `/api/v1/orders/:id` | Participant / Admin | Yetkili state machine geçişi (dekont yükleme, ödeme onayı, içerik teslimi, revizyon, tamamlama) |
| `POST` | `/api/v1/recommendations` | Public / Advertiser | Doğal dil sorgusuyla gerçek platform verileri üzerinden açıklamalı AI influencer önerisi |
| `POST` | `/api/v1/campaigns/ai-draft` | Advertiser | SSRF korumalı marka URL ve bütçe analiziyle AI kampanya taslağı oluşturma |
| `GET` | `/api/v1/openapi` | Public | OpenAPI 3.1.0 JSON spesifikasyonu |
| `POST` | `/api/v1/firmanex/webhook` | Signed Partner | Firmanex işletmelerinin kullanıcı onaylı kampanya ve hesap bağlantısı |

## 2. Gelecek CLI ve MCP Araç Eşlemesi

REST API v1 doğrudan şu MCP araçlarını besleyecek şekilde tasarlanmıştır:
- `search_creators` -> `GET /api/v1/creators`
- `get_creator_profile` -> `GET /api/v1/creators/:id`
- `list_services` -> `GET /api/v1/creators/:id` (`services`)
- `recommend_creators` -> `POST /api/v1/recommendations`
- `list_campaigns` -> `GET /api/v1/campaigns`
- `create_campaign_draft` -> `POST /api/v1/campaigns/ai-draft`
- `get_order_status` -> `GET /api/v1/orders/:id`
