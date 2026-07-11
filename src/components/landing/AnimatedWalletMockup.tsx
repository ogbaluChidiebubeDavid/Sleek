"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Shield, CheckCircle, Loader2, Lock, ArrowRight, ChevronLeft, Phone, MoreVertical } from "lucide-react";
import Image from "next/image";
import { SleekLogo } from "@/components/brand/SleekLogo";

export function AnimatedWalletMockup() {
  const [step, setStep] = useState(0);
  const [emailText, setEmailText] = useState("");

  // Cycle through the steps automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 5);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  // Email typing effect in Step 1
  useEffect(() => {
    if (step === 1) {
      setEmailText("");
      const email = "shoelover@sleek.ng";
      let i = 0;
      const typingTimer = setInterval(() => {
        if (i < email.length) {
          setEmailText((prev) => prev + email.charAt(i));
          i++;
        } else {
          clearInterval(typingTimer);
        }
      }, 100);
      return () => clearInterval(typingTimer);
    }
  }, [step]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative mx-auto w-full max-w-[325px]"
    >
      {/* Phone Mockup Frame wrapper with side buttons (inspired by useazza.com) */}
      <div className="relative mx-auto w-full select-none">
        
        {/* Left side button - Action Button */}
        <div className="absolute top-24 -left-[2px] w-[2.5px] h-6 bg-[#2d2d2f] rounded-l-sm border-r border-[#101012] z-0" />
        {/* Left side buttons - Volume Up / Down */}
        <div className="absolute top-36 -left-[2px] w-[2.5px] h-12 bg-[#2d2d2f] rounded-l-sm border-r border-[#101012] z-0" />
        <div className="absolute top-52 -left-[2px] w-[2.5px] h-12 bg-[#2d2d2f] rounded-l-sm border-r border-[#101012] z-0" />
        
        {/* Right side button - Power Button */}
        <div className="absolute top-44 -right-[2px] w-[2.5px] h-18 bg-[#2d2d2f] rounded-r-sm border-l border-[#101012] z-0" />

        {/* Floating USDC glass overlay */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-12 top-24 z-20 flex h-14 w-14 items-center justify-center rounded-full border border-white/45 bg-white/80 backdrop-blur-xs p-2 shadow-lg shadow-[#00c980]/15"
        >
          <svg viewBox="0 0 100 100" className="w-9 h-9 text-[#00c980] fill-none">
            <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="5.5" fill="currentColor" fillOpacity="0.05" />
            <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M 36 36 A 18 18 0 0 0 36 64" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 64 36 A 18 18 0 0 1 64 64" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 50 24 V 76 M 40 40 h 20 M 40 60 h 20" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Floating WhatsApp glass overlay */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute -right-12 bottom-32 z-20 flex h-14 w-14 items-center justify-center rounded-full border border-white/45 bg-white/80 backdrop-blur-xs p-2.5 shadow-lg shadow-[#00c980]/15"
        >
          <Image
            src="/whatsapp-icon-outline.png"
            alt="WhatsApp"
            width={30}
            height={30}
            className="object-contain"
          />
        </motion.div>

        {/* Outer Phone Bezel Chassis */}
        <div className="relative rounded-[2.85rem] border-[6px] border-[#161618] bg-[#08080a] p-[5.5px] shadow-2xl shadow-black/50 overflow-hidden z-10">
          
          {/* Inner Phone Screen */}
          <div className="overflow-hidden rounded-[2.4rem] bg-[#efeae2] flex flex-col min-h-[585px] relative">
            
            {/* Screen Glass Glare Sheen Overlay */}
            <div
              className="absolute inset-0 pointer-events-none z-30 opacity-70"
              style={{
                background: "linear-gradient(115deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.15) 28%, rgba(255,255,255,0) 29%, rgba(255,255,255,0) 100%)",
              }}
            />

            {/* Dynamic Island Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-45 flex items-center justify-between px-2.5 shadow-inner">
              {/* Camera lens indicator */}
              <div className="w-1.5 h-1.5 rounded-full bg-[#111] flex items-center justify-center">
                <div className="w-0.5 h-0.5 rounded-full bg-[#181a30]" />
              </div>
              {/* Proximity sensor */}
              <div className="w-1 h-1 rounded-full bg-[#080808]" />
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between bg-[#f0f2f5] px-5 pt-3 pb-1 text-[10px] font-medium text-gray-800">
              <span>09:41</span>
              <span className="flex gap-1 items-center opacity-0">
                <span className="h-2 w-2 rounded-full bg-gray-800" />
                <span>100%</span>
              </span>
            </div>

          {/* WhatsApp Header */}
          <div className="flex items-center gap-2.5 bg-[#f0f2f5] px-3.5 py-2.5 border-b border-[#e9edef]">
            <ChevronLeft className="h-5 w-5 text-[#54656f] cursor-pointer" />
            <SleekLogo variant="mark" className="!h-9 !w-9 !rounded-full !text-sm shadow-sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Sleek ⚡</p>
              <p className="text-[10px] text-gray-500">online</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4.5 w-4.5 text-[#54656f] cursor-pointer" />
              <MoreVertical className="h-5 w-5 text-[#54656f] cursor-pointer" />
            </div>
          </div>

          {/* Chat Background & Message Area */}
          <div
            className="flex-1 overflow-y-auto p-3 space-y-3 flex flex-col justify-end relative"
            style={{
              backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
              backgroundSize: "contain",
              backgroundColor: "#efeae2",
            }}
          >
            <p className="text-center text-[10px] text-[#667781] py-1 bg-white/45 backdrop-blur-xs rounded-md mx-auto px-2 mb-2 font-medium">
              Today
            </p>

            {/* Step 0 Chat bubble (Sent from User) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-[#d9fdd3] px-3 py-2 text-xs text-[#303030] shadow-xs relative flex flex-col gap-0.5"
            >
              <p>I want to pay for my footwear order 👟</p>
              <span className="text-[8px] text-[#667781] self-end mt-0.5 flex items-center gap-0.5">
                9:41 AM <span className="text-[#53bdeb] font-bold">✓✓</span>
              </span>
            </motion.div>

            {/* Step 0 Chat bubble (Welcome Checkout Message) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-[90%] rounded-lg rounded-tl-none bg-white px-3 py-2.5 text-xs text-[#303030] shadow-xs border border-[#e9edef] flex flex-col gap-2"
            >
              <p>To complete your purchase of <strong>₦45,000</strong>, please click below to log in and authorize your smart wallet payment.</p>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#00c980] py-2 px-3 text-[10px] font-bold text-white shadow-xs hover:bg-[#00b372] transition"
              >
                <span>🔑</span> Open Secure Checkout
              </button>
              <span className="text-[8px] text-[#667781] self-end mt-0.5">9:41 AM</span>
            </motion.div>

            {/* Embedded Webview Container (Active during Steps 1-4) */}
            <AnimatePresence>
              {step > 0 && (
                <motion.div
                  initial={{ y: "100%", opacity: 0.5 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0.5 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="absolute inset-x-2.5 bottom-2.5 top-2.5 z-10 bg-white rounded-xl shadow-xl border border-gray-200/70 flex flex-col overflow-hidden"
                >
                  {/* Webview Header / Browser bar */}
                  <div className="bg-gray-50 border-b border-gray-100 px-3 py-2 flex items-center justify-between text-[10px] text-gray-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Lock className="h-3 w-3 text-[#00c980]" />
                      <span className="text-gray-600 truncate font-semibold">checkout.sleek.ng</span>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    </div>
                  </div>

                  {/* Webview Body Content */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    
                    {/* Step 1: Email Input Form */}
                    {step === 1 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3 flex-1 flex flex-col justify-center"
                      >
                        <div className="text-center space-y-1">
                          <h4 className="text-xs font-extrabold text-gray-800">Secure Web3 Wallet</h4>
                          <p className="text-[9px] text-gray-500">Sign in to automatically create your abstracted smart wallet</p>
                        </div>

                        <div className="relative">
                          <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                          <input
                            type="text"
                            readOnly
                            value={emailText}
                            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 pl-8 pr-3 text-[10px] text-gray-700 focus:outline-hidden"
                            placeholder="Enter email address"
                          />
                          {/* Simulating Blinking Cursor */}
                          <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute left-[118px] top-2.5 h-4 w-[1px] bg-[#00c980]"
                            style={{ display: emailText.length > 0 && emailText.length < 18 ? "block" : "none" }}
                          />
                        </div>

                        <button
                          type="button"
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#00c980] py-2 px-3 text-[10px] font-bold text-white shadow-xs"
                        >
                          Continue <ArrowRight className="h-3 w-3" />
                        </button>
                      </motion.div>
                    )}

                    {/* Step 2: Creating Wallet / Loading State */}
                    {step === 2 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
                      >
                        <Loader2 className="h-8 w-8 text-[#00c980] animate-spin" />
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-gray-800">Generating Smart Wallet</h4>
                          <p className="text-[9px] text-gray-500">Configuring secure Base network account via chain abstraction...</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Wallet Dashboard with Balance & Approve Button */}
                    {step === 3 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          {/* Smart Wallet Header */}
                          <div className="flex justify-between items-center bg-[#eefdf4] border border-[#00c980]/20 rounded-lg p-2">
                            <div>
                              <p className="text-[8px] text-gray-500 uppercase tracking-wider font-bold">Base Wallet Address</p>
                              <p className="text-[9.5px] font-mono text-gray-700">0x71C8...897a</p>
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#00c980]/10 px-2 py-0.5 text-[8px] font-bold text-[#00c980]">
                              <span className="h-1 w-1 rounded-full bg-[#00c980] animate-ping" /> Base
                            </span>
                          </div>

                          {/* Balance section */}
                          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex justify-between items-center">
                            <div>
                              <p className="text-[8px] text-gray-500 font-medium">Estimated Wallet Balance</p>
                              <motion.p
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="text-base font-black text-gray-900 mt-0.5"
                              >
                                $30.00 <span className="text-xs text-gray-500 font-semibold">(₦45,000 USDC)</span>
                              </motion.p>
                            </div>
                            <div className="w-7 h-7 bg-emerald-50 rounded-full flex items-center justify-center font-bold text-[#00c980] text-xs shadow-inner">
                              $
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#00c980] py-2.5 px-3 text-[10px] font-bold text-white shadow-md shadow-[#00c980]/20 transition"
                        >
                          <Shield className="h-3 w-3" /> Confirm & Pay ₦45,000
                        </button>
                      </motion.div>
                    )}

                    {/* Step 4: Success / Confirmed State */}
                    {step === 4 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-3"
                      >
                        <CheckCircle className="h-10 w-10 text-[#00c980]" />
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-gray-900">Payment Confirmed!</h4>
                          <p className="text-[9px] text-gray-500">Your smart wallet completed transaction successfully</p>
                        </div>
                      </motion.div>
                    )}

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* WhatsApp Chat Input Footer */}
          <div className="flex items-center gap-2 border-t border-[#e9edef] bg-[#f0f2f5] p-2">
            <div className="flex-1 rounded-full bg-white px-4 py-2 text-[10px] text-gray-400 border border-gray-200">
              Type a message
            </div>
            <div className="rounded-full bg-[#00a884] p-2 flex items-center justify-center shrink-0 shadow-sm">
              <svg className="h-4.5 w-4.5 text-white fill-current" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
              </svg>
            </div>
          </div>

        </div>
      </div>
      </div>
    </motion.div>
  );
}
