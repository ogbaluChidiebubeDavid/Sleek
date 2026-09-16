"use client";

import { motion } from "framer-motion";
import { getWhatsAppLink, getTelegramBotLink } from "@/lib/utils";
import { ArrowUpRight, ShieldCheck, Sparkles, MessageCircle } from "lucide-react";

export function CTA() {
  const waLink = getWhatsAppLink();
  const tgLink = getTelegramBotLink();
  const iMessageNumber = process.env.NEXT_PUBLIC_IMESSAGE_NUMBER || "+15550192831";

  return (
    <section className="py-24 bg-white relative overflow-hidden border-t border-black/[0.06]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
        <div className="rounded-[36px] bg-neutral-950 px-8 py-16 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              Ready to Experience <br />
              <span className="text-emerald-400">Conversational Commerce?</span>
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              Text our AI line to discover products, connect with KYC-verified merchants, and protect every payment with confidence.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#00c980] px-7 py-3.5 text-xs font-bold text-white shadow-lg shadow-[#00c980]/20 hover:bg-[#00b372] transition"
              >
                <span>Launch WhatsApp AI</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>

              <a
                href={tgLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white/10 border border-white/15 px-7 py-3.5 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                <span>Launch Telegram Store</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>

              <a
                href="#imessage-group"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("highlight-imessage-input"));
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#007AFF] px-7 py-3.5 text-xs font-bold text-white shadow-lg shadow-[#007AFF]/20 hover:bg-[#0066d6] transition"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Text on iMessage</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
