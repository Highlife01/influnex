"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navigation() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <nav className="nav shell" aria-label="Ana navigasyon">
        <a className="brand" href="/tr" aria-label="InfluNex ana sayfa"><span className="brand-mark">IN</span>influnex<span className="beta-label">ÖN İZLEME</span></a>
        <div className="nav-links"><a href="#kesfet">İçerik üreticisi bul</a><a href="#nasil-calisir">Nasıl çalışır?</a><a href="#sss">Sık sorulanlar</a></div>
        <div className="nav-actions">
          <a className="nav-login" href="/tr/giris">Giriş yap</a>
          <a className="primary-button nav-cta" href="/tr/kayit?role=ADVERTISER">Ücretsiz katıl</a>
        </div>
        <button className="mobile-menu icon-button" type="button" aria-label={open ? "Menüyü kapat" : "Menüyü aç"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </nav>
      {open ? <div className="mobile-navigation shell" id="mobile-navigation" onClick={() => setOpen(false)}><a href="#kesfet">İçerik üreticisi bul</a><a href="#nasil-calisir">Nasıl çalışır?</a><a href="#sss">Sık sorulanlar</a><a href="/tr/giris">Giriş yap</a><a href="/tr/kayit?role=ADVERTISER">Reklamveren olarak katıl</a><a href="/tr/kayit?role=CREATOR">Yayıncı olarak katıl</a></div> : null}
    </header>
  );
}
