import { MessageCircle } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/905320550945?text=Merhaba%2C%20InfluNex%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.";

export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp’tan InfluNex’e ulaşın: 05320550945"
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 inline-flex min-h-12 items-center gap-2.5 rounded-full bg-[#128c4a] px-4 text-sm font-bold text-white shadow-lg shadow-emerald-950/20 transition-[background-color,transform,box-shadow] hover:-translate-y-0.5 hover:bg-[#0f773f] hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f773f] lg:bottom-6"
    >
      <MessageCircle size={20} aria-hidden="true" />
      <span>WhatsApp’tan yazın</span>
      <span className="border-l border-white/40 pl-2 text-[11px] font-medium sm:text-xs">
        0532 055 09 45
      </span>
    </a>
  );
}
