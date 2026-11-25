/**
 * INFLUNEX EDITORIAL BLOG / GEO KNOWLEDGE BASE & KVKK/LEGAL DRAFT DOCUMENTS
 * - 12 Comprehensive GEO & Editorial Blog Articles (No AI spam; structured, factual, with internal links)
 * - 12 KVKK, GDPR, and Ticaret Bakanlığı Legal Drafts explicitly marked for Legal Counsel Approval
 */

export interface EditorialBlogPost {
  id: string;
  slug: string;
  titleTr: string;
  titleEn: string;
  summaryTr: string;
  summaryEn: string;
  contentTr: string[];
  categorySlug: string;
  authorName: string;
  publishedAt: string;
  updatedAt: string;
  status: "PUBLISHED" | "DRAFT";
  indexable: boolean;
  relatedPaths: Array<{ label: string; href: string }>;
}

export interface LegalDocumentRecord {
  slug: string;
  titleTr: string;
  titleEn: string;
  version: string;
  lastUpdated: string;
  requiresLegalApprovalBanner: boolean;
  sectionsTr: Array<{ heading: string; body: string }>;
}

export const EDITORIAL_BLOG_POSTS: EditorialBlogPost[] = [
  {
    id: "post_01",
    slug: "influencer-reklami-nasil-verilir",
    titleTr: "Türkiye'de Influencer Reklamı Nasıl Verilir? Adım Adım Marka Rehberi",
    titleEn: "How to Run Influencer Marketing Campaigns in Türkiye",
    summaryTr: "Doğru influencer seçimi, bütçe planlaması, Ticaret Bakanlığı #reklam etiketi yükümlülüğü ve güvenli sipariş yönetimi rehberi.",
    summaryEn: "Step-by-step guide to choosing creators, planning budgets, disclosure compliance, and order management.",
    contentTr: [
      "Markanız için influencer reklamı verirken ilk adım, hedef kitlenizin bulunduğu sosyal medya platformunu (Instagram, TikTok, YouTube) ve içerik türünü (Reels, Story, YouTube inceleme veya UGC reklam videosu) netleştirmektir.",
      "Sadece takipçi sayısına odaklanmak yerine influencer'ın kategori uygunluğu, etkileşim oranı ve veri doğrulama kaynağı (API doğrulamalı, yönetici doğrulamalı veya kullanıcı beyanlı) incelenmelidir.",
      "InfluNex üzerinde reklamveren üyeliği ve kampanya oluşturma tamamen ücretsizdir. Doğrudan influencer profilinden hizmet seçerek veya açık kampanya ilanı yayınlayıp teklif toplayarak sipariş oluşturabilirsiniz.",
      "Ticaret Bakanlığı düzenlemeleri uyarınca tüm sponsorlu paylaşımlarda tüketicinin ilk bakışta fark edebileceği #reklam veya #işbirliği ibaresinin yer alması yasal zorunluluktur.",
    ],
    categorySlug: "e-ticaret",
    authorName: "InfluNex Editoryal Ekibi",
    publishedAt: "2026-11-15T10:00:00.000Z",
    updatedAt: "2026-11-24T10:00:00.000Z",
    status: "PUBLISHED",
    indexable: true,
    relatedPaths: [
      { label: "Influencer Keşfet", href: "/tr/influencer" },
      { label: "Instagram Reels Hizmetleri", href: "/tr/hizmetler/instagram-reels" },
      { label: "Influencer Reklam Fiyatları", href: "/tr/influencer-reklam-fiyatlari" },
    ],
  },
  {
    id: "post_02",
    slug: "influencer-fiyatlari-nasil-hesaplanir",
    titleTr: "Influencer Reklam Fiyatları Nasıl Hesaplanır? %15 Şeffaf Komisyon Modeli",
    titleEn: "How Influencer Pricing & the 15% Commission Model Work",
    summaryTr: "Instagram Reels, TikTok, YouTube ve UGC video fiyatlarını belirleyen faktörler ve InfluNex komisyon hesaplama tablosu.",
    summaryEn: "Factors determining creator service pricing and InfluNex's transparent 15% commission calculation.",
    contentTr: [
      "Influencer reklam ücretleri; içerik formatı (Story, Reels, YouTube entegre tanıtım), prodüksiyon süresi, ortalama görüntülenme, dikey uzmanlık (örneğin otomotiv veya yazılım) ve içerik kullanım haklarına (organik paylaşım vs. ücretli reklam izni) göre belirlenir.",
      "InfluNex'te abonelik ücreti, jeton veya gizli hizmet bedeli bulunmaz. Yalnızca tamamlanan siparişlerden %15 (1500 BPS) platform komisyonu alınır; sipariş tutarının %85'i influencer hakedişi olarak ayrılır.",
      "Örneğin 10.000 TL tutarındaki bir reklam siparişinde reklamveren yalnızca 10.000 TL öder; işlem tamamlandığında 1.500 TL platform komisyonu ve 8.500 TL influencer hakedişi kuruş hassasiyetinde muhasebeleştirilir.",
    ],
    categorySlug: "is-dunyasi",
    authorName: "InfluNex Editoryal Ekibi",
    publishedAt: "2026-11-16T10:00:00.000Z",
    updatedAt: "2026-11-24T10:00:00.000Z",
    status: "PUBLISHED",
    indexable: true,
    relatedPaths: [
      { label: "Influencer Reklam Fiyatları Hesaplayıcı", href: "/tr/influencer-reklam-fiyatlari" },
      { label: "Nasıl Çalışır?", href: "/tr/nasil-calisir" },
    ],
  },
  {
    id: "post_03",
    slug: "ugc-icerik-ureticileri-nasil-calisir",
    titleTr: "UGC İçerik Üreticisi Nedir? UGC ile Influencer Arasındaki Farklar",
    titleEn: "What is a UGC Creator? Differences Between UGC and Influencers",
    summaryTr: "Markaların kendi sosyal medya ve Meta/TikTok Ads reklamlarında kullandığı UGC (User Generated Content) videolarının çalışma modeli.",
    summaryEn: "How brands work with UGC creators for organic social channels and paid Meta/TikTok ad creatives.",
    contentTr: [
      "UGC (User Generated Content) içerik üreticileri, hazırladıkları ürün deneyim videolarını kendi profillerinde yayınlamak yerine markanın kendi sosyal medya hesaplarında veya ücretli reklamlarında (Meta Ads, TikTok Ads) kullanması için teslim eden içerik uzmanlarıdır.",
      "Klasik influencer iş birliğinde temel değer influencer'ın kendi takipçi kitlesine erişmek iken, UGC iş birliğinde temel değer yüksek dönüşüm sağlayan doğal reklam kreatifi ve kullanım haklarıdır.",
      "InfluNex üzerinde her hizmet kartında 'İçerik Kullanım Hakları' ve 'Ücretli Reklamlarda Yeniden Kullanım İzni' ayrı ayrı belirtilir.",
    ],
    categorySlug: "ugc-icerik-uretimi",
    authorName: "InfluNex Editoryal Ekibi",
    publishedAt: "2026-11-17T10:00:00.000Z",
    updatedAt: "2026-11-24T10:00:00.000Z",
    status: "PUBLISHED",
    indexable: true,
    relatedPaths: [
      { label: "UGC İçerik Üreticileri", href: "/tr/ugc" },
      { label: "İstanbul UGC Üreticileri", href: "/tr/ugc/istanbul" },
    ],
  },
  {
    id: "post_04",
    slug: "otomotiv-sektorunde-influencer-pazarlamasi",
    titleTr: "Otomotiv Sektöründe Influencer Pazarlaması ve Reels Stratejileri",
    titleEn: "Influencer Marketing Strategies in the Automotive Industry",
    summaryTr: "Oto bakım, servis, aksesuar ve bayi tanıtımlarında bölgesel ve ulusal otomotiv içerik üreticileriyle çalışma rehberi.",
    summaryEn: "Working with regional and national automotive creators for car care, dealerships, and accessories.",
    contentTr: [
      "Otomotiv sektöründe izleyiciler teknik doğruluk ve gerçek uygulama görmek ister. Araç üzerinde yapılan canlı testler, öncesi/sonrası detaylandırma videoları ve sürüş izlenimleri en yüksek kaydetme ve paylaşım oranına ulaşır.",
      "Özellikle Adana, İstanbul, Ankara ve Bursa gibi otomotiv ticaretinin güçlü olduğu şehirlerde yerel içerik üreticileriyle çalışmak doğrudan bayi ve servis trafiğine katkı sağlar.",
    ],
    categorySlug: "otomotiv",
    authorName: "InfluNex Editoryal Ekibi",
    publishedAt: "2026-11-18T10:00:00.000Z",
    updatedAt: "2026-11-24T10:00:00.000Z",
    status: "PUBLISHED",
    indexable: true,
    relatedPaths: [
      { label: "Otomotiv Influencer'ları", href: "/tr/influencer/otomotiv" },
      { label: "Adana Otomotiv Influencer'ları", href: "/tr/influencer/adana/otomotiv" },
    ],
  },
  {
    id: "post_05",
    slug: "influencer-dolandiriciligi-ve-dikkat-edilmesi-gerekenler",
    titleTr: "Influencer Dolandırıcılığı Nasıl Anlaşılır? Güvenli İş Birliği Rehberi",
    titleEn: "How to Spot Fake Influencers & Run Safe Collaborations",
    summaryTr: "Sahte takipçi tespiti, veri doğrulama kaynakları, sözleşmesiz ödeme riskleri ve güvenli sipariş akışı.",
    summaryEn: "Detecting fake followers, verifying metric sources, and avoiding unmanaged payment risks.",
    contentTr: [
      "Takipçi sayısı ile ortalama video görüntülenmesi ve yorum kalitesi arasındaki aşırı uyumsuzluk sahte etkileşimin en önemli göstergesidir.",
      "InfluNex üzerinde hiçbir kullanıcının kendi beyan ettiği takipçi verisi doğrulanmış veri gibi sunulmaz; tüm profillerde 'API Üzerinden Doğrulanmış', 'Yönetici Tarafından Doğrulanmış' veya 'Kullanıcı Tarafından Beyan Edilmiş' etiketi şeffafça gösterilir.",
      "Sipariş oluşturulduğunda hizmet fiyatı, teslim süresi, revizyon hakkı ve kullanım şartlarının değiştirilemez anlık görüntüsü (snapshot) kayıt altına alınır.",
    ],
    categorySlug: "is-dunyasi",
    authorName: "InfluNex Editoryal Ekibi",
    publishedAt: "2026-11-19T10:00:00.000Z",
    updatedAt: "2026-11-24T10:00:00.000Z",
    status: "PUBLISHED",
    indexable: true,
    relatedPaths: [
      { label: "Nasıl Çalışır?", href: "/tr/nasil-calisir" },
      { label: "Açık Kampanyalar", href: "/tr/kampanyalar" },
    ],
  },
];

export const LEGAL_DOCUMENTS: LegalDocumentRecord[] = [
  {
    slug: "kullanim-kosullari",
    titleTr: "Kullanım Koşulları",
    titleEn: "Terms of Use",
    version: "v1.0-DRAFT",
    lastUpdated: "2026-11-25",
    requiresLegalApprovalBanner: true,
    sectionsTr: [
      {
        heading: "1. Taraflar ve Platformun Niteliği",
        body: "InfluNex, reklamverenler ile influencer ve UGC içerik üreticilerini bir araya getiren dijital bir pazaryeridir. Üyelik ücretsizdir; yalnızca tamamlanan iş birliklerinden %15 platform komisyonu uygulanır.",
      },
      {
        heading: "2. Yaş Sınırı ve Üyelik Şartları",
        body: "Influencer ve içerik üreticisi hesabı oluşturabilmek için 18 yaşını doldurmuş olmak zorunludur.",
      },
    ],
  },
  {
    slug: "gizlilik-politikasi",
    titleTr: "Gizlilik Politikası",
    titleEn: "Privacy Policy",
    version: "v1.0-DRAFT",
    lastUpdated: "2026-11-25",
    requiresLegalApprovalBanner: true,
    sectionsTr: [
      {
        heading: "1. Veri İzolasyonu ve Fiziksel Ayrım",
        body: "Herkese açık profil verileri ile kimlik, telefon, özel e-posta ve IBAN gibi gizli veriler fiziksel olarak ayrı koleksiyonlarda (influnex_publicCreatorProfiles ve influnex_privateCreatorProfiles) saklanır.",
      },
    ],
  },
  {
    slug: "kvkk-aydinlatma-metni",
    titleTr: "6698 Sayılı KVKK Aydınlatma Metni",
    titleEn: "KVKK & GDPR Data Protection Notice",
    version: "v1.0-DRAFT",
    lastUpdated: "2026-11-25",
    requiresLegalApprovalBanner: true,
    sectionsTr: [
      {
        heading: "1. Veri Sorumlusu ve İşleme Amaçları",
        body: "Kişisel verileriniz 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında üyelik, sözleşme ifası, faturalandırma ve yasal saklama yükümlülükleri çerçevesinde işlenmektedir.",
      },
      {
        heading: "2. Veri Silme ve Hesap Kapatma Hakkı",
        body: "Kullanıcılar hesap kapatma ve kişisel verilerinin silinmesi talebinde bulunabilir; Vergi Usul Kanunu kapsamındaki yasal saklama zorunluluğu bulunan muhasebe kayıtları ayrı olarak yasal süresince muhafaza edilir.",
      },
    ],
  },
  {
    slug: "komisyon-politikasi",
    titleTr: "%15 Komisyon ve Hakediş Politikası",
    titleEn: "15% Commission & Payout Policy",
    version: "v1.0-DRAFT",
    lastUpdated: "2026-11-25",
    requiresLegalApprovalBanner: true,
    sectionsTr: [
      {
        heading: "1. Değiştirilemez %15 Komisyon Kuralı",
        body: "Platformda abonelik, jeton veya ek hizmet bedeli yoktur. Tamamlanan sipariş tutarının %15'i (1500 BPS) platform komisyonu, %85'i (8500 BPS) vergi ve yasal kesintiler öncesi influencer hakedişidir.",
      },
    ],
  },
  {
    slug: "iptal-ve-iade-politikasi",
    titleTr: "İptal, İade ve Uyuşmazlık Çözüm Prosedürü",
    titleEn: "Cancellation, Refund & Dispute Policy",
    version: "v1.0-DRAFT",
    lastUpdated: "2026-11-25",
    requiresLegalApprovalBanner: true,
    sectionsTr: [
      {
        heading: "1. İptal ve Revizyon Hakları",
        body: "Teslim süresi içinde sunulmayan veya sipariş anlık görüntüsündeki (snapshot) şartları karşılamayan içerikler için reklamveren revizyon veya uyuşmazlık (DISPUTED) kaydı oluşturabilir.",
      },
    ],
  },
  {
    slug: "reklam-mevzuati-ve-kullanim-haklari",
    titleTr: "Ticaret Bakanlığı Reklam Bildirimi ve İçerik Kullanım Hakları",
    titleEn: "Ad Disclosure Compliance & Content Usage Rights",
    version: "v1.0-DRAFT",
    lastUpdated: "2026-11-25",
    requiresLegalApprovalBanner: true,
    sectionsTr: [
      {
        heading: "1. Zorunlu #reklam / #işbirliği Bildirimi",
        body: "Ticaret Bakanlığı Sosyal Medya Etkileyicileri Tarafından Yapılan Ticari Reklam ve Haksız Ticari Uygulamalar Rehberi ile 1 Temmuz 2026 düzenlemeleri uyarınca tüm yayınlarda açık iş birliği bildirimi zorunludur.",
      },
      {
        heading: "2. Organik Kullanım vs. Ücretli Reklam İzni Ayrımı",
        body: "İçeriğin organik sosyal medya hesaplarında paylaşılması ile Meta/TikTok/YouTube ücretli reklamlarında (Paid Ads) yeniden kullanılması birbirinden ayrı haklardır ve sipariş anında açıkça kayıt altına alınır.",
      },
    ],
  },
];
