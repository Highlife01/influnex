"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Clock3, Heart, MapPin, Search, SlidersHorizontal, Users, Scale, Check, RotateCcw } from "lucide-react";
import { categories, platforms, demoCreators, filterCreators, formatFollowers, formatTry, photoUrl, type CreatorPreview } from "@/lib/marketplace/catalog";
import { Dialog } from "./dialog";
import { BriefPlanner } from "./brief-planner";

const FAVORITES_KEY = "influnex:favorites:v1";
const cities = [...new Set(demoCreators.map((creator) => creator.city))].sort((a, b) => a.localeCompare(b, "tr"));
const categoryHighlights = [
  { name: "Moda & Yaşam", text: "Stil sahibi hikâyeler", image: "photo-1529139574466-a303027c1d8b" },
  { name: "Otomotiv", text: "Tutkuyu harekete geçir", image: "photo-1492144534655-ae79c964c9d7" },
  { name: "Gastronomi", text: "Lezzetin etrafında buluş", image: "photo-1504674900247-0877df9cc836" },
];

export function Marketplace() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tümü");
  const [platform, setPlatform] = useState("");
  const [city, setCity] = useState("");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sort, setSort] = useState("recommended");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<CreatorPreview | null>(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<CreatorPreview | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
      if (Array.isArray(stored)) setFavorites(stored.filter((id): id is string => typeof id === "string" && demoCreators.some((c) => c.id === id)));
    } catch { setNotice("Kaydedilmiş favoriler okunamadı. Bu oturumda yeniden seçim yapabilirsin."); }
  }, []);
  const results = filterCreators(demoCreators, { query, category, platform, city, maxPrice, sort, favoritesOnly, favoriteIds: favorites });
  const compared = demoCreators.filter((creator) => compareIds.includes(creator.id));

  function toggleFavorite(id: string) {
    const next = favorites.includes(id) ? favorites.filter((value) => value !== id) : [...favorites, id];
    setFavorites(next);
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); setNotice("Favori listen bu tarayıcıda güncellendi."); }
    catch { setNotice("Favori listen bu oturumda güncellendi. Tarayıcı kalıcı kayda izin vermiyor."); }
  }
  function toggleCompare(id: string) {
    if (compareIds.includes(id)) { setCompareIds(compareIds.filter((value) => value !== id)); setNotice(""); }
    else if (compareIds.length < 3) { setCompareIds([...compareIds, id]); setNotice(""); }
    else setNotice("Aynı anda en fazla 3 profili karşılaştırabilirsin. Yeni bir profil için seçimlerinden birini kaldır.");
  }
  function resetFilters() { setQuery(""); setCategory("Tümü"); setPlatform(""); setCity(""); setMaxPrice(10000); setFavoritesOnly(false); setSort("recommended"); }
  function selectForBrief(creator: CreatorPreview) {
    setSelectedCreator(creator);
    setProfile(null);
    setComparisonOpen(false);
    requestAnimationFrame(() => document.getElementById("kampanyalar")?.scrollIntoView({ behavior: "smooth" }));
  }
  return (
    <>
      <section className="categories shell" aria-labelledby="categories-title">
        <div className="section-heading"><div><span className="section-kicker">DOĞRU NİŞ, DOĞRU HİKÂYE</span><h2 id="categories-title">Markanın dünyasını paylaşanlar.</h2></div><a className="underlined-link" href="#kesfet" onClick={resetFilters}>Tüm kategorileri keşfet</a></div>
        <div className="category-grid">{categoryHighlights.map((item) => <button className="category-card" key={item.name} type="button" onClick={() => { resetFilters(); setCategory(item.name); document.getElementById("kesfet")?.scrollIntoView({ behavior: "smooth" }); }}><Image src={photoUrl(item.image)} alt="" fill sizes="(max-width: 600px) 90vw, 33vw" /><span className="category-content"><strong>{item.name}</strong><span>{item.text}</span></span><span className="category-badge">Keşfet</span></button>)}</div>
      </section>

      <section className="discovery shell section-space" id="kesfet" aria-labelledby="discovery-title">
        <div className="section-heading"><div><span className="section-kicker"><Users size={16} /> BİR SONRAKİ İŞ ORTAĞIN</span><h2 id="discovery-title">İçeriğiyle fark yaratanları keşfet.</h2></div><button className={`secondary-button favorites-filter ${favoritesOnly ? "selected" : ""}`} type="button" aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly(!favoritesOnly)}><Heart size={17} /> Favorilerim ({favorites.length})</button></div>
        <p className="demo-note"><span>Örnek katalog</span> Profiller, metrikler ve fiyatlar keşif deneyimini göstermek içindir; gerçek üye veya teklif değildir.</p>
        <div className="category-tabs" role="group" aria-label="Kategori filtresi">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="filter-bar">
          <label className="search-field"><Search size={19} /><span className="sr-only">Üretici, kategori veya şehir ara</span><input type="search" placeholder="İsim, kategori veya şehir ara" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
          <label><span className="sr-only">Platform filtresi</span><select aria-label="Platform filtresi" value={platform} onChange={(e) => setPlatform(e.target.value)}><option value="">Tüm platformlar</option>{platforms.map((p) => <option key={p}>{p}</option>)}</select></label>
          <label><span className="sr-only">Şehir filtresi</span><select aria-label="Şehir filtresi" value={city} onChange={(e) => setCity(e.target.value)}><option value="">Tüm şehirler</option>{cities.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label><span className="sr-only">Maksimum bütçe</span><select aria-label="Maksimum bütçe" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}><option value={10000}>Tüm bütçeler</option><option value={2500}>En fazla 2.500 TL</option><option value={5000}>En fazla 5.000 TL</option></select></label>
        </div>
        <div className="results-toolbar"><span role="status">{results.length} örnek profil {favoritesOnly ? "favorilerinde" : "listeleniyor"}</span><label><SlidersHorizontal size={15} /><span className="sr-only">Sıralama</span><select aria-label="Sıralama" value={sort} onChange={(e) => setSort(e.target.value)}><option value="recommended">Varsayılan sıralama</option><option value="price-asc">Fiyat: düşükten yükseğe</option><option value="delivery">En hızlı teslim</option><option value="followers">Takipçi sayısı</option></select></label></div>
        {results.length ? <div className="creator-grid">{results.map((creator) => <article className="creator-card" key={creator.id}>
          <div className="creator-photo"><Image src={photoUrl(creator.image)} alt={`${creator.name} örnek profil görseli`} fill sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw" /><span className="creator-category">{creator.category}</span><button className={`favorite-button icon-button ${favorites.includes(creator.id) ? "saved" : ""}`} type="button" aria-label={`${creator.name} ${favorites.includes(creator.id) ? "favorilerden çıkar" : "favorilere ekle"}`} aria-pressed={favorites.includes(creator.id)} onClick={() => toggleFavorite(creator.id)}><Heart size={19} fill={favorites.includes(creator.id) ? "currentColor" : "none"} /></button><span className="sample-badge">Örnek profil</span></div>
          <div className="creator-body"><div className="creator-name-row"><h3>{creator.name}</h3><span><MapPin size={13} />{creator.city}</span></div><div className="platform-tags">{creator.platforms.map((p) => <span key={p}>{p}</span>)}</div><div className="creator-metrics"><span><strong>{formatFollowers(creator.followers)}</strong><small>takipçi</small></span><span><strong>%{creator.engagement.toLocaleString("tr-TR")}</strong><small>etkileşim</small></span><span><strong>{creator.deliveryDays} gün</strong><small>teslim</small></span></div><div className="creator-price"><span><strong>{formatTry(creator.price)}</strong><small>başlangıç fiyatı · örnek</small></span><button className="small-button" type="button" onClick={() => setProfile(creator)}>Profili incele</button></div><label className="compare-check"><input type="checkbox" checked={compareIds.includes(creator.id)} onChange={() => toggleCompare(creator.id)} />Karşılaştır<span className="sr-only">: {creator.name}</span></label></div>
        </article>)}</div> : <div className="empty-state"><Search size={30} /><h3>Bu seçimlerle eşleşen profil yok.</h3><p>{favoritesOnly ? "Favorilerine profil ekleyebilir veya filtreleri değiştirebilirsin." : "Başka bir kategori, platform veya bütçe dene."}</p><button className="secondary-button" type="button" onClick={resetFilters}><RotateCcw size={16} />Filtreleri temizle</button></div>}
        <p className="discovery-notice" role="status">{notice}</p>
        {compareIds.length ? <div className="compare-bar"><span><Scale size={20} /><strong>{compareIds.length}/3 profil seçildi</strong><span className="compare-hint">Yan yana, daha kolay karar ver.</span></span><div><button className="text-button" type="button" onClick={() => { setCompareIds([]); setNotice(""); }}>Temizle</button><button className="primary-button" type="button" disabled={compareIds.length < 2} onClick={() => setComparisonOpen(true)}>Karşılaştır</button></div></div> : null}
      </section>

      <BriefPlanner creator={selectedCreator} onRemoveCreator={() => setSelectedCreator(null)} onRestoreCreator={setSelectedCreator} />

      {profile ? <Dialog title={profile.name} onClose={() => setProfile(null)}><div className="profile-cover"><Image src={photoUrl(profile.image)} alt={`${profile.name} örnek profil görseli`} fill sizes="540px" /><span>Örnek profil · temsili görsel</span></div><div className="profile-details"><span className="section-kicker">{profile.category} · {profile.city}</span><p>{profile.bio}</p><div className="platform-tags">{profile.platforms.map((p) => <span key={p}>{p}</span>)}</div><h3>Örnek içerik paketi</h3><p>{profile.service}</p><div className="profile-facts"><span><Clock3 size={17} />{profile.deliveryDays} gün teslim</span><strong>{formatTry(profile.price)} başlangıç</strong></div><p className="local-note">Takipçi ve etkileşim değerleri temsili verilerdir. Reklamda yeniden kullanım, yayın ve münhasırlık şartları ayrıca belirlenir.</p><button className="primary-button full-width" type="button" onClick={() => selectForBrief(profile)}>Bu profille brief planla</button></div></Dialog> : null}
      {comparisonOpen ? <Dialog title="Profilleri yan yana karşılaştır" wide onClose={() => setComparisonOpen(false)}><p className="comparison-note">Örnek katalog verileri. Fiyatlar bağlayıcı teklif değildir.</p><div className="comparison-scroll"><table className="comparison-table"><caption className="sr-only">Seçilen içerik üreticilerinin karşılaştırması</caption><thead><tr><th scope="col">Profil</th>{compared.map((c) => <th key={c.id} scope="col"><strong>{c.name}</strong><small>{c.category}</small></th>)}</tr></thead><tbody>{[
        ["Şehir", (c: CreatorPreview) => c.city], ["Platform", (c: CreatorPreview) => c.platforms.join(", ")], ["Takipçi", (c: CreatorPreview) => formatFollowers(c.followers)], ["Etkileşim", (c: CreatorPreview) => `%${c.engagement.toLocaleString("tr-TR")}`], ["Başlangıç fiyatı", (c: CreatorPreview) => formatTry(c.price)], ["Teslim", (c: CreatorPreview) => `${c.deliveryDays} gün`], ["UGC içerik", (c: CreatorPreview) => c.platforms.includes("UGC") ? "Var" : "Listelenmemiş"],
      ].map(([label, getValue]) => <tr key={label as string}><th scope="row">{label as string}</th>{compared.map((c) => <td key={c.id}>{(getValue as (c: CreatorPreview) => string)(c)}</td>)}</tr>)}<tr><th scope="row">Brief’e ekle</th>{compared.map((c) => <td key={c.id}><button className="small-button" type="button" onClick={() => selectForBrief(c)}><Check size={15} />{c.name} seç</button></td>)}</tr></tbody></table></div></Dialog> : null}
    </>
  );
}
