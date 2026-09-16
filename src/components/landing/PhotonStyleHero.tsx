"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Users, 
  Lock, 
  CheckCircle2, 
  ExternalLink,
  MessageSquare,
  Check,
  Star
} from "lucide-react";
import { getWhatsAppLink, getTelegramBotLink } from "@/lib/utils";

type ChannelType = "imessage" | "whatsapp" | "telegram";

const CHANNELS: ChannelType[] = ["imessage", "whatsapp", "telegram"];

export function PhotonStyleHero() {
  const [activeChannel, setActiveChannel] = useState<ChannelType>("imessage");
  const [cycleKey, setCycleKey] = useState(0);
  const [showHeroPhoneInput, setShowHeroPhoneInput] = useState(false);
  const [heroPhone, setHeroPhone] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const waLink = getWhatsAppLink();
  const tgLink = getTelegramBotLink();
  const iMessageLineNumber = process.env.NEXT_PUBLIC_IMESSAGE_NUMBER || "+15550192831";

  // Automatic 5-Second Channel Preview Loop
  const startLoop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveChannel((current) => {
        const idx = CHANNELS.indexOf(current);
        return CHANNELS[(idx + 1) % CHANNELS.length];
      });
      setCycleKey((k) => k + 1);
    }, 5000);
  };

  useEffect(() => {
    startLoop();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Manually clicking any tab switches the mockup instantly and restarts the 5-second timer
  const selectChannel = (ch: ChannelType) => {
    setActiveChannel(ch);
    setCycleKey((k) => k + 1);
    startLoop();
  };

  const handleHeroPhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroPhone.trim()) return;

    if (typeof window !== "undefined") {
      window.location.href = `sms:${iMessageLineNumber}?&body=${encodeURIComponent(
        `Hi Sleek AI! My number is ${heroPhone.trim()}. I want to start shopping & selling on iMessage.`
      )}`;
    }

    // Immediately hide the input again and return to original hero layout
    setShowHeroPhoneInput(false);
    setHeroPhone("");
  };

  return (
    <section className="relative min-h-[92svh] pt-28 pb-16 flex items-center bg-[#f4f5f7] overflow-hidden">
      {/* Subtle geometric grid background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-45"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, rgba(0, 201, 128, 0.08) 0%, transparent 60%), linear-gradient(to right, rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.035) 1px, transparent 1px)`,
          backgroundSize: "100% 100%, 48px 48px, 48px 48px"
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy & Direct Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[1.05] tracking-tight text-neutral-950 font-display">
              Buy &amp; Sell <br />
              Anything <br />
              <span className="text-[#00c980]">Through Chat AI</span>
            </h1>

            {/* Description */}
            <p className="max-w-xl text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
              Footwear, fashion, gadgets, beauty, and tech. Discover items through conversational AI, text our line to list in seconds, and trade safely with KYC-verified vendors on <strong className="text-gray-900 font-semibold">WhatsApp</strong>, <strong className="text-gray-900 font-semibold">Telegram</strong>, and <strong className="text-gray-900 font-semibold">iMessage</strong>.
            </p>

            {/* Clean Inline Preview Line: Automatic 5-Second Channel Preview Loop */}
            <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                Preview Line:
              </span>
              <div className="inline-flex p-1 rounded-2xl bg-black/[0.05] border border-black/[0.06] relative">
                {/* iMessage Tab */}
                <button
                  type="button"
                  onClick={() => selectChannel("imessage")}
                  className={`relative overflow-hidden flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeChannel === "imessage"
                      ? "bg-white text-gray-950 shadow-sm border border-black/5 ring-1 ring-[#007AFF]/30"
                      : "text-gray-600 hover:text-gray-950"
                  }`}
                >
                  <span className="text-[#007AFF]">💬</span>
                  <span>iMessage 3-Way</span>
                  {activeChannel === "imessage" && (
                    <motion.div
                      key={`bar-imessage-${cycleKey}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 5, ease: "linear" }}
                      className="absolute bottom-0 left-0 h-0.5 bg-[#007AFF]"
                    />
                  )}
                </button>

                {/* WhatsApp Tab */}
                <button
                  type="button"
                  onClick={() => selectChannel("whatsapp")}
                  className={`relative overflow-hidden flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeChannel === "whatsapp"
                      ? "bg-white text-gray-950 shadow-sm border border-black/5 ring-1 ring-[#25D366]/30"
                      : "text-gray-600 hover:text-gray-950"
                  }`}
                >
                  <span className="text-[#25D366]">WhatsApp</span>
                  {activeChannel === "whatsapp" && (
                    <motion.div
                      key={`bar-whatsapp-${cycleKey}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 5, ease: "linear" }}
                      className="absolute bottom-0 left-0 h-0.5 bg-[#25D366]"
                    />
                  )}
                </button>

                {/* Telegram Tab */}
                <button
                  type="button"
                  onClick={() => selectChannel("telegram")}
                  className={`relative overflow-hidden flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeChannel === "telegram"
                      ? "bg-white text-gray-950 shadow-sm border border-black/5 ring-1 ring-[#229ED9]/30"
                      : "text-gray-600 hover:text-gray-950"
                  }`}
                >
                  <span className="text-[#229ED9]">Telegram</span>
                  {activeChannel === "telegram" && (
                    <motion.div
                      key={`bar-telegram-${cycleKey}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 5, ease: "linear" }}
                      className="absolute bottom-0 left-0 h-0.5 bg-[#229ED9]"
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Dynamic Phone Number Input Field: Hidden by default, revealed on clicking Start on iMessage */}
            {showHeroPhoneInput && (
              <div className="w-full max-w-lg rounded-2xl border border-[#007AFF] bg-white p-3.5 shadow-xl shadow-[#007AFF]/10 z-20">
                <form onSubmit={handleHeroPhoneSubmit} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[#007AFF]">💬</span>
                      <span>Start on iMessage — Enter phone number:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowHeroPhoneInput(false)}
                      className="h-5 w-5 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-200 flex items-center justify-center text-[10px] font-bold transition cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="tel"
                      id="hero-phone-input"
                      autoFocus
                      value={heroPhone}
                      onChange={(e) => setHeroPhone(e.target.value)}
                      placeholder="Enter phone number (e.g. 0801 234 5678)"
                      className="w-full rounded-xl border border-black/15 bg-gray-50/50 py-2.5 pl-3.5 pr-32 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#007AFF] focus:bg-white focus:ring-2 focus:ring-[#007AFF]/20 transition shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={!heroPhone.trim()}
                      className="absolute right-1 top-1 bottom-1 rounded-lg bg-[#007AFF] px-3.5 text-xs font-bold text-white hover:bg-[#006ee6] active:scale-95 transition flex items-center gap-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                    >
                      <span>Text Sleek →</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono">
                    ✦ Sleek opens your iMessage line to create an instant deal thread.
                  </p>
                </form>
              </div>
            )}

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00c980] px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-[#00c980]/25 transition hover:bg-[#00b372] active:scale-98"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24z" />
                </svg>
                <span>Start on WhatsApp</span>
              </a>

              <a
                href={tgLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-[#229ED9]/25 transition hover:bg-[#1f8ec4] active:scale-98"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                <span>Shop on Telegram</span>
              </a>

              {/* Start on iMessage: Toggles the phone number entry input directly above the CTA button group */}
              <button
                type="button"
                id="hero-start-imessage-btn"
                onClick={() => {
                  setShowHeroPhoneInput((prev) => !prev);
                  setTimeout(() => {
                    const input = document.getElementById("hero-phone-input") as HTMLInputElement;
                    if (input) input.focus();
                  }, 50);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#007AFF] px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-[#007AFF]/25 transition hover:bg-[#006ee6] active:scale-98 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Start on iMessage</span>
              </button>
            </div>

            {/* Micro Trust Stats */}
            <div className="pt-2 flex items-center gap-6 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 100% KYC-Verified
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Safe Payment Hold
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Low 1.5% Fee
              </span>
            </div>
          </div>

          {/* Right Column: Hardware Phone Device with STYLISHLY ANIMATED Floating Badges */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* FLOATING CARD 1: KYC Vendor Verified (top-left) with stylish multi-axis wave and pulsing badge */}
            <motion.div
              animate={{ 
                y: [-10, 8, -10], 
                x: [-4, 4, -4], 
                rotate: [-2.5, 2, -2.5] 
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute -left-6 sm:-left-10 top-10 z-30 flex items-center gap-3 rounded-2xl border border-black/[0.08] bg-white/95 p-3.5 shadow-2xl backdrop-blur-xl max-w-[215px] select-none hover:scale-105 transition-transform"
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-xs">
                <ShieldCheck className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-[12px] font-bold text-gray-900 leading-tight">Ade Tech</p>
                  <span className="text-[10px] text-emerald-600 font-bold">✓</span>
                </div>
                <p className="text-[9px] text-gray-500 font-mono tracking-tight">KYC Identity Verified</p>
              </div>
            </motion.div>

            {/* FLOATING CARD 2: Safe Payment Protected (bottom-right) with stylish multi-axis wave and pulsing badge */}
            <motion.div
              animate={{ 
                y: [8, -10, 8], 
                x: [4, -4, 4], 
                rotate: [2, -2.5, 2] 
              }}
              transition={{ 
                duration: 5.6, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0.35 
              }}
              className="absolute -right-6 sm:-right-8 bottom-12 z-30 flex items-center gap-3 rounded-2xl border border-black/[0.08] bg-white/95 p-3.5 shadow-2xl backdrop-blur-xl max-w-[225px] select-none hover:scale-105 transition-transform"
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#007AFF] border border-blue-200/80 shadow-xs">
                <Lock className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#007AFF]" />
                </span>
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-900 leading-tight">₦850,000 Protected</p>
                <p className="text-[9px] text-gray-500 font-mono tracking-tight">Safe Payment Hold</p>
              </div>
            </motion.div>

            {/* Phone Hardware Shell */}
            <div className="relative mx-auto w-full max-w-[340px] select-none">
              
              {/* Left buttons */}
              <div className="absolute top-24 -left-[3px] w-[3px] h-7 bg-[#2d2d2f] rounded-l-sm border-r border-[#101012] z-0" />
              <div className="absolute top-36 -left-[3px] w-[3px] h-12 bg-[#2d2d2f] rounded-l-sm border-r border-[#101012] z-0" />
              <div className="absolute top-52 -left-[3px] w-[3px] h-12 bg-[#2d2d2f] rounded-l-sm border-r border-[#101012] z-0" />
              {/* Right power button */}
              <div className="absolute top-44 -right-[3px] w-[3px] h-16 bg-[#2d2d2f] rounded-r-sm border-l border-[#101012] z-0" />

              {/* Chassis */}
              <div className="relative rounded-[3rem] border-[7px] border-[#181a1d] bg-black p-[5px] shadow-2xl shadow-black/40 overflow-hidden z-10">
                <div className="overflow-hidden rounded-[2.5rem] bg-[#f8f9fb] flex flex-col relative min-h-[590px]">
                  
                  {/* Dynamic Island */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-40 flex items-center justify-end px-2.5 shadow-inner">
                    <span className="h-2 w-2 rounded-full bg-[#1c355e]" />
                  </div>

                  {/* Status Bar */}
                  <div className="pt-2 px-6 pb-1.5 flex justify-between items-center text-[10px] font-semibold text-gray-800 z-30">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono">5G</span>
                      <div className="w-4 h-2 rounded-2xs border border-gray-800 flex p-0.2">
                        <div className="h-full w-full bg-gray-800 rounded-3xs" />
                      </div>
                    </div>
                  </div>

                  {/* Chat Container */}
                  <div className="flex-1 h-[530px] w-full flex flex-col overflow-hidden relative">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={activeChannel}
                        initial={{ opacity: 0, scale: 0.98, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -6 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="w-full h-full flex-1 flex flex-col"
                      >
                        {activeChannel === "imessage" && (
                          <div className="flex-1 h-full flex flex-col text-xs bg-[#f8f9fb]">
                            {/* iMessage Top Nav */}
                            <div className="bg-white/95 backdrop-blur-md border-b border-black/[0.06] px-3.5 py-2 flex items-center justify-between shrink-0">
                              <span className="text-[#007AFF] text-xs font-semibold">‹ Back</span>
                              <div className="flex flex-col items-center text-center">
                                <div className="flex -space-x-1 mb-0.5">
                                  <span className="h-4.5 w-4.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold">B</span>
                                  <span className="h-4.5 w-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px] font-bold">A</span>
                                  <span className="h-4.5 w-4.5 rounded-full bg-black text-white flex items-center justify-center text-[8px] font-bold">AI</span>
                                </div>
                                <span className="font-bold text-gray-950 text-[11px]">Sleek Deal: MacBook Air M2</span>
                                <span className="text-[9px] text-gray-500">3 People (You, Ade [Verified], Sleek AI)</span>
                              </div>
                              <div className="w-6" />
                            </div>

                            {/* iMessage Messages */}
                            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                              <div className="flex justify-end">
                                <div className="rounded-2xl rounded-tr-xs bg-[#007AFF] text-white px-3 py-1.5 max-w-[82%] leading-relaxed shadow-sm">
                                  Yo find me a clean M2 MacBook Air in Lekki under ₦900k
                                </div>
                              </div>

                              <div className="flex justify-start">
                                <div className="rounded-2xl rounded-tl-xs bg-white border border-black/[0.08] p-2 max-w-[90%] shadow-sm space-y-1.5">
                                  <div className="relative h-24 w-full rounded-lg overflow-hidden bg-gray-100">
                                    <Image
                                      src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=300&fit=crop"
                                      alt="MacBook Air M2"
                                      fill
                                      unoptimized
                                      className="object-cover"
                                    />
                                    <span className="absolute top-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-mono font-bold text-white">
                                      ₦850,000
                                    </span>
                                  </div>
                                  <div className="font-bold text-gray-950 text-[11px]">MacBook Air M2 • 256GB SSD</div>
                                  <div className="text-[9px] text-gray-500">📍 Lekki Phase 1 • 98% Battery Health</div>
                                  <div className="pt-1 border-t border-black/[0.05] flex items-center justify-between text-[9px] text-emerald-700 font-semibold">
                                    <span>✓ Ade Tech (KYC Verified)</span>
                                    <span className="text-gray-400">Tap to connect</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <div className="rounded-2xl rounded-tr-xs bg-[#007AFF] text-white px-3 py-1.5 max-w-[80%] shadow-sm">
                                  Connect me w the seller
                                </div>
                              </div>

                              <div className="flex justify-center">
                                <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[8px] font-mono text-gray-600">
                                  ✦ Sleek created 3-way Deal Room
                                </span>
                              </div>

                              <div className="flex justify-start">
                                <div className="rounded-2xl rounded-tl-xs bg-white border border-black/[0.08] p-2 max-w-[85%] text-gray-800 shadow-sm leading-relaxed text-[11px]">
                                  <strong className="text-black block text-[10px]">Sleek AI:</strong>
                                  Connecting you both! Ade is a KYC-verified vendor. Sleek holds payment safely until buyer confirms receipt.
                                </div>
                              </div>

                              <div className="flex justify-start">
                                <div className="rounded-2xl rounded-tl-xs bg-[#E9E9EB] text-gray-900 px-3 py-1.5 max-w-[80%] text-[11px]">
                                  <span className="font-bold text-gray-600 text-[9px] block">Ade (Verified Vendor ✓)</span>
                                  Available for delivery today bro. Comes with 35W Dual Charger.
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <div className="rounded-2xl rounded-tr-xs bg-[#007AFF] text-white px-3 py-1.5 max-w-[80%] shadow-sm">
                                  ₦850k deal! Sleek lock it.
                                </div>
                              </div>

                              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] p-2.5 space-y-1.5 text-[10px]">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-emerald-950 flex items-center gap-1">
                                    <Lock className="h-3 w-3 text-emerald-600" /> ₦850,000 Safe Hold
                                  </span>
                                  <span className="rounded bg-emerald-600 text-white px-1 py-0.2 text-[8px] font-mono">
                                    Protected
                                  </span>
                                </div>
                                <div className="text-gray-600 leading-tight">
                                  Vendor: <strong>Ade Tech (KYC Verified ✓)</strong>
                                  <br />
                                  Vendor dispatches directly with live tracking.
                                </div>
                              </div>
                            </div>

                            {/* iMessage Input */}
                            <div className="bg-white border-t border-black/[0.06] p-2 flex items-center gap-2 shrink-0">
                              <span className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs">+</span>
                              <div className="flex-1 rounded-full border border-black/10 bg-gray-50 px-3 py-1 text-[11px] text-gray-400">
                                iMessage
                              </div>
                              <div className="h-6 w-6 rounded-full bg-[#007AFF] flex items-center justify-center text-white text-xs font-bold">↑</div>
                            </div>
                          </div>
                        )}

                        {activeChannel === "whatsapp" && (
                          <div className="flex-1 h-full flex flex-col text-xs bg-[#efeae2]">
                            <div className="bg-[#075E54] text-white px-3 py-2 flex items-center justify-between shrink-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs">‹</span>
                                <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-xs">👟</div>
                                <div>
                                  <div className="text-[11px] font-bold">Sleek Footwear ✓</div>
                                  <div className="text-[8px] text-emerald-200">Online • AI Shopper</div>
                                </div>
                              </div>
                              <span className="text-xs">⋮</span>
                            </div>

                            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                              <div className="flex justify-end">
                                <div className="rounded-xl rounded-tr-xs bg-[#E7FFDB] text-gray-900 px-3 py-1.5 max-w-[80%] shadow-sm">
                                  Show me trending sneakers in size 43
                                </div>
                              </div>

                              <div className="flex justify-start">
                                <div className="rounded-xl rounded-tl-xs bg-white text-gray-900 p-2 max-w-[90%] shadow-sm space-y-1.5">
                                  <div className="relative h-24 w-full rounded bg-gray-200 overflow-hidden">
                                    <Image
                                      src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=200&fit=crop"
                                      alt="Nike Jordan"
                                      fill
                                      unoptimized
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="font-bold text-[11px]">Air Jordan 1 High OG</div>
                                  <div className="text-emerald-700 font-mono font-bold">₦120,000</div>
                                  <button className="w-full rounded bg-[#25D366] text-white py-1 text-[10px] font-bold">
                                    Add to Cart
                                  </button>
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <div className="rounded-xl rounded-tr-xs bg-[#E7FFDB] text-gray-900 px-3 py-1.5 max-w-[80%] shadow-sm">
                                  Checkout with Paystack / OPay
                                </div>
                              </div>

                              <div className="flex justify-start">
                                <div className="rounded-xl rounded-tl-xs bg-white text-gray-900 p-2 max-w-[85%] shadow-sm space-y-1 text-[11px]">
                                  <div className="font-bold text-gray-950">Order #SLK-9021 Ready</div>
                                  <p className="text-[10px] text-gray-600">Total: ₦120,000. Tap below to complete payment:</p>
                                  <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-center w-full rounded bg-[#00c980] text-white py-1 text-[10px] font-bold"
                                  >
                                    Complete Payment 🔒
                                  </a>
                                </div>
                              </div>
                            </div>

                            <div className="bg-[#f0f2f5] p-2 flex items-center gap-2 shrink-0">
                              <div className="flex-1 rounded-full bg-white px-3 py-1 text-[11px] text-gray-400">
                                Type a message...
                              </div>
                              <div className="h-6 w-6 rounded-full bg-[#00a884] flex items-center justify-center text-white text-xs">🎙️</div>
                            </div>
                          </div>
                        )}

                        {activeChannel === "telegram" && (
                          <div className="flex-1 h-full flex flex-col text-xs bg-[#0e1621] text-white">
                            <div className="bg-[#17212b] px-3 py-2 flex items-center justify-between border-b border-white/5 shrink-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[#229ED9]">‹</span>
                                <div className="h-6 w-6 rounded-full bg-[#229ED9] flex items-center justify-center text-xs font-bold text-white">S</div>
                                <div>
                                  <div className="text-[11px] font-bold">Sleek Footwear Bot</div>
                                  <div className="text-[8px] text-gray-400">bot • official storefront</div>
                                </div>
                              </div>
                              <span className="text-xs text-gray-400">⋮</span>
                            </div>

                            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                              <div className="flex justify-start">
                                <div className="rounded-xl rounded-tl-xs bg-[#182533] text-gray-100 p-2.5 max-w-[90%] space-y-1.5 text-[11px]">
                                  <p className="font-bold text-white text-[11px]">👟 Welcome to Sleek Store</p>
                                  <p className="text-[10px] text-gray-300">
                                    Browse our full catalogue and checkout with Telegram Stars, Paystack NGN, or Base Crypto.
                                  </p>
                                  <a
                                    href={tgLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1 w-full rounded bg-[#2b5278] text-[#64b5f6] py-1.5 font-bold text-[10px]"
                                  >
                                    🚀 Open Telegram Mini App
                                  </a>
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <div className="rounded-xl rounded-tr-xs bg-[#2b5278] text-white px-3 py-1.5 max-w-[80%] shadow-sm">
                                  /order_status SLK-892
                                </div>
                              </div>

                              <div className="flex justify-start">
                                <div className="rounded-xl rounded-tl-xs bg-[#182533] text-gray-100 p-2 max-w-[85%] space-y-0.5 text-[10px]">
                                  <div className="font-bold text-emerald-400">📦 Dispatched by Vendor</div>
                                  <div className="text-gray-400">Ade Tech • Waybill #FEZ-9012</div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-[#17212b] p-2 flex items-center gap-2 border-t border-white/5 shrink-0">
                              <div className="flex-1 rounded-full bg-[#242f3d] px-3 py-1 text-[11px] text-gray-400">
                                Message Sleek Bot...
                              </div>
                              <div className="h-6 w-6 rounded-full bg-[#229ED9] flex items-center justify-center text-white text-xs">➤</div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
