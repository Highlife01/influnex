import type { Metadata } from "next";
import { Check, ShieldCheck, Sparkles, Camera, FileText, Heart, ChevronDown } from "lucide-react";
import { Navigation } from "@/components/home/navigation";
import { Marketplace } from "@/components/home/marketplace";
import { Workflow, EarningsCalculator } from "@/components/home/workflow";
import { faqs } from "@/lib/marketplace/content";

export const metadata: Metadata = {
  title: "Influencer keşfet, iş birliğini planla",
  description: "Influencer ve UGC içerik üreticilerini keşfet, örnek profilleri karşılaştır ve kampanya brief’ini hazırla. InfluNex: ücretsiz üyelik, tamamlanan işte %15 komisyon modeli.",
  alternates: { canonical: "/tr", languages: { tr: "/tr", en: "/en", "x-default": "/tr" } },
  openGraph: { title: "InfluNex · İş birliği yap. Birlikte kazan.", description: "Doğru içerik üreticisini keşfet, bir sonraki iş birliğini planla.", locale: "tr_TR", type: "website", url: "/tr" },
};

export default function TurkishHomePage() {
  return (
    <div className="marketplace-home">
      <a className="skip-link" href="#main">İçeriğe geç</a>
      <Navigation />
      <main id="main">
        <section className="hero shell">
          <div className="hero-text">
            <div className="eyebrow"><Sparkles size={15} />Markalarla yaratıcı insanların buluşma noktası</div>
            <h1>İş birliği yap.<br /><span>Birlikte kazan.</span></h1>
            <p className="hero-copy">Markanın hikâyesini doğru insanlarla anlat. Influencer ve UGC üreticilerini keşfet, bir sonraki güzel iş birliğini planla.</p>
            <div className="hero-actions"><a className="primary-button" href="/tr/kayit?role=ADVERTISER">Reklamveren olarak katıl</a><a className="secondary-button" href="/tr/kayit?role=CREATOR">Yayıncı olarak katıl</a></div>
            <div className="trust-row"><span><Check size={16} />Ücretsiz üyelik modeli</span><span><Check size={16} />Abonelik yok</span><span><Check size={16} />Tamamlanan işte %15</span></div>
          </div>
          <div className="hero-visual" aria-label="İçerik üreticilerini temsil eden görseller">
            <div className="visual-orbit" />
            <div className="float-card"><span className="float-icon"><Heart size={20} /></span><div>Doğru insan.<br /><span>Güzel iş birliği.</span></div></div>
            <div className="portrait-main"><span className="portrait-label"><Camera size={15} />Yaşamın içinden içerikler</span></div>
            <div className="portrait-small"><span className="portrait-label">Bir fikirle başlar.</span></div>
            <div className="commission-card"><small>Üreticinin payı</small><strong>%85<span>senin.</span></strong></div>
            <span className="hero-image-note">Temsili görseller</span>
          </div>
        </section>
        <div className="value-strip"><div className="shell"><span><Camera size={19} />Instagram · TikTok · YouTube · UGC</span><span><FileText size={19} />Bir brief, net beklentiler</span><span><ShieldCheck size={19} />Açık koşullar, şeffaf model</span></div></div>
        <Marketplace />
        <Workflow />
        <EarningsCalculator />
        <section className="creator-invite shell" id="ureticiler" aria-labelledby="creator-title"><div className="invite-art" aria-hidden="true"><Camera size={52} /><span>Sen üret.<br />Hikâyen konuşsun.</span><Sparkles className="invite-sparkle" size={31} /></div><div><span className="section-kicker">YETENEĞİNİN BİR KARŞILIĞI VAR</span><h2 id="creator-title">İçerik üreticisi misin?<br />Burada sana da yer var.</h2><p>İster ilk portföyünü oluştur, ister yeni markalarla çalışmaya hazırlan. InfluNex’in ücretsiz üyelik ve %85 üretici payı modelini keşfet.</p><a className="primary-button" href="/tr/kayit?role=CREATOR">Yayıncı olarak ücretsiz katıl</a><a className="underlined-link invite-link" href="#nasil-calisir">İş birliği adımlarını incele</a></div></section>
        <section className="faq-section shell section-space" id="sss" aria-labelledby="faq-title"><div><span className="section-kicker">AKLINDA SORU KALMASIN</span><h2 id="faq-title">Merak ettiklerin.</h2><p>İlk iş birliğinden önce<br />bilmek isteyeceklerin burada.</p></div><div className="faq-list">{faqs.map((faq) => <details className="faq-item" key={faq.question}><summary>{faq.question}<ChevronDown size={20} /></summary><p>{faq.answer}</p></details>)}</div></section>
        <section className="closing-cta"><div className="shell"><span className="section-kicker">BİR SONRAKİ HİKÂYENİ BAŞLAT</span><h2>Güzel fikirler,<br />doğru insanlarla büyür.</h2><p>Keşfet, karşılaştır ve brief’ini hazırla. İlk adım senden.</p><a className="primary-button" href="#kesfet">İçerik üreticilerini keşfet</a></div></section>
      </main>
      <footer className="footer"><div className="shell footer-inner"><a className="brand" href="/tr"><span className="brand-mark">IN</span>influnex</a><span>© 2026 InfluNex. Birlikte üret, birlikte kazan.</span><div className="footer-links"><a href="#kampanyalar">Brief oluştur</a><a href="#sss">Sorular ve koşullar</a></div></div><p className="shell footer-note">Keşif ve brief planlama ön izlemesi · Örnek katalog · Henüz üyelik ve ödeme alınmıyor.</p></footer>
    </div>
  );
}
