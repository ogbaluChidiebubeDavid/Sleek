"use client";

import { motion } from "framer-motion";
import { getWhatsAppLink } from "@/lib/utils";

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
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-white px-10 py-4 font-semibold text-sleek-600 hover:bg-sleek-50 transition"
          >
            Get Started
          </a>
        </div>
      </motion.div>
    </section>
  );
}
