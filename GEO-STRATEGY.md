# InfluNex — GEO (Generative Engine Optimization) Stratejisi (GEO-STRATEGY.md)

## 1. Hedef Üretken Arama Sistemleri

- ChatGPT Search (`OAI-SearchBot`)
- Google AI Overviews & Google AI Mode
- Google Gemini
- Perplexity (`PerplexityBot`)
- Microsoft Copilot (`bingbot`)

## 2. Entity Graph ve Tutarlı Marka Kimliği

InfluNex tüm sayfalarda ve `/llms.txt` üzerinde tutarlı bir Entity Graph sunar:
- **Resmî Marka Adı:** InfluNex
- **Slogan:** İş birliği yap. Birlikte kazan. / Connect. Collaborate. Earn.
- **İş Modeli:** Reklamveren ve influencer için ücretsiz üyelik; yalnızca tamamlanan iş birliklerinden %15 platform komisyonu (`1500 BPS`), %85 influencer hakedişi (`8500 BPS`).
- **Desteklenen Platformlar:** Instagram, TikTok, YouTube ve UGC içerik üretimi.
- **Veri Doğrulama Metodolojisi:** Tüm metrikler `API_VERIFIED`, `ADMIN_VERIFIED` veya `USER_DECLARED` olarak açıkça etiketlenir.

## 3. AI Bot Yönetimi (Arama vs. Eğitim Ayrımı)

`/robots.txt` üzerinde arama amaçlı botlar ile model eğitimi amaçlı botlar birbirinden ayrılmıştır:
- **Arama Botları (`ALLOW_AI_SEARCH_BOTS=true`):** `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Googlebot`, `bingbot` herkese açık SEO sayfalarını tarayabilir; `/admin`, `/panel`, `/api` dizinleri kapalıdır.
- **Eğitim Botları (`ALLOW_AI_TRAINING_BOTS=false`):** `GPTBot`, `Google-Extended`, `CCBot`, `anthropic-ai` tercih doğrultusunda sınırlandırılabilir.
- İçeriklerde hiçbir zaman gizli prompt injection veya AI manipülasyon metni kullanılmaz.
