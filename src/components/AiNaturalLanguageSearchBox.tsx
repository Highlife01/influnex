"use client";

import { useState } from "react";
import Link from "next/link";
import type { AiRecommendationResponse } from "@/lib/ai/recommendationEngine";
import { formatMinorUnits } from "@/lib/finance/commission";

export function AiNaturalLanguageSearchBox() {
  const [query, setQuery] = useState(
    "Adana'da otomobil içerikleri paylaşan, 10.000 TL bütçeme uygun Instagram influencer'ları bul."
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiRecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, locale: "tr", maxResults: 4 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Arama sırasında bir hata oluştu.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-100 bg-slate-50/90 p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-950 px-3 py-1 text-xs font-semibold text-white">
          Yapay Zekâ Destekli Doğal Dil Influencer Arama
        </span>
        <span className="text-xs text-slate-500">
          Yalnızca gerçek ve onaylı platform profillerini sorgular
        </span>
      </div>

      <form onSubmit={handleSearch} className="mt-3 flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor="ai-nl-search" className="sr-only">
          Doğal dilde influencer arayın
        </label>
        <input
          id="ai-nl-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Örn: Adana'da otomobil içerikleri paylaşan, 10.000 TL bütçeme uygun Instagram influencer'ları bul."
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-2xs focus:border-indigo-600"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Analiz Ediliyor..." : "Gerçek Profilleri Öner"}
        </button>
      </form>

      <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() =>
            setQuery(
              "Adana'da otomobil içerikleri paylaşan, 10.000 TL bütçeme uygun Instagram influencer'ları bul."
            )
          }
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-600 hover:border-indigo-300"
        >
          Adana Otomotiv (≤ 10.000 TL)
        </button>
        <button
          type="button"
          onClick={() =>
            setQuery(
              "İstanbul'da moda ve kozmetik kategorisinde UGC reklam videosu üreten influencer'ları bul."
            )
          }
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-600 hover:border-indigo-300"
        >
          İstanbul Moda & UGC
        </button>
        <button
          type="button"
          onClick={() =>
            setQuery(
              "Ankara'da teknoloji ve yazılım tanıtımı yapan YouTube içerik üreticileri bul."
            )
          }
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-600 hover:border-indigo-300"
        >
          Ankara Teknoloji YouTube
        </button>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
          <p className="text-xs font-semibold text-slate-700">
            Bulunan Onaylı Influencer Sayısı: {result.recommendations.length}
          </p>
          {result.recommendations.length === 0 ? (
            <p className="text-xs text-slate-600">
              Bu kriterlere tam uyan onaylı profil bulunamadı.{" "}
              <Link
                href="/tr/influencer"
                className="font-semibold text-indigo-600 underline"
              >
                Tüm filtreleri inceleyin
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {result.recommendations.map((rec) => (
                <div
                  key={rec.creator.id}
                  className="rounded-xl border border-slate-200 bg-white p-3.5"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/tr/influencer/${rec.creator.username}`}
                      className="text-sm font-bold text-slate-900 hover:text-indigo-600"
                    >
                      {rec.creator.displayName} (@{rec.creator.username})
                    </Link>
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800">
                      %{rec.matchScore} Uyum
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    <strong>Öneri Nedeni:</strong> {rec.explanationTr}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">
                      Başlangıç: {formatMinorUnits(rec.creator.startingPriceMinorUnits)}
                    </span>
                    <Link
                      href={`/tr/influencer/${rec.creator.username}`}
                      className="font-semibold text-indigo-600 hover:underline"
                    >
                      Profili İncele →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
