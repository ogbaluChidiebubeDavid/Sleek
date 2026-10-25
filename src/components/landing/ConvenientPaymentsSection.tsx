"use client";

import { useState } from "react";
import { ShieldCheck, Zap, ArrowRight, CheckCircle2, Building2, CreditCard, Smartphone, Lock, Check } from "lucide-react";
import { getTelegramBotLink, getWhatsAppLink } from "@/lib/utils";

type SupportedPayment = {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  channels: string;
  settlementTime: string;
  popularFor: string;
  color: string;
  renderIcon: () => React.ReactNode;
};

const supportedMethods: SupportedPayment[] = [
  {
    id: "transfer",
    name: "Direct Bank Transfer",
    subtitle: "Instant automated payment verification",
    badge: "Most Popular",
    channels: "GTBank • Access • Zenith • Kuda • All Banks",
    settlementTime: "Instant (10s)",
    popularFor: "Zero card details needed. Works directly with your banking app",
    color: "#00c980",
    renderIcon: () => (
      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
        <Building2 className="w-5 h-5" />
      </div>
    ),
  },
  {
    id: "cards",
    name: "Debit & Credit Cards",
    subtitle: "Visa, Mastercard & Verve cards",
    badge: "Instant",
    channels: "Visa • Mastercard • Verve (3D Secure)",
    settlementTime: "Instant (2s)",
    popularFor: "1-click secure checkout with bank OTP security",
    color: "#2775CA",
    renderIcon: () => (
      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
        <CreditCard className="w-5 h-5" />
      </div>
    ),
  },
  {
    id: "opay",
    name: "OPay & Digital Wallets",
    subtitle: "1-Tap fast mobile checkout",
    badge: "Zero Delays",
    channels: "OPay • Moniepoint • PalmPay",
    settlementTime: "Instant (<1s)",
    popularFor: "Instant authorization from your favorite mobile fintech wallet",
    color: "#00A859",
    renderIcon: () => (
      <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
        <span className="font-mono font-black text-xs">OPay</span>
      </div>
    ),
  },
  {
    id: "paystack",
    name: "Paystack Gateway",
    subtitle: "CBN-certified multi-channel processor",
    badge: "Certified",
    channels: "Bank Transfer • Card • Apple Pay • QR",
    settlementTime: "Instant (3s)",
    popularFor: "Central Bank certified retail payment infrastructure",
    color: "#0AA5DB",
    renderIcon: () => (
      <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold text-sm shrink-0">
        <span className="font-mono font-black text-xs">PS</span>
      </div>
    ),
  },
  {
    id: "ussd",
    name: "USSD Banking",
    subtitle: "Quick offline bank dial codes",
    badge: "No Internet",
    channels: "*737# • *901# • *894# • *966# • All Banks",
    settlementTime: "Instant (15s)",
    popularFor: "Quick bank authorization even without an active data connection",
    color: "#F7931A",
    renderIcon: () => (
      <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-lg shrink-0">
        <Smartphone className="w-5 h-5" />
      </div>
    ),
  },
  {
    id: "escrow",
    name: "Sleek Safe Payment Hold",
    subtitle: "100% buyer protection guarantee",
    badge: "Protected",
    channels: "Safe Custody • Zero 'Pay Before Delivery' Scams",
    settlementTime: "Held until Delivery",
    popularFor: "Funds held safely until you receive and inspect your clothing items",
    color: "#10B981",
    renderIcon: () => (
      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
        <ShieldCheck className="w-5 h-5" />
      </div>
    ),
  },
];

export function ConvenientPaymentsSection() {
  const [selectedMethod, setSelectedMethod] = useState<SupportedPayment>(supportedMethods[0]);
  const waLink = getWhatsAppLink("Hi Sleek! I would like to make an order payment.");
  const tgLink = getTelegramBotLink();

  return (
    <section id="payments" className="py-20 bg-white border-t border-black/[0.06] relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl space-y-3 mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display uppercase tracking-tight text-neutral-950 leading-[1.05]">
            Pay With Naira <br />
            <span className="text-emerald-600">Or Instant Transfer.</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Sleek supports frictionless checkout for every shopper. Complete clothing and footwear orders effortlessly with local bank transfers, debit cards, USSD, or instant mobile wallets.
          </p>
        </div>

        {/* 2-Column Grid: Methods Grid + Live Detail Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left 7 cols: Payment Options Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {supportedMethods.map((method) => {
              const isSelected = selectedMethod.id === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method)}
                  className={`text-left rounded-2xl border p-4 transition-all duration-200 flex items-start gap-3.5 cursor-pointer ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600 shadow-sm"
                      : "border-black/[0.08] bg-[#f8f9fb] hover:border-black/20 hover:bg-white"
                  }`}
                >
                  <div className="shrink-0">{method.renderIcon()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-950 text-sm truncate">{method.name}</span>
                      <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-100/60 rounded px-1.5 py-0.5 shrink-0">
                        {method.badge}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 truncate font-medium mt-0.5">{method.subtitle}</div>
                    <div className="text-[11px] text-gray-400 mt-1 font-mono truncate">{method.channels}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right 5 cols: Live Protection & Detail Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-black/[0.08] bg-neutral-950 text-white p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                <div className="shrink-0">{selectedMethod.renderIcon()}</div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">{selectedMethod.name}</h3>
                  <p className="text-xs text-emerald-400 font-mono">Protected In-Chat Settlement</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-neutral-400">Supported Channels</span>
                  <span className="font-mono font-medium text-white text-right max-w-[220px]">{selectedMethod.channels}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-neutral-400">Confirmation Speed</span>
                  <span className="font-mono font-bold text-emerald-400">{selectedMethod.settlementTime}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-neutral-400">Best For</span>
                  <span className="text-neutral-200 text-right max-w-[200px] leading-tight">{selectedMethod.popularFor}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-neutral-400">Vendor Payout Choice</span>
                  <span className="font-medium text-white">Verified Merchant Bank Account</span>
                </div>
              </div>

              {/* Safety guarantee badge */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 flex items-start gap-2.5 text-xs text-emerald-300">
                <Lock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Funds are safely protected in Sleek Safe Hold. The verified seller is only paid after you inspect and confirm receipt of your clothing items.
                </p>
              </div>

              {/* Quick action buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#00c980] py-3 text-xs font-bold text-white transition hover:bg-[#00b372] shadow-sm"
                >
                  <span>Chat on WhatsApp</span>
                </a>
                <a
                  href={tgLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/15 py-3 text-xs font-bold text-white transition hover:bg-white/20"
                >
                  <span>Launch Storefront</span>
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
