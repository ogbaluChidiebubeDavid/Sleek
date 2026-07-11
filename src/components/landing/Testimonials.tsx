"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "I ordered runners on WhatsApp and paid with Opay in seconds. Got my tracking number right in the chat.",
    author: "Ada O.",
    role: "Lagos",
  },
  {
    quote:
      "Crypto checkout was smooth and instant. Receipt and tracking came back instantly on WhatsApp.",
    author: "James K.",
    role: "Abuja",
  },
  {
    quote:
      "View more catalogue inside WhatsApp is genius. I saved items to cart and checked out when ready.",
    author: "Fatima M.",
    role: "Kano",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 sm:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <p className="text-sleek-600 text-sm font-semibold uppercase tracking-wider">
            Testimonials
          </p>
          <h2 className="mt-2 font-display text-3xl font-black uppercase text-gray-900 sm:text-4xl">
            What people say about us
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: "easeOut" }}
              className="rounded-2xl border border-gray-100 bg-[#fafbfc] p-8"
            >
              <p className="text-gray-700 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-6">
                <p className="font-bold text-gray-900">{t.author}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
