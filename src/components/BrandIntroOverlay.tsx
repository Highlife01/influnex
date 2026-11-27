"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Play,
  Sparkles,
  TrendingUp,
  Video,
  X,
} from "lucide-react";
import type { SupportedLocale } from "@/lib/types/domain";

const INTRO_DURATION_MS = 6000;
const SESSION_STORAGE_KEY = "influnex_intro_6s_seen_v1";

export function BrandIntroOverlay({
  locale = "tr",
}: {
  locale?: SupportedLocale;
}) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  function startIntro() {
    setElapsedMs(0);
    setExiting(false);
    setVisible(true);
  }

  function closeIntro() {
    setExiting(true);
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, "1");
    } catch {
      // ignore storage errors
    }
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, 450);
  }

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const forceIntro = urlParams.get("intro") === "1";
      const alreadySeen = sessionStorage.getItem(SESSION_STORAGE_KEY) === "1";
      if (forceIntro || !alreadySeen) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible || exiting) return;

    const startTime = performance.now();
    const interval = window.setInterval(() => {
      const now = performance.now();
      const delta = Math.min(INTRO_DURATION_MS, now - startTime);
      setElapsedMs(delta);
      if (delta >= INTRO_DURATION_MS) {
        window.clearInterval(interval);
        closeIntro();
      }
    }, 50);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        window.clearInterval(interval);
        closeIntro();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, exiting]);

  const progressPct = Math.min(
    100,
    Math.round((elapsedMs / INTRO_DURATION_MS) * 100)
  );
  const remainingSeconds = Math.max(
    1,
    Math.ceil((INTRO_DURATION_MS - elapsedMs) / 1000)
  );

  // 3 narrative beats across 6 seconds (0-2s, 2-4s, 4-6s)
  const stage = elapsedMs < 2000 ? 1 : elapsedMs < 4000 ? 2 : 3;

  return (
    <>
      {/* Replay Trigger Pill in Hero */}
      <button
        type="button"
        onClick={startIntro}
        className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-bold text-indigo-800 transition hover:bg-indigo-100"
      >
        <Play size={12} className="fill-indigo-600 text-indigo-600" />
        {locale === "tr" ? "6 sn Tanıtımı İzle" : "Watch 6s Intro"}
      </button>

      {/* Fullscreen 6-Second Cinematic Intro Overlay */}
      {visible ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            locale === "tr" ? "InfluNex 6 Saniye Giriş Tanıtımı" : "InfluNex Intro"
          }
          className={`fixed inset-0 z-50 flex flex-col justify-between overflow-hidden bg-slate-950 text-white transition-all duration-500 ${
            exiting ? "scale-105 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          {/* Ambient Glowing Background Orbs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
            <div className="absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-emerald-500/25 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-violet-600/25 blur-3xl" />
          </div>

          {/* Top Bar: Brand Mark + Countdown & Skip Button */}
          <div className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 text-sm font-black text-white shadow-md">
                IN
              </span>
              <span className="text-lg font-black tracking-tight text-white">
                Influ<span className="text-emerald-400">Nex</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 font-mono text-xs font-bold text-slate-200">
                {remainingSeconds} sn
              </span>
              <button
                type="button"
                onClick={closeIntro}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-xs transition hover:bg-white/20"
              >
                {locale === "tr" ? "İntroyu Geç" : "Skip Intro"}
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Center Dynamic Story Stage */}
          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-1.5 text-xs font-bold text-emerald-300">
              <Sparkles size={14} />
              {locale === "tr"
                ? "Türkiye'nin Influencer & UGC İş Birliği Platformu"
                : "Global Influencer & UGC Creator Marketplace"}
            </span>

            {stage === 1 ? (
              <div className="mt-6 space-y-4">
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-6xl sm:leading-[1.1]">
                  {locale === "tr"
                    ? "İyi bir iş birliği, doğru buluşmayla başlar."
                    : "Great collaborations start with the right match."}
                </h2>
                <p className="mx-auto max-w-2xl text-base text-slate-300 sm:text-xl">
                  {locale === "tr"
                    ? "Markalar ve içerik üreticileri için sade, şeffaf ve güvenli buluşma noktası."
                    : "The simple, transparent way for brands and creators to work together."}
                </p>
              </div>
            ) : stage === 2 ? (
              <div className="mt-6 space-y-5">
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                  {locale === "tr"
                    ? "81 İlde 1.000+ Onaylı İçerik Üreticisi"
                    : "1,000+ Verified Creators Across 81 Cities"}
                </h2>
                <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { name: "Instagram Reels", tag: "Yüksek Erişim" },
                    { name: "TikTok Video", tag: "Viral Kurgu" },
                    { name: "YouTube Tanıtım", tag: "Detaylı İnceleme" },
                    { name: "UGC Kreatif", tag: "Reklam Videosu" },
                  ].map((ch) => (
                    <div
                      key={ch.name}
                      className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-xs"
                    >
                      <Video size={18} className="mx-auto text-emerald-400" />
                      <strong className="mt-1.5 block text-sm font-bold text-white">
                        {ch.name}
                      </strong>
                      <span className="text-[11px] text-slate-300">
                        {ch.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                  {locale === "tr"
                    ? "Ücretsiz Katıl • %85 Üretici Kazancı"
                    : "Free to Join • 85% Creator Payout"}
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold sm:text-sm">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/20 px-4 py-2 text-emerald-200">
                    <TrendingUp size={16} />
                    %85 Doğrudan Üretici Payı
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-400/30 bg-indigo-500/20 px-4 py-2 text-indigo-200">
                    <CheckCircle2 size={16} />
                    Aylık Abonelik Ücreti Yok
                  </span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={closeIntro}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black text-slate-950 shadow-lg transition hover:bg-emerald-400"
                  >
                    {locale === "tr" ? "Keşfetmeye Başla" : "Start Exploring"}
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            )}

            {/* 3 Stage Indicator Dots */}
            <div className="mt-8 flex items-center gap-2">
              {[1, 2, 3].map((dot) => (
                <span
                  key={dot}
                  className={`h-2 rounded-full transition-all ${
                    stage === dot
                      ? "w-8 bg-emerald-400"
                      : "w-2 bg-white/25"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bottom 6-Second Smooth Progress Bar */}
          <div className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-8">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                {stage === 1
                  ? "1/3 • Doğru Buluşma"
                  : stage === 2
                    ? "2/3 • 81 İl & 4 Kanal"
                    : "3/3 • %85 Üretici Kazancı"}
              </span>
              <span>%{progressPct}</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-teal-300 transition-all duration-75"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
