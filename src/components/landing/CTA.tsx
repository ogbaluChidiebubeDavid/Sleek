"use client";

import { motion } from "framer-motion";
import { getWhatsAppLink, getTelegramBotLink } from "@/lib/utils";

export function CTA() {
  return (
    <section className="py-24 sm:py-28 bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="mx-auto max-w-4xl px-6 text-center"
      >
        <div className="rounded-3xl bg-sleek-500 px-8 py-14 text-white shadow-xl shadow-sleek-500/25">
          <h2 className="font-display text-3xl font-black uppercase sm:text-4xl">
            Sleek AI: Footwear on WhatsApp
          </h2>
          <p className="mt-4 text-sleek-100 max-w-xl mx-auto">
            Browse, cart, checkout, and track — all in one place, all on WhatsApp.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full bg-white px-10 py-4 font-semibold text-sleek-600 hover:bg-sleek-50 transition"
            >
              Get Started
            </a>
            <a
              href={getTelegramBotLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#2AABEE] px-10 py-4 font-semibold text-white transition hover:bg-[#229ED9]"
            >
              {/* Telegram paper-plane icon */}
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              Shop on Telegram
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
