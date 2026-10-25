"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Users, 
  Lock, 
  Sparkles, 
  MessageSquare, 
  Layers, 
  Smartphone, 
  ArrowUpRight, 
  ArrowRight,
  CheckCircle,
  Coins,
  ShieldCheck,
  Bot,
  Camera,
  Check
} from "lucide-react";
import Image from "next/image";
import { getWhatsAppLink, getTelegramBotLink } from "@/lib/utils";

export function TriChannelBento() {
  const waLink = getWhatsAppLink();
  const tgLink = getTelegramBotLink();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);

  // Trigger electric glowing outline & animation on redirect from footer or navbar
  useEffect(() => {
    const handleTriggerGlow = () => {
      setIsGlowing(true);
      if (typeof document !== "undefined") {
        const target = document.getElementById("price-appraisal");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        setTimeout(() => {
          const input = document.getElementById("appraisal-phone-input");
          if (input) {
            input.focus();
          }
        }, 500);
      }
      setTimeout(() => setIsGlowing(false), 5500);
    };

    if (typeof window !== "undefined") {
      if (window.location.hash === "#price-appraisal") {
        setTimeout(handleTriggerGlow, 200);
      }
      const onHash = () => {
        if (window.location.hash === "#price-appraisal") {
          handleTriggerGlow();
        }
      };
      window.addEventListener("hashchange", onHash);
      return () => {
        window.removeEventListener("hashchange", onHash);
      };
    }
  }, []);

  const handleAppraisalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setSubmitted(true);
    if (typeof window !== "undefined") {
      window.open(getWhatsAppLink(`Hi Sleek! I want an instant market appraisal for my item. My contact: ${phoneNumber}`), "_blank");
    }
  };

  return (
    <section id="channels" className="py-24 bg-white border-t border-black/[0.06] relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl space-y-3 mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-neutral-950 uppercase font-display leading-[1.1]">
            Everything Commerce Can Do. <br />
            <span className="text-emerald-600">Now in Your Chat.</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Sleek connects Nigerian buyers with KYC-verified vendors across their favorite messaging platforms. Here is how each channel works:
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* CARD 1: WhatsApp Conversational Terminal & Escrow Hold (Spans 8 cols on desktop) */}
          <div
            id="deal-terminal"
            className="md:col-span-7 lg:col-span-8 rounded-3xl border border-black/[0.08] bg-[#f8f9fb] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-black/20 transition-all shadow-sm scroll-mt-24"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 max-w-xl z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/60 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Conversational Deal Terminal</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-950 font-display uppercase tracking-tight">
                Natural Language Commerce. <br />
                From Inquiry to Escrow.
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Describe what you want in everyday Pidgin or English, or upload an image. Sleek AI searches live inventory from KYC-verified Nigerian vendors, locks the deal price, and holds buyer funds safely until inspection.
              </p>
            </div>

            {/* Visual Chat Thread Mockup */}
            <div className="mt-8 rounded-2xl border border-black/[0.08] bg-white p-4 space-y-3 shadow-sm text-xs z-10 font-sans">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">U</span>
                    <span className="h-5 w-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[9px] font-bold">AI</span>
                    <span className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">V</span>
                  </div>
                  <span className="font-bold text-gray-900">Sleek Verified Trade #9042</span>
                </div>
                <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-mono font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Safe Escrow Hold
                </span>
              </div>

              <div className="space-y-2">
                <div className="rounded-xl bg-gray-50 border border-black/[0.04] p-2.5 text-gray-700 leading-relaxed">
                  <strong className="text-black">Sleek AI:</strong> “Matched! Tunde (KYC Verified ✓) in Ikeja has MacBook Air M2 256GB ready for dispatch at <strong>₦850,000</strong>. Payment will be held safely in escrow until you confirm delivery.”
                </div>
                <div className="flex items-center justify-between rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 px-3 py-2 text-[11px]">
                  <span className="font-semibold text-emerald-950">✓ ₦850,000 Held in Safe Custody</span>
                  <span className="font-mono text-emerald-700 font-bold">1.5% Fee on Confirmation</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-black/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="font-bold text-gray-900 block">KYC-Verified Vendors</span>
                <span className="text-gray-500">Every seller is identity-verified via facial match and national ID.</span>
              </div>
              <div>
                <span className="font-bold text-gray-900 block">Vendor-Handled Shipping</span>
                <span className="text-gray-500">Vendors manage dispatch with direct tracking straight to your door.</span>
              </div>
              <div>
                <span className="font-bold text-gray-900 block">Protected Payout</span>
                <span className="text-gray-500">Payment is released to the seller only when you confirm receipt.</span>
              </div>
            </div>
          </div>

          {/* CARD 2: Autonomous Appraisal & Sourcing (Spans 5/4 cols) */}
          <div
            id="price-appraisal"
            className="md:col-span-5 lg:col-span-4 rounded-3xl border border-black/[0.08] bg-[#f8f9fb] p-6 sm:p-8 flex flex-col justify-between hover:border-black/20 transition-all shadow-sm relative scroll-mt-24"
          >
            <div id="appraisal" className="space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                <Camera className="h-3 w-3" />
                <span>Camera AI Valuation</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-950 font-display uppercase tracking-tight">
                Instant Price Appraisal
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Send a photo of any gadget, pair of shoes, or watch. Sleek identifies the item and suggests fair market value from active Nigerian market data.
              </p>
            </div>

            {/* Appraisal Identification Mockup */}
            <div className="my-5 rounded-2xl border border-black/[0.08] bg-white p-3.5 space-y-2.5 shadow-sm text-xs">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-orange-100/80 border border-orange-200 flex items-center justify-center text-lg">
                  📷
                </div>
                <div>
                  <div className="font-bold text-gray-950">Sony A7 IV + 28-70mm</div>
                  <div className="text-[10px] text-gray-500">Identified via image attachment</div>
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 p-2.5 text-[11px] space-y-1 text-gray-700">
                <div className="flex justify-between items-center">
                  <span>Estimated Market Value:</span>
                  <strong className="text-black font-mono font-bold text-xs">₦1,750,000</strong>
                </div>
                <div className="flex justify-between items-center text-emerald-700 font-medium">
                  <span>Active Nigerian Inquiries:</span>
                  <span className="font-semibold">14 buyers searching</span>
                </div>
              </div>
            </div>

            {/* PHONE NUMBER INPUT FIELD WITH ANIMATED GLOWING OUTLINE UPON CLICK */}
            <div className="space-y-2 pt-1 border-t border-black/[0.06]">
              <div className="text-[11px] font-bold text-gray-900 flex items-center justify-between">
                <span>WhatsApp appraisal request:</span>
                <span className="text-[10px] font-mono text-emerald-600 font-medium">Instant AI</span>
              </div>

              {submitted ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2 text-xs text-emerald-800">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Connecting to WhatsApp appraisal line...</span>
                </div>
              ) : (
                <form onSubmit={handleAppraisalSubmit} className="relative flex items-center">
                  <input
                    type="tel"
                    id="appraisal-phone-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number (e.g. 080...)"
                    className={`w-full rounded-2xl border bg-white py-3 pl-3.5 pr-28 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all duration-300 shadow-inner ${
                      isGlowing 
                        ? "border-emerald-500 ring-4 ring-emerald-500/40 shadow-[0_0_25px_rgba(0,201,128,0.4)] scale-[1.01]" 
                        : "border-black/15 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    }`}
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 transition flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <span>Appraise</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </form>
              )}
              <p className="text-[10px] text-gray-500">
                ✦ Send a photo of any item to get real-time Nigerian market pricing.
              </p>
            </div>
          </div>

          {/* CARD 3: WhatsApp 1-on-1 Conversational Catalog (Spans 6 cols) */}
          <div
            className="md:col-span-6 rounded-3xl border border-black/[0.08] bg-[#f8f9fb] p-6 sm:p-8 flex flex-col justify-between hover:border-black/20 transition-all shadow-sm"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 px-3 py-1 text-xs font-semibold text-[#128C7E]">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>WhatsApp Catalog Commerce</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-950 font-display uppercase tracking-tight">
                1-on-1 AI Shopping &amp; Flow Forms
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                For everyday shopping, WhatsApp is effortless. Explore interactive carousels, select colors and sizes with native WhatsApp Flows, and checkout via Paystack or OPay.
              </p>
            </div>

            <div className="my-6 rounded-2xl border border-black/[0.08] bg-white p-4 space-y-2 text-xs shadow-sm">
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span>Verified Vendors</span>
                <span className="font-bold text-gray-900">Footwear, Fashion &amp; Tech</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="rounded-xl border border-black/[0.06] p-2 bg-gray-50 text-[11px]">
                  <strong className="block text-gray-900">WhatsApp Flows</strong>
                  <span className="text-gray-500">In-chat size and color picker</span>
                </div>
                <div className="rounded-xl border border-black/[0.06] p-2 bg-gray-50 text-[11px]">
                  <strong className="block text-gray-900">Paystack / OPay</strong>
                  <span className="text-gray-500">Instant secure bank payment</span>
                </div>
              </div>
            </div>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#128C7E] hover:underline"
            >
              <span>Chat with WhatsApp Shopper</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* CARD 4: Telegram Mini App & Multi-Currency (Spans 6 cols) */}
          <div
            className="md:col-span-6 rounded-3xl border border-black/[0.08] bg-[#f8f9fb] p-6 sm:p-8 flex flex-col justify-between hover:border-black/20 transition-all shadow-sm"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#229ED9]/10 border border-[#229ED9]/30 px-3 py-1 text-xs font-semibold text-[#229ED9]">
                <Bot className="h-3.5 w-3.5" />
                <span>Telegram Bot &amp; Mini App</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-950 font-display uppercase tracking-tight">
                Instant Mini App Storefront
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Launch the complete Sleek catalog inside Telegram without downloading an extra app. Supports Telegram Stars, Paystack NGN, and crypto payments on Base.
              </p>
            </div>

            <div className="my-6 rounded-2xl border border-black/[0.08] bg-white p-4 space-y-2 text-xs shadow-sm">
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span>Telegram WebApp Store</span>
                <span className="font-mono text-emerald-600">sleekai.xyz/catalog</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-center">
                <div className="rounded-lg bg-gray-50 p-2 border border-black/[0.04]">
                  ⭐ Telegram Stars
                </div>
                <div className="rounded-lg bg-gray-50 p-2 border border-black/[0.04]">
                  💳 Paystack &amp; OPay
                </div>
                <div className="rounded-lg bg-gray-50 p-2 border border-black/[0.04]">
                  ⚡ Base USDC
                </div>
              </div>
            </div>

            <a
              href={tgLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#229ED9] hover:underline"
            >
              <span>Launch Telegram Storefront</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>

        </div>

        {/* The Buyer & Seller Safety Guarantee Banner */}
        <div id="safety" className="mt-16 rounded-3xl bg-neutral-950 text-white p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-3xl sm:text-4xl font-black font-display uppercase tracking-tight">
                No &ldquo;Pay Before Delivery&rdquo; Scams. <br />
                <span className="text-emerald-400">Zero Fake Alerts.</span>
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed max-w-xl">
                We eliminate peer-to-peer commerce risk in Nigeria through verified vendor onboarding and safe payment holds:
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>100% KYC-Verified Vendors:</strong> Vendors complete face match and national ID verification before listing on Sleek.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>Safe Payment Hold:</strong> Buyer payments are safely held until the buyer confirms the item was delivered in good condition.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>Vendor-Managed Shipping:</strong> Verified vendors fulfill and ship orders directly to buyers with direct tracking updates.</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 space-y-4 backdrop-blur-md">
                <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                  Simple, Transparent Pricing
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-300">Product Listing</span>
                    <span className="font-mono font-bold text-emerald-400">100% Free</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-300">Buyer Protection</span>
                    <span className="font-mono font-bold text-emerald-400">Included</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-emerald-300 font-semibold">
                    <span>Sleek Success Fee</span>
                    <span className="font-mono font-bold text-emerald-400">Only 1.5% per sale</span>
                  </div>
                </div>
                <div className="pt-2 text-[11px] text-neutral-400 text-center leading-relaxed">
                  No hidden charges. Vendors only pay a small 1.5% fee when a customer completes an order.
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
