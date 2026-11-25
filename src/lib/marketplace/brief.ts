import { z } from "zod";
import { formatTry } from "./catalog";

export const BriefDraftSchema = z.object({
  version: z.literal(1),
  goal: z.enum(["ugc", "influencer"]),
  brand: z.string().max(100),
  title: z.string().max(140),
  product: z.string().max(200),
  audience: z.string().max(400),
  deliverables: z.string().max(1500),
  platform: z.enum(["Instagram", "TikTok", "YouTube", "UGC"]),
  budget: z.number().int().min(500).max(1000000),
  deliveryDate: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/).refine((value) => {
    if (!value) return true;
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }),
  usage: z.enum(["organic", "ads-30", "ads-90"]),
  creatorId: z.string().max(60).nullable().default(null),
}).refine((value) => value.goal !== "influencer" || value.platform !== "UGC");
export type BriefDraft = z.infer<typeof BriefDraftSchema>;
export const emptyBrief: BriefDraft = { version: 1, goal: "ugc", brand: "", title: "", product: "", audience: "", deliverables: "", platform: "UGC", budget: 5000, deliveryDate: "", usage: "organic", creatorId: null };
export const usageLabels = { organic: "Markanın organik kanalları · 30 gün", "ads-30": "Organik + ücretli reklam · 30 gün", "ads-90": "Organik + ücretli reklam · 90 gün" };
export const briefTemplates: { id: string; name: string; description: string; values: Partial<BriefDraft> }[] = [
  { id: "experience", name: "Ürün deneyimi", description: "Doğal anlatım, gerçek kullanım", values: { goal: "ugc", title: "Ürün deneyimi videosu", platform: "UGC", deliverables: "1 adet 30–45 saniyelik dikey video (9:16). İlk 3 saniyede dikkat çeken bir giriş, ürünün kullanımını gösteren yakın planlar ve kapanış mesajı. Altyazı ve 1 revizyon dahil.", usage: "ads-30" } },
  { id: "launch", name: "Yeni ürün lansmanı", description: "Üreticinin kitlesiyle buluş", values: { goal: "influencer", title: "Yeni ürün lansman kampanyası", platform: "Instagram", deliverables: "1 adet 30–60 saniyelik Reels ve 3 kare hikâye. Ürünün öne çıkan özellikleri, kullanım deneyimi ve marka etiketi. Reklam / iş birliği açıklaması ve 1 revizyon dahil.", usage: "organic" } },
  { id: "review", name: "Detaylı inceleme", description: "Ürünün hikâyesine alan aç", values: { goal: "influencer", title: "Detaylı ürün incelemesi", platform: "YouTube", deliverables: "1 adet 3–5 dakikalık ürün inceleme videosu. Ürün kurulumu, kullanım senaryoları ve deneyim değerlendirmesi. Açıklama alanında marka bağlantısı, reklam açıklaması ve 1 revizyon dahil.", usage: "organic" } },
];

export function briefToText(draft: BriefDraft, creatorName?: string) {
  return ["INFLUNEX · KAMPANYA BRIEF TASLAĞI", "", `Marka: ${draft.brand}`, `Kampanya: ${draft.title}`, `Ürün / hizmet: ${draft.product}`, `Hedef kitle: ${draft.audience}`, `İş birliği: ${draft.goal === "ugc" ? "UGC · içerik teslimi" : "Influencer · üreticinin hesabında yayın"}`, `Platform: ${draft.platform}`, `Toplam bütçe: ${formatTry(draft.budget)}`, `Hedef teslim: ${draft.deliveryDate}`, `Talep edilen kullanım: ${usageLabels[draft.usage]}`, creatorName ? `İlgilenilen örnek profil: ${creatorName} (demo)` : "İçerik üreticisi: henüz seçilmedi", "", "İÇERİK BEKLENTİSİ", draft.deliverables, "", "Bu dosya bir planlama taslağıdır; kampanya yayınlanmamış, sipariş veya ödeme oluşturulmamıştır. Kullanım hakları, fiyat ve teslim şartları iş birliği öncesinde taraflarca onaylanmalıdır. Üyelik ücretsizdir; tamamlanan iş birliklerinde %15 platform komisyonu uygulanır."].join("\n");
}
