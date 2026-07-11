"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { getWhatsAppLink } from "@/lib/utils";
import { AnimatedWalletMockup } from "./AnimatedWalletMockup";
import { BubblingCoinsMockup } from "./BubblingCoinsMockup";

type ShowcaseItem = {
  title: string;
  description: React.ReactNode;
  cta: string;
  image: React.ReactNode;
  imageLeft: boolean;
};

export function Features() {
  const wa = getWhatsAppLink();

  const showcases: ShowcaseItem[] = [
    {
      title: "Shop Footwear Instantly on WhatsApp",
      description:
        "With Sleek, browse sneakers, boots, and sandals in seconds through a simple WhatsApp chat — pick size, color, buy or add to cart from a live carousel.",
      cta: "Start Shopping",
      image: (
        <div className="relative w-full h-full min-h-[280px] sm:min-h-[380px] bg-gray-100">
          <Image
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop"
            alt="Shop Footwear"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ),
      imageLeft: false,
    },
    {
      title: "Easy Crypto Checkout",
      description:
        "Pay seamlessly with your digital assets. No complex crypto setup required—a secure smart wallet is automatically created behind the scenes using just your email address, offering you full chain abstraction.",
      cta: "Pay with Crypto",
      image: <AnimatedWalletMockup />,
      imageLeft: true,
    },
    {
      title: "Supported Crypto Networks",
      description:
        "We support a wide range of popular cryptocurrencies and stablecoins, including USDC, USDT, BTC, ETH, and tokens on the fast, low-cost Base network. Complete your purchase in seconds with instant confirmation and no transaction friction.",
      cta: "Pay with Crypto",
      image: <BubblingCoinsMockup />,
      imageLeft: false,
    },
    {
      title: "Track Every Order in Chat",
      description:
        "Every purchase includes a receipt and tracking number (SL-XXXXX). Ask Sleek anytime for live delivery status — no app download needed.",
      cta: "Track an Order",
      image: (
        <div className="relative w-full h-full min-h-[280px] sm:min-h-[380px] bg-gray-100">
          <Image
            src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=600&fit=crop"
            alt="Track Order"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ),
      imageLeft: true,
    },
  ];

  return (
    <section id="features" className="bg-white">
      {showcases.map((item, i) => (
        <motion.article
          key={item.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className={`py-24 sm:py-28 ${i % 2 === 1 ? "bg-[#fafbfc]" : "bg-white"}`}
        >
          <div
            className={`mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16 ${
              item.imageLeft ? "" : "lg:[&>div:first-child]:order-2"
            }`}
          >
            <div className={item.imageLeft ? "lg:pr-4" : "lg:pl-4"}>
              <h2 className="font-display text-2xl font-black uppercase leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
                {item.title}
              </h2>
              <div className="mt-5">{item.description}</div>
              <a
                href={item.cta.includes("Track") ? getWhatsAppLink("track ") : wa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex rounded-full bg-sleek-500 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-sleek-500/30 hover:bg-sleek-600 transition"
              >
                {item.cta}
              </a>
            </div>
            <div className={
              item.title.toLowerCase().includes("easy crypto") || item.title.toLowerCase().includes("supported crypto")
                ? "relative w-full flex justify-center py-4"
                : "relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 shadow-lg ring-1 ring-gray-200/80"
            }>
              {item.image}
            </div>
          </div>
        </motion.article>
      ))}
    </section>
  );
}
