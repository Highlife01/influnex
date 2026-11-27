"use client";

import { useState } from "react";
import Link from "next/link";
import type { SupportedLocale } from "@/lib/types/domain";
import type { AiRecommendationResponse } from "@/lib/ai/recommendationEngine";
import { formatMinorUnits } from "@/lib/finance/commission";
import { creatorProfilePath, localizedPath } from "@/lib/i18n/paths";

export function AiNaturalLanguageSearchBox({
  locale = "tr",
}: {
  locale?: SupportedLocale;
}) {
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
        body: JSON.stringify({ query, locale, maxResults: 4 }),
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <strong className="text-sm font-bold text-slate-900">
          Ne Tür Bir İçerik Üreticisi Arıyorsunuz?
        </strong>
        <span className="text-xs text-slate-500">
          Şehir, kategori ve bütçenizi yazarak hızlıca bulun
        </span>
      </div>

      <form onSubmit={handleSearch} className="mt-3 flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor="ai-nl-search" className="sr-only">
          Aradığınız influencer özelliklerini yazın
        </label>
        <input
          id="ai-nl-search"
          name="query"
          autoComplete="off"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Örn: İstanbul'da moda ve kozmetik videoları çeken influencer bul..."
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-600"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Aranıyor…" : "Uygun Profilleri Bul"}
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
          Adana Otomotiv
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
        <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700">
          {error}
        </p>
      ) : null}

      {result ? (
        <div
          className="mt-4 space-y-3 border-t border-slate-200 pt-4"
          aria-live="polite"
          aria-busy={loading}
        >
          {result.recommendations.length === 0 ? (
            <p className="text-xs text-slate-600">
              Bu aramaya uygun profil bulunamadı.{" "}
              <Link
                href={localizedPath(locale, "creators")}
                className="font-semibold text-indigo-600 underline"
              >
                Tüm profilleri görüntüleyin
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
                      href={creatorProfilePath(locale, rec.creator.username)}
                      className="text-sm font-bold text-slate-900 hover:text-indigo-600"
                    >
                      {rec.creator.displayName} (@{rec.creator.username})
                    </Link>
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      {rec.creator.cityNameTr}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    {rec.explanationTr}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">
                      Başlangıç:{" "}
                      {formatMinorUnits(rec.creator.startingPriceMinorUnits)}
                    </span>
                    <Link
                      href={creatorProfilePath(locale, rec.creator.username)}
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
