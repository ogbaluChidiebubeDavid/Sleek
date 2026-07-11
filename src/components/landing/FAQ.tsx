"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";

const faqs = [
  {
    q: "How do I start buying footwear?",
    a: 'Click Get Started. WhatsApp opens with "Hello I want to buy footwear" prefilled. Sleek sends the catalogue carousel with Buy and Add to cart buttons.',
  },
  {
    q: "Can I pay with Opay like on Temu?",
    a: "Yes. At checkout, select Opay. You'll authorize payment with your Opay transaction PIN in the Opay app.",
  },
  {
    q: "Which cryptocurrencies are supported?",
    a: "We support major stablecoins and tokens including USDC, USDT, BTC, and ETH, with seamless payments on Base.",
  },
  {
    q: "How does order tracking work?",
    a: "After payment you receive a tracking number (e.g. SL-XXXXX). Message Sleek: track SL-XXXXX for live status.",
  },
  {
    q: "What is the View more flow?",
    a: "View more opens our full catalogue in WhatsApp's browser. Sign up, browse promotions, manage cart, then checkout in chat.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 sm:py-28 azza-pattern">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl font-black uppercase text-gray-900">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-gray-600">
            Can&apos;t find what you&apos;re looking for?{" "}
            <a
              href={getWhatsAppLink("I have a question about Sleek")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sleek-600 hover:underline"
            >
              Chat with our team
            </a>
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left hover:bg-gray-50 transition"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-gray-400 transition ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                  {faq.a}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
