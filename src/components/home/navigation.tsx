"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const pageLinks = [
  { href: "/tr/influencer", label: "İçerik üreticileri" },
  { href: "/tr/kampanyalar", label: "Kampanyalar" },
  { href: "/tr/nasil-calisir", label: "Nasıl çalışır?" },
  { href: "/tr/influencer-reklam-fiyatlari", label: "Fiyatlar" },
];

export function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <nav className="nav shell" aria-label="Ana navigasyon">
        <Link className="brand" href="/tr" aria-label="InfluNex ana sayfa">
          <span className="brand-mark">IN</span>
          <span>influnex</span>
          <span className="beta-label">BETA</span>
        </Link>

        <div className="nav-links">
          {pageLinks.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href="/tr/kayit?role=CREATOR">Yayıncı ol</Link>
        </div>

        <div className="nav-actions">
          <Link className="nav-login" href="/tr/giris">
            Giriş yap
          </Link>
          <Link className="primary-button nav-cta" href="/tr/kayit?role=ADVERTISER">
            Ücretsiz katıl
          </Link>
        </div>

        <button
          className="mobile-menu icon-button"
          type="button"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((isOpen) => !isOpen)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </nav>

      {open ? (
        <div className="mobile-navigation shell" id="mobile-navigation">
          <nav aria-label="Sayfalar">
            {pageLinks.map((item) => (
              <Link href={item.href} key={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mobile-account-links">
            <span>Hesap türünü seç</span>
            <Link href="/tr/giris" onClick={() => setOpen(false)}>
              Giriş yap
            </Link>
            <Link href="/tr/kayit?role=ADVERTISER" onClick={() => setOpen(false)}>
              Reklamveren olarak katıl
            </Link>
            <Link href="/tr/kayit?role=CREATOR" onClick={() => setOpen(false)}>
              Yayıncı olarak katıl
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
