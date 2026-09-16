"use client";

import { useState } from "react";
import { ShieldCheck, Zap, ArrowRight, CheckCircle2, Globe, Coins, Lock } from "lucide-react";
import { getTelegramBotLink, getWhatsAppLink } from "@/lib/utils";

type SupportedAsset = {
  id: string;
  name: string;
  symbol: string;
  network: string;
  settlementTime: string;
  popularFor: string;
  color: string;
  renderIcon: () => React.ReactNode;
};

const supportedCoins: SupportedAsset[] = [
  {
    id: "usdt",
    name: "Tether USD",
    symbol: "USDT",
    network: "Base • Tron • Polygon",
    settlementTime: "Instant (10s)",
    popularFor: "Most popular for P2P electronics & gadgets",
    color: "#26A17B",
    renderIcon: () => (
      <svg viewBox="0 0 2000 2000" className="w-10 h-10 shrink-0">
        <path
          d="M1000 0c552.285 0 1000 447.715 1000 1000s-447.715 1000-1000 1000S0 1552.285 0 1000 447.715 0 1000 0z"
          fill="#26A17B"
        />
        <path
          d="M1150 634.5v-138H850v138c-323.5 15.5-565 67.5-565 130s241.5 114.5 565 130v382h300v-382c323.5-15.5 565-67.5 565-130s-241.5-114.5-565-130zm0 185c-15.5 1-89 6.5-150 6.5s-134.5-5.5-150-6.5c-237.5-12.5-412.5-49-412.5-92.5s175-80 412.5-92.5c15.5-1 89-6.5 150-6.5s134.5 5.5 150 6.5c237.5 12.5 412.5 49 412.5 92.5s-175 80-412.5 92.5z"
          fill="#fff"
        />
        <path
          d="M1000 1205.5c-74.5 0-210-4.5-275-16.5v280c65 11 190.5 16.5 275 16.5s210-5.5 275-16.5v-280c-65 12-200.5 16.5-275 16.5z"
          fill="#fff"
        />
      </svg>
    ),
  },
  {
    id: "usdc",
    name: "USD Coin",
    symbol: "USDC",
    network: "Base • Ethereum • Solana",
    settlementTime: "Instant (2s)",
    popularFor: "1:1 Dollar backing for zero-volatility sales",
    color: "#2775CA",
    renderIcon: () => (
      <svg viewBox="0 0 2000 2000" className="w-10 h-10 shrink-0">
        <circle cx="1000" cy="1000" r="1000" fill="#2775CA" />
        <path
          d="M1275 1158c0-128-77-172-230-192-106-14-128-39-128-89 0-45 35-77 98-77 60 0 94 24 105 70 3 13 14 20 27 20h64c15 0 26-12 24-27-14-77-69-130-158-144v-96c0-15-12-27-27-27h-60c-15 0-27 12-27 27v93c-98 14-162 76-162 165 0 121 73 166 226 187 109 17 132 37 132 94 0 54-44 91-110 91-82 0-119-36-130-89-3-14-14-23-28-23h-68c-15 0-27 12-25 27 15 90 73 148 189 164v96c0 15 12 27 27 27h60c15 0 27-12 27-27v-97c99-16 169-77 169-176z"
          fill="#fff"
        />
        <path
          d="M740 1675c-372-135-573-547-438-919 88-243 302-411 561-446 16-2 27-16 27-32V214c0-18-15-32-33-31-452 38-809 417-809 879 0 488 396 884 884 884 213 0 415-76 573-214 14-12 15-33 2-46l-46-46c-12-12-32-13-46-3-176 156-427 210-675 38z"
          fill="#fff"
          opacity="0.75"
        />
        <path
          d="M1698 1244c135-372-66-784-438-919-248-172-499-118-675 38-14 10-34 9-46-3l-46-46c-13-13-12-34 2-46 158-138 360-214 573-214 488 0 884 396 884 884 0 462-357 841-809 879-18 1-33-13-33-31v-64c0-16 11-30 27-32 259-35 473-203 561-446z"
          fill="#fff"
          opacity="0.75"
        />
      </svg>
    ),
  },
  {
    id: "base",
    name: "Base Network (ETH/USDC)",
    symbol: "BASE",
    network: "Coinbase L2 Network",
    settlementTime: "Instant (<1s)",
    popularFor: "Sub-cent fees for mobile conversational commerce",
    color: "#0052FF",
    renderIcon: () => (
      <svg viewBox="0 0 1000 1000" className="w-10 h-10 shrink-0">
        <circle cx="500" cy="500" r="500" fill="#0052FF" />
        <path
          d="M500 800C665.685 800 800 665.685 800 500C800 334.315 665.685 200 500 200C343.438 200 215.111 319.789 201.272 472.222H600V527.778H201.272C215.111 680.211 343.438 800 500 800Z"
          fill="#fff"
        />
      </svg>
    ),
  },
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    network: "Bitcoin Native • Lightning",
    settlementTime: "1-2 Confirmations",
    popularFor: "High-value luxury purchases & tech hardware",
    color: "#F7931A",
    renderIcon: () => (
      <svg viewBox="0 0 32 32" className="w-10 h-10 shrink-0">
        <circle cx="16" cy="16" r="16" fill="#F7931A" />
        <path
          d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.537c-.535 2.146-4.152.986-5.325.693l.95-3.81c1.173.293 4.929.872 4.375 3.117zm.536-5.565c-.488 1.954-3.502.962-4.479.718l.86-3.45c.977.243 4.125.7 3.619 2.732z"
          fill="#fff"
        />
      </svg>
    ),
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    network: "Ethereum Mainnet • L2s",
    settlementTime: "Fast (12s)",
    popularFor: "Web3 native buyers and cross-border shoppers",
    color: "#627EEA",
    renderIcon: () => (
      <svg viewBox="0 0 32 32" className="w-10 h-10 shrink-0">
        <circle cx="16" cy="16" r="16" fill="#627EEA" />
        <path
          d="M16.498 4v8.87l7.497 3.35z"
          fill="#fff"
          fillOpacity="0.6"
        />
        <path d="M16.498 4L9 16.22l7.498-3.35z" fill="#fff" />
        <path
          d="M16.498 21.968v6.027L24 17.616z"
          fill="#fff"
          fillOpacity="0.6"
        />
        <path d="M16.498 27.995v-6.027L9 17.616z" fill="#fff" />
        <path
          d="M16.498 20.573l7.497-4.353-7.497-3.348z"
          fill="#fff"
          fillOpacity="0.2"
        />
        <path
          d="M9 16.22l7.498 4.353v-7.701z"
          fill="#fff"
          fillOpacity="0.6"
        />
      </svg>
    ),
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    network: "Solana High-Speed Network",
    settlementTime: "Instant (400ms)",
    popularFor: "Ultra-fast micro-transactions & instant checkout",
    color: "#14F195",
    renderIcon: () => (
      <svg viewBox="0 0 397.7 311.7" className="w-10 h-10 p-1.5 shrink-0 bg-black rounded-full">
        <defs>
          <linearGradient id="solanaGrad1" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00FFA3" />
            <stop offset="100%" stopColor="#DC1FFF" />
          </linearGradient>
          <linearGradient id="solanaGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00FFA3" />
            <stop offset="100%" stopColor="#DC1FFF" />
          </linearGradient>
          <linearGradient id="solanaGrad3" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00FFA3" />
            <stop offset="100%" stopColor="#DC1FFF" />
          </linearGradient>
        </defs>
        <path
          d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"
          fill="url(#solanaGrad1)"
        />
        <path
          d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"
          fill="url(#solanaGrad2)"
        />
        <path
          d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"
          fill="url(#solanaGrad3)"
        />
      </svg>
    ),
  },
];

export function CryptoSettlementSection() {
  const [selectedCoin, setSelectedCoin] = useState<SupportedAsset>(supportedCoins[0]);
  const waLink = getWhatsAppLink("I want to pay with crypto on Sleek");
  const tgLink = getTelegramBotLink();

  return (
    <section id="crypto-settlement" className="py-20 bg-white border-t border-black/[0.06] relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        
        {/* Header */}
        <div className="max-w-2xl space-y-3 mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-neutral-950 uppercase font-display leading-[1.1]">
            Pay with Naira <br />
            <span className="text-emerald-600">or Settle in Crypto.</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Sleek supports multi-currency settlement. Nigerian buyers and international diaspora can checkout effortlessly with local bank transfers or globally recognized stablecoins and cryptocurrencies.
          </p>
        </div>

        {/* 2-Column Grid: Assets Grid + Live Settlement Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left 7 cols: Realistic Coins Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {supportedCoins.map((coin) => {
              const isSelected = selectedCoin.id === coin.id;
              return (
                <button
                  key={coin.id}
                  type="button"
                  onClick={() => setSelectedCoin(coin)}
                  className={`text-left rounded-2xl border p-4 transition-all duration-200 flex items-start gap-3.5 ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600 shadow-sm"
                      : "border-black/[0.08] bg-[#f8f9fb] hover:border-black/20 hover:bg-white"
                  }`}
                >
                  <div className="shrink-0">{coin.renderIcon()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-950 text-sm">{coin.symbol}</span>
                      <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-100/60 rounded px-1.5 py-0.5">
                        {coin.settlementTime}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 truncate font-medium">{coin.name}</div>
                    <div className="text-[11px] text-gray-400 mt-1 font-mono">{coin.network}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right 5 cols: Live Protection & Settlement Detail Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-black/[0.08] bg-neutral-950 text-white p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                <div className="shrink-0">{selectedCoin.renderIcon()}</div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">{selectedCoin.name} ({selectedCoin.symbol})</h3>
                  <p className="text-xs text-emerald-400 font-mono">Protected In-Chat Settlement</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-neutral-400">Supported Networks</span>
                  <span className="font-mono font-medium text-white">{selectedCoin.network}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-neutral-400">Confirmation Speed</span>
                  <span className="font-mono font-bold text-emerald-400">{selectedCoin.settlementTime}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-neutral-400">Best For</span>
                  <span className="text-neutral-200 text-right max-w-[200px] leading-tight">{selectedCoin.popularFor}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-neutral-400">Vendor Payout Choice</span>
                  <span className="font-medium text-white">Direct Naira Bank or Wallet</span>
                </div>
              </div>

              {/* Safety guarantee badge */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 flex items-start gap-2.5 text-xs text-emerald-300">
                <Lock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Cryptocurrency funds are securely locked in safe payment hold. The verified vendor is paid once the buyer receives their order.
                </p>
              </div>

              {/* Quick action buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <a
                  href={tgLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#229ED9] py-3 text-xs font-bold text-white transition hover:bg-[#1f8ec4]"
                >
                  <span>Pay via Telegram Bot</span>
                </a>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#00c980] py-3 text-xs font-bold text-white transition hover:bg-[#00b372]"
                >
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
