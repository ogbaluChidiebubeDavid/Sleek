"use client";

import { motion } from "framer-motion";
import { PhoneMockup } from "./PhoneMockup";
import { getWhatsAppLink } from "@/lib/utils";
import { ShoppingBag, ShieldCheck, Truck } from "lucide-react";

export function Hero() {
  const waLink = getWhatsAppLink();

  return (
    <section className="relative min-h-[100svh] hero-geometric pt-28 pb-16 flex items-center">
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 w-full">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Text and Copy */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            
            {/* Tag / Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#00c980] bg-[#00c980]/8 px-3 py-1.5 rounded-full"
            >
              <span>✦</span> AI-powered footwear commerce
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-[2.5rem] font-black uppercase leading-[1.05] tracking-tight text-[#1c1c1c] sm:text-5xl md:text-6xl lg:text-[4.25rem]"
            >
              Buy Premium <br className="hidden sm:inline" />
              Footwear <br className="hidden sm:inline" />
              <span className="text-[#00c980]">Through WhatsApp AI</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-xl text-sm font-medium text-gray-500 sm:text-base leading-relaxed"
            >
              Discover sneakers, slides, heels, sandals and luxury footwear through conversational AI shopping.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2"
            >
              {/* Get Started Button */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#00c980] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#00c980]/25 transition hover:bg-[#00b372] hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* Custom WhatsApp SVG Icon */}
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.507.003 9.974-4.463 9.977-9.974.002-2.67-1.037-5.18-2.92-7.067C16.45 1.677 13.942.67 11.274.67 5.767.67 1.3 5.137 1.297 10.648c-.001 1.57.418 3.1 1.214 4.467l-.95 3.47 3.56-.934zM17.91 14.86c-.328-.164-1.942-.96-2.242-1.07-.3-.11-.52-.164-.737.164-.218.327-.844 1.07-1.035 1.288-.19.217-.383.244-.71.082-.327-.164-1.38-.508-2.63-1.622-.972-.867-1.628-1.94-1.82-2.266-.19-.328-.02-.505.143-.668.147-.148.328-.383.49-.574.165-.19.22-.328.328-.546.11-.218.055-.41-.027-.573-.082-.164-.738-1.776-1.01-2.434-.26-.63-.53-.544-.73-.553-.19-.01-.41-.01-.63-.01-.218 0-.573.08-.873.41-.3.327-1.146 1.12-1.146 2.73 0 1.61 1.173 3.16 1.336 3.38.164.218 2.3 3.51 5.572 4.926.78.337 1.387.538 1.86.688.78.248 1.492.213 2.053.13.626-.094 1.943-.795 2.216-1.563.272-.767.272-1.423.19-1.563-.08-.14-.3-.218-.627-.38z" />
                </svg>
                Get Started
              </a>

              {/* Explore Catalogue Button */}
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-8 py-4 text-base font-bold text-gray-800 shadow-sm transition hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                Explore Catalogue
              </a>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-x-6 gap-y-3 pt-6 border-t border-gray-200/60 w-full text-xs font-semibold text-gray-600"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4.5 w-4.5 text-[#00c980]" />
                <span>AI Shopping Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-[#00c980]" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4.5 w-4.5 text-[#00c980]" />
                <span>Fast & Reliable Delivery</span>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Phone Mockup with floating overlay badges */}
          <div className="lg:col-span-5 flex justify-center relative px-6 md:px-10">
            <PhoneMockup variant="full" />
          </div>

        </div>
      </div>

      {/* Decorative hero fade-out bottom overlay */}
      <motion.div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-20 hero-fade" />
    </section>
  );
}
