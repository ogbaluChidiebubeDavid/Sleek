"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";

const faqs = [
  {
    q: "How do I use Sleek on WhatsApp?",
    a: "You can start shopping on Sleek instantly on WhatsApp by tapping 'Start on WhatsApp' or texting our line. Chat with Sleek's conversational AI shopper, describe what you are looking for (or upload an image), browse interactive product cards, and checkout securely with Paystack or OPay.",
  },
  {
    q: "How does payment protection work on Sleek?",
    a: "Sleek holds buyer payments safely until the buyer confirms the item was delivered by the vendor. This completely eliminates 'pay before delivery' scams and fake bank alerts. Once the buyer confirms receipt, the payment is released directly to the vendor's bank account.",
  },
  {
    q: "How is product shipping and delivery handled?",
    a: "Product shipping is handled directly by the vendors. Because every vendor on Sleek undergoes strict KYC identity verification (face match and government ID check) before onboarding, vendors manage their own dispatch and provide tracking directly to the customer.",
  },
  {
    q: "What is Sleek's platform fee?",
    a: "Listing products is 100% free with no monthly subscription. Sleek only charges a simple, low 1.5% success fee to vendors when a sale successfully completes. There are no complicated hidden fees.",
  },
  {
    q: "How does shopping work on WhatsApp and Telegram?",
    a: "Our conversational commerce on WhatsApp and Telegram remains fully active. On WhatsApp, you chat 1-on-1 with Sleek's AI personal shopper, browse interactive product carousels, choose sizes and colors with native WhatsApp Flows, and checkout via Paystack or OPay. On Telegram, you can launch our native storefront with Paystack, OPay, debit cards, or direct bank transfer.",
  },
  {
    q: "Why do vendors need to complete KYC verification?",
    a: "To ensure that buyers never deal with anonymous scammers or counterfeiters, all merchants on Sleek must verify their government ID and face biometric before their products are published. This guarantees a safe, high-trust marketplace.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-[#f8f9fb] border-t border-black/[0.06]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-12 space-y-2">
          <h2 className="font-display text-3xl sm:text-4xl font-black uppercase text-gray-950 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-600">
            Have more questions about conversational commerce?{" "}
            <a
              href={getWhatsAppLink("I have a question about Sleek")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-emerald-600 hover:underline"
            >
              Chat directly with our team
            </a>
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={faq.q}
              className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden shadow-sm"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-gray-950 transition hover:bg-gray-50"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform duration-200 shrink-0 ml-3 ${
                    open === i ? "rotate-180 text-emerald-600" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div className="border-t border-black/[0.04] px-5 py-4 text-xs sm:text-sm text-gray-600 leading-relaxed bg-gray-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
