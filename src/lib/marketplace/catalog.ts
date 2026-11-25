export const categories = ["Tümü", "Moda & Yaşam", "Güzellik", "Teknoloji", "Gastronomi", "Seyahat", "Otomotiv"] as const;
export const platforms = ["Instagram", "TikTok", "YouTube", "UGC"] as const;
export type Platform = (typeof platforms)[number];

export interface CreatorPreview {
  id: string;
  name: string;
  category: string;
  city: string;
  platforms: Platform[];
  followers: number;
  engagement: number;
  price: number;
  deliveryDays: number;
  image: string;
  bio: string;
  service: string;
}

// Illustrative catalog only. These are not registered people or verified metrics.
export const demoCreators: CreatorPreview[] = [
  { id: "demo-ada", name: "Ada K.", category: "Moda & Yaşam", city: "İstanbul", platforms: ["Instagram", "UGC"], followers: 42500, engagement: 4.8, price: 2500, deliveryDays: 5, image: "photo-1494790108377-be9c29b29330", bio: "Günlük kombinler, zamansız parçalar ve doğal bir anlatım. Moda ve yaşam tarzı markaları için hikâye odaklı içerikler.", service: "1 dikey video · 30–45 saniye · 1 revizyon" },
  { id: "demo-emre", name: "Emre A.", category: "Teknoloji", city: "Ankara", platforms: ["YouTube", "Instagram"], followers: 86000, engagement: 5.2, price: 5000, deliveryDays: 7, image: "photo-1500648767791-00dcc994a43e", bio: "Teknolojiyi herkesin anlayacağı bir dille anlatan ürün incelemeleri ve günlük kullanım deneyimleri.", service: "1 ürün inceleme videosu · 3–5 dakika · 1 revizyon" },
  { id: "demo-deniz", name: "Deniz S.", category: "Gastronomi", city: "İzmir", platforms: ["TikTok", "UGC"], followers: 28400, engagement: 6.1, price: 1500, deliveryDays: 3, image: "photo-1534528741775-53994a69daeb", bio: "Pratik tarifler ve yeni lezzet keşifleri. Mutfakta gerçek kullanım deneyimiyle ürününüzü öne çıkaran içerikler.", service: "1 tarif videosu · 30–60 saniye · 1 revizyon" },
  { id: "demo-selin", name: "Selin Y.", category: "Güzellik", city: "İstanbul", platforms: ["Instagram", "TikTok", "UGC"], followers: 56300, engagement: 4.3, price: 3500, deliveryDays: 4, image: "photo-1524504388940-b1c1722653e1", bio: "Cilt bakımı rutinleri ve sade makyaj içerikleri. Ürünün dokusunu ve kullanımını yakından gösteren dikey videolar.", service: "1 ürün deneyim videosu · 30 saniye · 2 revizyon" },
  { id: "demo-can", name: "Can B.", category: "Seyahat", city: "Antalya", platforms: ["Instagram", "YouTube"], followers: 67200, engagement: 3.9, price: 4500, deliveryDays: 7, image: "photo-1506794778202-cad84cf45f1d", bio: "Şehir rotaları, yerel deneyimler ve doğa kaçamakları. Mekânın ruhunu yansıtan görsel hikâyeler.", service: "1 rota videosu · 45–60 saniye · 1 revizyon" },
  { id: "demo-mert", name: "Mert E.", category: "Otomotiv", city: "Bursa", platforms: ["YouTube", "TikTok"], followers: 114000, engagement: 4.6, price: 6000, deliveryDays: 6, image: "photo-1519085360753-af0119f7cbe7", bio: "Araç deneyimleri ve otomobil aksesuarları. Teknik detayları gündelik hayatla buluşturan ürün anlatımları.", service: "1 tanıtım videosu · 60 saniye · 1 revizyon" },
];

export const formatTry = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
export const formatFollowers = (value: number) => new Intl.NumberFormat("tr-TR", { notation: "compact", maximumFractionDigits: 1 }).format(value);
export const photoUrl = (image: string, width = 600) => `https://images.unsplash.com/${image}?auto=format&fit=crop&w=${width}&q=80`;

export interface DiscoveryFilters {
  query: string;
  category: string;
  platform: string;
  city: string;
  maxPrice: number;
  favoritesOnly: boolean;
  favoriteIds: string[];
  sort: string;
}

export function filterCreators(creators: CreatorPreview[], filters: DiscoveryFilters) {
  const query = filters.query.trim().toLocaleLowerCase("tr-TR");
  const result = creators.filter((creator) =>
    (!query || `${creator.name} ${creator.category} ${creator.city}`.toLocaleLowerCase("tr-TR").includes(query)) &&
    (filters.category === "Tümü" || creator.category === filters.category) &&
    (!filters.platform || creator.platforms.includes(filters.platform as Platform)) &&
    (!filters.city || creator.city === filters.city) &&
    creator.price <= filters.maxPrice &&
    (!filters.favoritesOnly || filters.favoriteIds.includes(creator.id)),
  );
  if (filters.sort === "price-asc") result.sort((a, b) => a.price - b.price);
  if (filters.sort === "delivery") result.sort((a, b) => a.deliveryDays - b.deliveryDays);
  if (filters.sort === "followers") result.sort((a, b) => b.followers - a.followers);
  return result;
}
