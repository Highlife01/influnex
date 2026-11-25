"use client";

import { useState } from "react";
import {
  Check,
  Search,
  FileText,
  BadgeCheck,
  Camera,
  CircleUserRound,
  Banknote,
  Handshake,
} from "lucide-react";
import { formatTry } from "@/lib/marketplace/catalog";

const brandSteps = [
  {
    icon: Search,
    title: "Tarzını bul",
    text: "Kategori, platform ve bütçeyi seç. Profilleri karşılaştır, kısa listeni oluştur.",
  },
  {
    icon: FileText,
    title: "Beklentini anlat",
    text: "Bir şablonla brief’ini hazırla. Formatı, teslim tarihini ve 6 boyutlu kullanım hakkı talebini netleştir.",
  },
  {
    icon: BadgeCheck,
    title: "İş birliğini netleştir",
    text: "Canlı iş akışı açıldığında fiyat, revizyon hakkı ve kullanım koşulları sipariş öncesinde birlikte onaylanır.",
  },
];
const creatorSteps = [
  {
    icon: CircleUserRound,
    title: "Tarzını ortaya koy",
    text: "Portföyünü, uzmanlık alanını ve üretim yaptığın platformları (Influencer veya UGC) hazırla.",
  },
  {
    icon: Camera,
    title: "Hizmetini netleştir",
    text: "İçerik formatını, brüt fiyatını, teslim süreni, revizyon kapsamını ve reklam kullanım izinlerini belirle.",
  },
  {
    icon: Handshake,
    title: "Markayla ortaklaş",
    text: "Brief’i değerlendir, kapsamı netleştir ve yayına hazır içeriği teslim et. Planlanan üretici payı vergi/stopaj öncesi %85’tir.",
  },
];

export function Workflow() {
  const [role, setRole] = useState<"brand" | "creator">("brand");
  return (
    <section
      className="steps section-space"
      id="nasil-calisir"
      aria-labelledby="workflow-title"
    >
      <div className="shell">
        <div className="section-heading">
          <div>
            <span className="section-kicker">
              DAHA AZ KARMAŞA, DAHA ÇOK ÜRETİM
            </span>
            <h2 id="workflow-title">Birlikte üretmenin kolay yolu.</h2>
          </div>
          <div
            className="role-switch"
            role="group"
            aria-label="İş birliği adımları"
          >
            <button
              type="button"
              aria-pressed={role === "brand"}
              className={role === "brand" ? "active" : ""}
              onClick={() => setRole("brand")}
            >
              Markayım
            </button>
            <button
              type="button"
              aria-pressed={role === "creator"}
              className={role === "creator" ? "active" : ""}
              onClick={() => setRole("creator")}
            >
              İçerik üreticisiyim
            </button>
          </div>
        </div>
        <div className="workflow-grid">
          {(role === "brand" ? brandSteps : creatorSteps).map((step) => (
            <article key={step.title} className="workflow-card">
              <span className="workflow-icon">
                <step.icon size={25} />
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EarningsCalculator() {
  const [orders, setOrders] = useState(4);
  const [average, setAverage] = useState(5000);
  const volume = orders * average;
  return (
    <section
      className="calculator shell section-space"
      id="kazanc"
      aria-labelledby="earnings-title"
    >
      <div className="calculator-box">
        <div className="calculator-controls">
          <span className="section-kicker">KAZANCIN NET, KOŞULLAR ŞEFFAF</span>
          <h2 id="earnings-title">Ürettiğinin karşılığını bil.</h2>
          <p>
            Üyelik ve listeleme ücretsiz. %15 platform komisyonu yalnızca
            tamamlanan ve onaylanan siparişin vergi hariç brüt hizmet bedeli
            üzerinden hesaplanır; iptal veya tam iade edilen siparişlerden
            komisyon alınmaz.
          </p>
          <div className="range-label">
            <label htmlFor="orders">Aylık tamamlanan iş birliği</label>
            <strong>{orders}</strong>
          </div>
          <input
            id="orders"
            type="range"
            min={1}
            max={30}
            value={orders}
            onChange={(e) => setOrders(Number(e.target.value))}
          />
          <div className="range-label">
            <label htmlFor="average">
              İş birliği başına brüt hizmet bedeli
            </label>
            <strong>{formatTry(average)}</strong>
          </div>
          <input
            id="average"
            type="range"
            min={500}
            max={50000}
            step={500}
            value={average}
            onChange={(e) => setAverage(Number(e.target.value))}
          />
          <p className="local-note">
            Örnek kazanç hesabıdır; %85 üretici payı yürürlükteki vergi, stopaj
            ve faturalandırma yükümlülükleri öncesi brüt hakediş tutarıdır.
          </p>
        </div>
        <aside className="earnings" aria-live="polite">
          <span className="earnings-icon">
            <Banknote size={26} />
          </span>
          <div>
            <span className="earnings-label">
              Aylık brüt üretici payın · %85 (Vergi/Stopaj Öncesi)
            </span>
            <strong>{formatTry(volume * 0.85)}</strong>
          </div>
          <div>
            <div className="earnings-row">
              <span>Toplam brüt hizmet bedeli</span>
              <b>{formatTry(volume)}</b>
            </div>
            <div className="earnings-row">
              <span>Platform komisyonu · %15</span>
              <b>{formatTry(volume * 0.15)}</b>
            </div>
          </div>
          <span className="earnings-foot">
            <Check size={15} />
            Abonelik yok. İptal edilen siparişte %0 komisyon.
          </span>
        </aside>
      </div>
    </section>
  );
}
