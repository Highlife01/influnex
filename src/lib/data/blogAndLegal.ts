/**
 * INFLUNEX EDITORIAL BLOG / GEO KNOWLEDGE BASE & COMPREHENSIVE MARKETPLACE LEGAL DOCUMENTS
 * - 12 Editorial Blog & GEO Guides
 * - Full Marketplace Legal & KVKK Governance Clauses (Delivery/acceptance, revisions, delay, cancellation,
 *   defective content, brand safety, #reklam disclosure, 3rd-party music/IP rights, exclusivity,
 *   usage channel/duration/geography, archiving, dispute resolution, platform liability limits,
 *   and KVKK data controller, retention periods, recipient groups, and application channels).
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
      "InfluNex'te abonelik ücreti, jeton veya gizli hizmet bedeli bulunmaz. Yalnızca tamamlanan siparişlerin vergi hariç brüt hizmet bedeli üzerinden %15 (1500 BPS) platform komisyonu alınır; sipariş tutarının %85'i vergi ve stopaj yükümlülükleri öncesi brüt üretici hakedişi olarak ayrılır.",
      "Örneğin 10.000 TL brüt hizmet bedelli bir reklam siparişinde işlem tamamlandığında 1.500 TL platform komisyonu ve 8.500 TL üretici brüt hakedişi kuruş hassasiyetinde muhasebeleştirilir.",
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
      "InfluNex üzerinde her hizmet kartında Yayın Kanalı, Süre, Coğrafya, Münhasırlık ve Ücretli Reklamlarda (Paid Ads) Yeniden Kullanım İzni ayrı satırlarda belirtilir.",
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
      "InfluNex üzerinde hiçbir kullanıcının kendi beyan ettiği takipçi verisi doğrulanmış veri gibi sunulmaz; tüm profillerde 'API Üzerinden Doğrulanmış', 'Yönetici Tarafından Doğrulanmış' veya 'Kullanıcı Tarafından Beyan Edilmiş' etiketi ve son güncelleme tarihi şeffafça gösterilir.",
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
    titleTr: "Kullanım Koşulları ve Pazaryeri İşleyiş Sözleşmesi",
    titleEn: "Terms of Use & Marketplace Agreement",
    version: "v1.1-PRE-LAUNCH-DRAFT",
    lastUpdated: "2026-11-25",
    requiresLegalApprovalBanner: true,
    sectionsTr: [
      {
        heading: "1. Taraflar, Platformun Hukuki Niteliği ve Sorumluluk Sınırı",
        body: "InfluNex, reklamverenler (Marka/İşletme) ile içerik üreticilerini (Influencer/UGC Üreticisi) bir araya getiren dijital bir pazaryeri altyapısıdır. Şirket unvanı ve MERSİS kaydı canlı ticari aktivasyon öncesinde ilgili ortam değişkenleriyle yürürlüğe girer. Platform, üretilen içeriğin editoryal görüşlerinden veya üçüncü taraf platform (Instagram, TikTok, YouTube) algoritma değişikliklerinden sorumlu tutulamaz.",
      },
      {
        heading: "2. Yaş Sınırı (18+) ve Hesap Doğrulama",
        body: "İçerik üreticisi hesabı oluşturabilmek ve hakediş ödemesi alabilmek için 18 yaşını doldurmuş olmak ve kimlik/vergi statüsü doğrulamasını tamamlamak zorunludur. Yanlış rol seçen kullanıcılar hesap panelinden rol değişikliği talebinde bulunabilir.",
      },
      {
        heading: "3. Hizmetin Teslim, İnceleme ve Kabul Kriterleri",
        body: "Üretici, sipariş anında sabitlenen anlık görüntüdeki (Order Snapshot) teslim tarihine ve brief şartlarına uygun taslak içeriği sipariş odasına yükler (CONTENT_SUBMITTED). Reklamveren teslimden itibaren 5 iş günü içinde onay verir (CONTENT_APPROVED), revizyon talep eder (REVISION_REQUESTED) veya gerekçeli uyuşmazlık açar (DISPUTED).",
      },
      {
        heading: "4. Revizyon Hakkı, Gecikme ve Ayıplı İçerik",
        body: "Her hizmet paketinde taahhüt edilen revizyon sayısı sipariş anında sabitlenir. Brief'e açıkça aykırı, teknik olarak bozuk veya yasal reklam etiketi eksik içerikler ayıplı teslim sayılır ve revizyon hakkı düşülmeden düzeltilir. Teslim süresinin mücbir sebep olmaksızın aşılması halinde reklamveren siparişi kesintisiz iptal edebilir.",
      },
      {
        heading: "5. Marka Güvenliği, Müzik ve Üçüncü Taraf Telif Hakları",
        body: "Üretici; içerikte kullandığı müzik, görsel, font ve mekanların ticari/reklam kullanımına uygun telif haklarına sahip olduğunu veya platformun ticari ses kütüphanesini kullandığını taahhüt eder. Üçüncü taraf telif ihlallerinden doğacak sorumluluk içeriği üreten tarafa aittir.",
      },
    ],
  },
  {
    slug: "gizlilik-politikasi",
    titleTr: "Gizlilik ve Veri İzolasyonu Politikası",
    titleEn: "Privacy & Data Isolation Policy",
    version: "v1.1-PRE-LAUNCH-DRAFT",
    lastUpdated: "2026-11-25",
    requiresLegalApprovalBanner: true,
    sectionsTr: [
      {
        heading: "1. 4 Katmanlı Veri İzolasyonu ve Fiziksel Ayrım",
        body: "Herkese açık profil verileri (influnex_publicCreatorProfiles) ile kimlik, telefon, özel e-posta ve IBAN gibi gizli veriler (influnex_privateCreatorProfiles) izole influnex-db veritabanında fiziksel olarak ayrı koleksiyonlarda saklanır.",
      },
      {
        heading: "2. Google OAuth ile Alınan Veriler",
        body: "Google ile giriş yapıldığında yalnızca doğrulanmış e-posta adresi, ad-soyad ve profil fotoğrafı bilgisi alınır. Hiçbir sosyal medya hesabının şifresi istenmez veya saklanmaz.",
      },
      {
        heading: "3. Çerezler ve Analitik",
        body: "Zorunlu oturum çerezleri haricindeki analitik ölçümlerde (GA4) hiçbir zaman ad, telefon, IBAN, e-posta veya özel mesaj içeriği aktarılmaz.",
      },
    ],
  },
  {
    slug: "kvkk-aydinlatma-metni",
    titleTr: "6698 Sayılı KVKK Aydınlatma Metni",
    titleEn: "KVKK & GDPR Data Protection Notice",
    version: "v1.1-PRE-LAUNCH-DRAFT",
    lastUpdated: "2026-11-25",
    requiresLegalApprovalBanner: true,
    sectionsTr: [
      {
        heading: "1. Veri Sorumlusu ve İşleme Amaçları",
        body: "Kişisel verileriniz 6698 sayılı Kişisel Verilerin Korunması Kanunu Madde 5/2 (c) sözleşmenin kurulması ve ifası ile (ç) hukuki yükümlülüğün yerine getirilmesi hukuki sebeplerine dayanılarak; üyelik, sipariş takibi, faturalandırma ve denetim izi oluşturulması amacıyla işlenmektedir.",
      },
      {
        heading: "2. Aktarım Alıcı Grupları",
        body: "Kişisel verileriniz yalnızca yasal yükümlülükler kapsamında yetkili kamu kurumlarına (Gelir İdaresi Başkanlığı, Ticaret Bakanlığı), ödeme/banka mutabakatı için anlaşmalı bankalara ve bulut altyapı sağlayıcısına (Google Cloud / Firebase) güvenlik kuralları çerçevesinde aktarılır.",
      },
      {
        heading: "3. Saklama Süreleri ve Hesap Silme Başvuru Kanalı",
        body: "Üyelik ve profil verileri hesap kapatma talebinden itibaren 30 gün içinde silinir veya anonimleştirilir. 213 sayılı Vergi Usul Kanunu ve 6102 sayılı TTK gereği fatura, dekont ve muhasebe defteri (financialLedger) kayıtları 10 yıl süreyle ayrı ve izole olarak saklanır.",
      },
    ],
  },
  {
    slug: "komisyon-politikasi",
    titleTr: "%15 Komisyon, Tahsilat, Bloke ve Hakediş Politikası",
    titleEn: "15% Commission, Escrow Block & Payout Policy",
    version: "v1.1-PRE-LAUNCH-DRAFT",
    lastUpdated: "2026-11-25",
    requiresLegalApprovalBanner: true,
    sectionsTr: [
      {
        heading: "1. Komisyon Hesaplama Tabanı (%15 / 1500 BPS)",
        body: "Platformda abonelik, jeton veya listeleme ücreti yoktur. %15 platform komisyonu, yalnızca başarıyla tamamlanan (COMPLETED) siparişin vergi hariç brüt hizmet bedeli üzerinden kuruş (integer minor units) hassasiyetinde hesaplanır.",
      },
      {
        heading: "2. %85 Üretici Brüt Hakedişi ve Vergi/Stopaj Durumu",
        body: "Tamamlanan sipariş tutarının %85'i (8500 BPS) üretici brüt hakedişidir. Üreticinin vergi mükellefiyet statüsüne (şirket faturası veya bireysel istisna/stopaj belgesi) göre uygulanacak yasal vergi, KDV veya stopaj kesintileri ayrı muhasebe kaleminde yasal mevzuata göre yönetilir.",
      },
      {
        heading: "3. Banka Havalesi/EFT/FAST, Dekont Eşleştirme ve Bloke Süreci",
        body: "1) Reklamveren ödemeyi benzersiz sipariş kodu (Örn: INF-2026-000001) açıklamasıyla şirket banka hesabına gönderir ve dekont yükler (PAYMENT_REVIEW). 2) Yönetici banka hareketini ve tekil banka referans numarasını onayladığında sipariş PAID durumuna geçer ve tutar muhasebe kaydında iş tamamlanana kadar bloke edilir. 3) İçerik teslim edilip onaylandığında ve yayın doğrulandığında (COMPLETED), %85 hakediş üretici ödeme kuyruğuna (PAYOUT_PENDING) aktarılır.",
      },
    ],
  },
  {
    slug: "iptal-ve-iade-politikasi",
    titleTr: "İptal, İade ve Uyuşmazlık Çözüm Prosedürü",
    titleEn: "Cancellation, Refund & Dispute Policy",
    version: "v1.1-PRE-LAUNCH-DRAFT",
    lastUpdated: "2026-11-25",
    requiresLegalApprovalBanner: true,
    sectionsTr: [
      {
        heading: "1. Tam İptal ve %0 Komisyon Kuralı",
        body: "Üretici işe başlamadan (PAID aşamasında) veya teslim süresi aşıldığı için iptal edilen siparişlerde reklamverene ödediği tutarın %100'ü banka hesabına iade edilir; platform bu işlemden hiçbir komisyon kesmez.",
      },
      {
        heading: "2. Kısmi İade ve Uyuşmazlık Hakemliği",
        body: "İçerik teslim edilmiş ancak brief şartlarının bir kısmı eksik kalmışsa taraflar uyuşmazlık (DISPUTED) açabilir. Yönetici; sipariş snapshot'ını, mesaj kayıtlarını ve teslim edilen dosyaları inceleyerek tam iade, kısmi iade veya hakediş onayı kararı verir.",
      },
    ],
  },
  {
    slug: "reklam-mevzuati-ve-kullanim-haklari",
    titleTr: "Ticaret Bakanlığı Reklam Bildirimi ve İçerik Kullanım Hakları",
    titleEn: "Ad Disclosure Compliance & Content Usage Rights",
    version: "v1.1-PRE-LAUNCH-DRAFT",
    lastUpdated: "2026-11-25",
    requiresLegalApprovalBanner: true,
    sectionsTr: [
      {
        heading: "1. Zorunlu #reklam / #işbirliği Bildirimi",
        body: "Ticaret Bakanlığı Sosyal Medya Etkileyicileri Tarafından Yapılan Ticari Reklam ve Haksız Ticari Uygulamalar Rehberi ile 1 Temmuz 2026 düzenlemeleri uyarınca tüm yayınlarda açık ve görünür #reklam veya #işbirliği bildirimi zorunludur. Bu etiket doğrulanmadan sipariş PUBLISHED durumuna geçemez.",
      },
      {
        heading: "2. 6 Boyutlu İçerik Kullanım Hakkı Matrisi ve Arşivleme",
        body: "Her siparişte; 1) Yayın Kanalı, 2) Lisans ve Yayında Kalma Süresi, 3) Organik Paylaşım vs. Ücretli Reklam (Paid Ads) İzni, 4) Coğrafi Kapsam, 5) Kategori Münhasırlığı (Exclusivity) ve 6) Yeniden Kullanım hakları ayrı ayrı tanımlanır. Üretici, taahhüt edilen yayında kalma süresi dolmadan içeriği arşivleyemez veya silemez.",
      },
    ],
  },
];
