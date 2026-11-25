"use client";

import { useEffect, useState } from "react";
import { Check, Download, FileText, Save, Sparkles, X } from "lucide-react";
import { BriefDraftSchema, briefTemplates, briefToText, emptyBrief, usageLabels, type BriefDraft } from "@/lib/marketplace/brief";
import { demoCreators, formatTry, type CreatorPreview } from "@/lib/marketplace/catalog";

const STORAGE_KEY = "influnex:brief:v1";

export function BriefPlanner({ creator, onRemoveCreator, onRestoreCreator }: { creator: CreatorPreview | null; onRemoveCreator: () => void; onRestoreCreator: (creator: CreatorPreview) => void }) {
  const [draft, setDraft] = useState<BriefDraft>(emptyBrief);
  const [notice, setNotice] = useState("");
  const [activeTemplate, setActiveTemplate] = useState("");
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = BriefDraftSchema.safeParse(JSON.parse(stored));
      if (parsed.success) {
        setDraft(parsed.data);
        const savedCreator = demoCreators.find((item) => item.id === parsed.data.creatorId);
        if (savedCreator) onRestoreCreator(savedCreator);
        setNotice("Kaydettiğin brief bu tarayıcıdan yüklendi.");
      }
      else setNotice("Önceki taslak okunamadı. Yeni bir brief hazırlayabilirsin.");
    } catch { setNotice("Bu tarayıcıda kayıtlı taslağa erişilemiyor. Brief dosyanı indirebilirsin."); }
  }, [onRestoreCreator]);

  function update<K extends keyof BriefDraft>(key: K, value: BriefDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setNotice("");
  }
  function saveDraft() {
    const parsed = BriefDraftSchema.safeParse({ ...draft, creatorId: creator?.id ?? null });
    if (!parsed.success) { setNotice("Bütçeyi 500–1.000.000 TL arasında tam sayı olarak gir."); return; }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.data)); setNotice("Taslak bu tarayıcıya kaydedildi. Henüz yayınlanmadı."); }
    catch { setNotice("Tarayıcı kayda izin vermiyor. Brief dosyanı indirerek saklayabilirsin."); }
  }
  function downloadBrief(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = BriefDraftSchema.safeParse(draft);
    if (!parsed.success) { setNotice("Lütfen form alanlarını kontrol et."); return; }
    const url = URL.createObjectURL(new Blob(["\uFEFF", briefToText(parsed.data, creator?.name)], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "influnex-kampanya-brief.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Brief dosyan indirildi. Kampanya yayınlanmadı; bu bir planlama taslağıdır.");
  }
  const minDate = new Date().toLocaleDateString("sv-SE");

  return (
    <section className="planner-section section-space" id="kampanyalar" aria-labelledby="brief-title">
      <div className="shell">
        <div className="section-heading"><div><span className="section-kicker"><FileText size={16} /> Fikirden net bir brief’e</span><h2 id="brief-title">İyi içerik, iyi bir<br />brief ile başlar.</h2></div><p>Beklentini netleştir, taslağını kaydet.<br />Bir sonraki iş birliğine hazır ol.</p></div>
        <div className="template-grid" aria-label="Brief şablonları">
          {briefTemplates.map((template) => <button key={template.id} type="button" aria-pressed={activeTemplate === template.id} className={`template-card ${activeTemplate === template.id ? "selected" : ""}`} onClick={() => { setDraft((current) => ({ ...current, ...template.values })); setActiveTemplate(template.id); setNotice(`${template.name} şablonu uygulandı. Marka bilgilerini ekleyebilirsin.`); }}><Sparkles size={20} /><span><strong>{template.name}</strong><small>{template.description}</small></span>{activeTemplate === template.id ? <Check size={18} /> : null}</button>)}
        </div>
        <form className="planner-grid" onSubmit={downloadBrief}>
          <div className="brief-form">
            <fieldset className="goal-fieldset"><legend>Nasıl bir iş birliği düşünüyorsun?</legend><div className="goal-options">{(["ugc", "influencer"] as const).map((goal) => <label key={goal} className={draft.goal === goal ? "selected" : ""}><input type="radio" name="goal" value={goal} checked={draft.goal === goal} onChange={() => { update("goal", goal); update("platform", goal === "ugc" ? "UGC" : "Instagram"); }} /><span><strong>{goal === "ugc" ? "UGC içerik" : "Influencer yayını"}</strong><small>{goal === "ugc" ? "İçeriği markanın kanallarında kullan" : "Üreticinin kendi kitlesine ulaş"}</small></span></label>)}</div></fieldset>
            <div className="form-grid">
              <label>Marka adı<input name="brand" value={draft.brand} required maxLength={100} placeholder="Markanın adı" onChange={(e) => update("brand", e.target.value)} /></label>
              <label>Kampanya başlığı<input name="title" value={draft.title} required maxLength={140} placeholder="Örn. Yaz koleksiyonu lansmanı" onChange={(e) => update("title", e.target.value)} /></label>
              <label>Ürün veya hizmet<input name="product" value={draft.product} required maxLength={200} placeholder="Neyi tanıtmak istiyorsun?" onChange={(e) => update("product", e.target.value)} /></label>
              <label>Hedef kitle<input name="audience" value={draft.audience} required maxLength={400} placeholder="Örn. Şehirde yaşayan, 25–35 yaş" onChange={(e) => update("audience", e.target.value)} /></label>
              <label className="full-width">İçerik beklentisi<textarea name="deliverables" rows={5} value={draft.deliverables} required maxLength={1500} placeholder="İçerik adedi, format, süre, ana mesaj ve revizyon beklentin…" onChange={(e) => update("deliverables", e.target.value)} /></label>
              <label>Platform<select value={draft.platform} onChange={(e) => update("platform", e.target.value as BriefDraft["platform"])}>{(draft.goal === "ugc" ? ["UGC", "Instagram", "TikTok", "YouTube"] : ["Instagram", "TikTok", "YouTube"]).map((p) => <option key={p}>{p}</option>)}</select></label>
              <label>Toplam bütçe (TL)<input name="budget" type="number" min={500} max={1000000} step={1} required value={draft.budget || ""} onChange={(e) => update("budget", Number(e.target.value))} /></label>
              <label>Hedef teslim tarihi<input name="deliveryDate" type="date" min={minDate} required value={draft.deliveryDate} onChange={(e) => update("deliveryDate", e.target.value)} /></label>
              <label>Kullanım hakkı talebi<select value={draft.usage} onChange={(e) => update("usage", e.target.value as BriefDraft["usage"])}>{Object.entries(usageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            </div>
          </div>
          <aside className="brief-summary">
            <span className="section-kicker">KAMPANYA TASLAĞIN</span>
            <h3>{draft.title || "Sıradaki güzel iş birliğin"}</h3>
            <p>{draft.brand || "Markanın adı"} · {draft.goal === "ugc" ? "UGC içerik" : "Influencer yayını"}</p>
            <div className="summary-budget"><small>Planlanan toplam bütçe</small><strong>{formatTry(draft.budget)}</strong></div>
            <dl><div><dt>Platform</dt><dd>{draft.platform}</dd></div><div><dt>Hedef teslim</dt><dd>{draft.deliveryDate ? draft.deliveryDate.split("-").reverse().join(".") : "Henüz belirlenmedi"}</dd></div><div><dt>Kullanım talebi</dt><dd>{usageLabels[draft.usage]}</dd></div></dl>
            {creator ? <div className="selected-creator"><span><small>İlgilendiğin örnek profil</small><strong>{creator.name}</strong></span><button type="button" className="icon-button" aria-label="Seçilen profili kaldır" onClick={onRemoveCreator}><X size={18} /></button></div> : <a className="summary-link" href="#kesfet">İçerik üreticilerini keşfet</a>}
            <p className="summary-note">Kullanım hakları ve teslim şartları, iş birliği öncesinde üreticiyle netleştirilir.</p>
            <button className="primary-button" type="submit"><Download size={18} /> Brief’i indir</button>
            <button className="secondary-button" type="button" onClick={saveDraft}><Save size={17} /> Taslağı kaydet</button>
            <p className="local-note">Yalnızca bu tarayıcıya kaydedilir. Kampanya yayınlanmaz, ödeme alınmaz.</p>
            <p className="form-notice" role="status">{notice}</p>
          </aside>
        </form>
      </div>
    </section>
  );
}
