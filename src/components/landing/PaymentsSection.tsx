"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type CoinItem = {
  id: string;
  name: string;
  desc: string;
  colorStart: string;
  colorEnd: string;
  shadowColor: string;
  size: number;
  x: string;
  y: string;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
};

const coinData: CoinItem[] = [
  {
    id: "btc",
    name: "Bitcoin",
    desc: "The world's original cryptocurrency. Secure digital gold processed instantly on fast layer-2 networks.",
    colorStart: "#ff9900",
    colorEnd: "#d84315",
    shadowColor: "rgba(255, 87, 34, 0.3)",
    size: 105,
    x: "8%",
    y: "12%",
    driftX: 12,
    driftY: -15,
    duration: 8,
    delay: 0,
  },
  {
    id: "eth",
    name: "Ethereum",
    desc: "Decentralized programmable money. Fast, native layer-2 payments on the Base scaling network.",
    colorStart: "#c7d2fe",
    colorEnd: "#4f46e5",
    shadowColor: "rgba(79, 70, 229, 0.3)",
    size: 100,
    x: "36%",
    y: "8%",
    driftX: -12,
    driftY: -10,
    duration: 8.5,
    delay: 1.8,
  },
  {
    id: "usdt",
    name: "USDT Stablecoin",
    desc: "Globally accepted dollar-pegged digital currency. Secure, stable, and highly liquid for cross-border footwear transactions.",
    colorStart: "#5eead4",
    colorEnd: "#0d9488",
    shadowColor: "rgba(13, 148, 136, 0.3)",
    size: 95,
    x: "64%",
    y: "14%",
    driftX: -8,
    driftY: 10,
    duration: 7,
    delay: 1.2,
  },
  {
    id: "sol",
    name: "Solana",
    desc: "Ultra-fast, low-cost layer-1 network. Complete your checkout with near-zero transaction fees and instant settlement.",
    colorStart: "#f472b6",
    colorEnd: "#10b981",
    shadowColor: "rgba(16, 185, 129, 0.3)",
    size: 92,
    x: "82%",
    y: "12%",
    driftX: 10,
    driftY: -12,
    duration: 7.2,
    delay: 0.9,
  },
  {
    id: "arb",
    name: "Arbitrum",
    desc: "Leading Ethereum layer-2 scaling solution. High speed, minimal gas fees, and robust security for stablecoin payments.",
    colorStart: "#38bdf8",
    colorEnd: "#0250b3",
    shadowColor: "rgba(2, 80, 179, 0.3)",
    size: 90,
    x: "18%",
    y: "50%",
    driftX: -10,
    driftY: 10,
    duration: 6.8,
    delay: 2.2,
  },
  {
    id: "mantle",
    name: "Mantle Network",
    desc: "High-performance modular Ethereum layer-2 scaling network, providing fast block times and low transaction costs.",
    colorStart: "#2dd4bf",
    colorEnd: "#0f766e",
    shadowColor: "rgba(15, 118, 110, 0.3)",
    size: 92,
    x: "48%",
    y: "48%",
    driftX: 8,
    driftY: 14,
    duration: 6.5,
    delay: 2.5,
  },
  {
    id: "xrp",
    name: "XRP Ledger",
    desc: "Global real-time settlement network. Enables swift, carbon-efficient, and low-cost payments worldwide.",
    colorStart: "#60a5fa",
    colorEnd: "#2563eb",
    shadowColor: "rgba(37, 99, 235, 0.3)",
    size: 90,
    x: "76%",
    y: "50%",
    driftX: -12,
    driftY: -8,
    duration: 7.8,
    delay: 1.5,
  },
];

// Flat Vector SVG Logo components for each supported coin
function TokenLogo({ id }: { id: string }) {
  if (id === "btc") {
    return (
      <svg viewBox="0 0 100 100" className="w-10 h-10 text-white fill-current">
        <path d="M35 22h24c9 0 15 5 15 11 0 5-3 8-7 9.5 6 1.5 9 5.5 9 11.5 0 8-6 12-17 12H35V22zm11.5 9.5v9h7c2.5 0 4-1 4-4.5s-1.5-4.5-4-4.5h-7zm0 17.5v10.5h8c2.5 0 4-1 4-5s-1.5-5.5-4-5.5h-8z" />
        <path d="M44 12v10M52 12v10M44 64v10M52 64v10" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === "eth") {
    return (
      <svg viewBox="0 0 100 100" className="w-10 h-10 text-white fill-current">
        <polygon points="50,10 80,48 50,65" fillOpacity="0.9" />
        <polygon points="50,10 20,48 50,65" fillOpacity="0.65" />
        <polygon points="50,69 80,52 50,90" fillOpacity="0.9" />
        <polygon points="50,69 20,52 50,90" fillOpacity="0.65" />
      </svg>
    );
  }
  if (id === "usdt") {
    return (
      <svg viewBox="0 0 100 100" className="w-10 h-10 text-white fill-current">
        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="7" fill="none" />
        <path d="M26 36h48M50 36v36" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
        <path d="M37 49h26" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === "sol") {
    return (
      <svg viewBox="0 0 100 100" className="w-10 h-10 text-white fill-current">
        <path d="M 20 25 L 80 25 L 65 40 L 5 40 Z" />
        <path d="M 35 45 L 95 45 L 80 60 L 20 60 Z" />
        <path d="M 20 65 L 80 65 L 65 80 L 5 80 Z" />
      </svg>
    );
  }
  if (id === "arb") {
    return (
      <svg viewBox="0 0 100 100" className="w-10 h-10 text-white fill-current">
        <path d="M 50 10 L 90 90 L 50 70 L 10 90 Z" />
        <path d="M 50 32 L 76 84 L 50 70 L 24 84 Z" fillOpacity="0.5" />
      </svg>
    );
  }
  if (id === "mantle") {
    return (
      <svg viewBox="0 0 100 100" className="w-10 h-10 text-white fill-current">
        <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="7" strokeDasharray="30 15" />
        <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="5" />
      </svg>
    );
  }
  if (id === "xrp") {
    return (
      <svg viewBox="0 0 100 100" className="w-10 h-10 text-white fill-current">
        <path d="M 20 20 L 50 50 L 80 20 M 50 50 L 50 90" stroke="currentColor" strokeWidth="10.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return null;
}

export function PaymentsSection() {
  const [activeCoinId, setActiveCoinId] = useState<string | null>(null);

  const activeCoin = coinData.find((c) => c.id === activeCoinId);

  return (
    <section id="payments" className="py-24 sm:py-28 azza-pattern border-y border-gray-200/80">
      <div className="mx-auto max-w-6xl px-6">
        
        {/* Header Section without the deleted subtext block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="text-center mb-6"
        >
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-gray-900 sm:text-4xl">
            Pay your way
          </h2>
        </motion.div>

        {/* 3D Glassmorphism Coin Playground */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="relative mx-auto w-full h-[520px] rounded-3xl bg-white/40 backdrop-blur-md border border-gray-200/50 shadow-inner overflow-hidden flex flex-col justify-between p-6"
        >
          {/* Subtle grid background pattern inside the bubble box */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#00c980 1px, transparent 1px)`,
              backgroundSize: "16px 16px",
            }}
          />

          {/* Interactive Floating 3D Coin Spheres Arena */}
          <div className="relative flex-1 w-full">
            {coinData.map((coin) => (
              <motion.div
                key={coin.id}
                onMouseEnter={() => setActiveCoinId(coin.id)}
                onMouseLeave={() => setActiveCoinId(null)}
                className="absolute rounded-full flex items-center justify-center cursor-pointer select-none"
                style={{
                  left: coin.x,
                  top: coin.y,
                  width: coin.size,
                  height: coin.size,
                  
                  // 3D sphere gradient, multi-layered box-shadow, and blur sheen filter
                  background: `linear-gradient(135deg, ${coin.colorStart}, ${coin.colorEnd})`,
                  boxShadow: `0 10px 20px rgba(0,0,0,0.15), inset 0 -4px 8px rgba(0,0,0,0.2), 0 0 15px ${coin.shadowColor}`,
                  border: "1px solid rgba(255,255,255,0.4)",
                  backdropFilter: "blur(4px)",
                  WebkitBackdropFilter: "blur(4px)",
                }}
                animate={{
                  x: [0, coin.driftX, -coin.driftX, 0],
                  y: [0, coin.driftY, -coin.driftY, 0],
                }}
                transition={{
                  duration: coin.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: coin.delay,
                }}
                whileHover={{ scale: 1.15, rotate: 6, zIndex: 40 }}
              >
                {/* 3D Gloss reflection overlay */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)",
                  }}
                />

                {/* Centered Vector Logo */}
                <div className="flex items-center justify-center w-full h-full p-2 text-white">
                  <TokenLogo id={coin.id} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Central Interactive Info Panel */}
          <div className="relative z-10 w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-xs border border-gray-100 p-5 rounded-2xl shadow-md min-h-[105px] flex flex-col justify-center text-center">
            <AnimatePresence mode="wait">
              {activeCoin ? (
                <motion.div
                  key={activeCoin.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5"
                >
                  <h4
                    className="text-sm font-black flex items-center justify-center gap-2"
                    style={{ color: activeCoin.colorEnd }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: activeCoin.colorEnd }}
                    />
                    {activeCoin.name}
                  </h4>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed max-w-lg mx-auto">
                    {activeCoin.desc}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-1"
                >
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#00c980]">
                    Hover over any coin to inspect details
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium max-w-md mx-auto">
                    Move your cursor over a digital asset to view payment details, checkout speed, and transaction networks.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Receipt & Tracking Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="mt-16 grid lg:grid-cols-2 gap-8 items-center rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-sm"
        >
          <div className="p-8 lg:p-12">
            <h3 className="font-display text-2xl font-black uppercase text-gray-900">
              Receipt & tracking
            </h3>
            <p className="mt-4 text-gray-600">
              After payment, Sleek sends your receipt and tracking number (e.g. SL-ABC123). Ask
              anytime in chat for order status.
            </p>
          </div>
          <div className="bg-[#e7e9ec] p-8 lg:p-10">
            <div className="rounded-xl bg-white p-5 text-sm shadow-inner space-y-2 border border-gray-100">
              <p className="text-sleek-600 font-semibold">Payment successful</p>
              <p className="text-gray-700">Receipt #SL8A2B91</p>
              <p className="font-mono font-medium text-gray-900">Tracking: SL-M3K9X2-A7B2</p>
              <p className="text-gray-500 text-xs">Status: Preparing shipment</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
