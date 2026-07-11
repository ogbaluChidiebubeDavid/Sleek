"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, MoreVertical, Phone } from "lucide-react";
import { SleekLogo } from "@/components/brand/SleekLogo";

const carouselItems = [
  {
    name: "Air Jordan 1",
    subtitle: "High OG",
    price: "₦120,000",
    size: "Size 42",
    colors: ["#dc2626", "#ffffff", "#000000"], // Red, White, Black
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop",
  },
  {
    name: "Air Nike Air Force 1",
    subtitle: "Black",
    price: "₦85,000",
    size: "Size 41",
    colors: ["#000000", "#ffffff"], // Black, White
    image:
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=200&h=200&fit=crop",
  },
  {
    name: "Yeezy Slide",
    subtitle: "Sand",
    price: "₦35,000",
    size: "Size 43",
    colors: ["#d2b48c", "#8b7355"], // Sand/Beige shades
    image:
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=200&h=200&fit=crop",
  },
];

type PhoneMockupProps = {
  variant?: "full" | "peek";
};

export function PhoneMockup({ variant = "full" }: PhoneMockupProps) {
  const isPeek = variant === "peek";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className={`relative mx-auto w-full ${isPeek ? "max-w-[340px]" : "max-w-[325px]"}`}
    >
      {/* FLOATING SHAPE 1: Order Confirmed (top-left) */}
      <motion.div
        animate={{
          y: [0, -6, 0],
          rotate: [-1, 1.5, -1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-12 top-10 z-30 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl max-w-[210px]"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
          <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.507.003 9.974-4.463 9.977-9.974.002-2.67-1.037-5.18-2.92-7.067C16.45 1.677 13.942.67 11.274.67 5.767.67 1.3 5.137 1.297 10.648c-.001 1.57.418 3.1 1.214 4.467l-.95 3.47 3.56-.934zM17.91 14.86c-.328-.164-1.942-.96-2.242-1.07-.3-.11-.52-.164-.737.164-.218.327-.844 1.07-1.035 1.288-.19.217-.383.244-.71.082-.327-.164-1.38-.508-2.63-1.622-.972-.867-1.628-1.94-1.82-2.266-.19-.328-.02-.505.143-.668.147-.148.328-.383.49-.574.165-.19.22-.328.328-.546.11-.218.055-.41-.027-.573-.082-.164-.738-1.776-1.01-2.434-.26-.63-.53-.544-.73-.553-.19-.01-.41-.01-.63-.01-.218 0-.573.08-.873.41-.3.327-1.146 1.12-1.146 2.73 0 1.61 1.173 3.16 1.336 3.38.164.218 2.3 3.51 5.572 4.926.78.337 1.387.538 1.86.688.78.248 1.492.213 2.053.13.626-.094 1.943-.795 2.216-1.563.272-.767.272-1.423.19-1.563-.08-.14-.3-.218-.627-.38z" />
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-800 leading-tight">Order Confirmed! 🎉</p>
          <p className="text-[9px] text-gray-500 font-medium">Air Force 1 - Size 42</p>
        </div>
      </motion.div>

      {/* FLOATING SHAPE 2: Happy Buyers (bottom-right) */}
      <motion.div
        animate={{
          y: [0, 6, 0],
          rotate: [1, -1.5, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute -right-12 bottom-20 z-30 flex flex-col items-center rounded-2xl border border-gray-100 bg-white px-3.5 py-3 shadow-xl text-center min-w-[130px]"
      >
        <div className="flex gap-0.5 text-amber-400 text-xs">
          <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
        </div>
        <p className="text-[11px] font-black text-gray-800 mt-1 leading-none">4.9 / 5</p>
        <p className="text-[9px] text-gray-500 font-medium mt-0.5">2,400+ happy buyers</p>
      </motion.div>

      {/* Phone Mockup Frame wrapper with side buttons (inspired by useazza.com) */}
      <div className="relative mx-auto w-full select-none">
        
        {/* Left side button - Action Button */}
        <div className="absolute top-24 -left-[2px] w-[2.5px] h-6 bg-[#2d2d2f] rounded-l-sm border-r border-[#101012] z-0" />
        {/* Left side buttons - Volume Up / Down */}
        <div className="absolute top-36 -left-[2px] w-[2.5px] h-12 bg-[#2d2d2f] rounded-l-sm border-r border-[#101012] z-0" />
        <div className="absolute top-52 -left-[2px] w-[2.5px] h-12 bg-[#2d2d2f] rounded-l-sm border-r border-[#101012] z-0" />
        
        {/* Right side button - Power Button */}
        <div className="absolute top-44 -right-[2px] w-[2.5px] h-18 bg-[#2d2d2f] rounded-r-sm border-l border-[#101012] z-0" />

        {/* Outer Phone Bezel Chassis */}
        <motion.div
          animate={isPeek ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative rounded-[2.85rem] border-[6px] border-[#161618] bg-[#08080a] p-[5.5px] shadow-2xl shadow-black/50 overflow-hidden z-10"
        >
          {/* Inner screen content */}
          <div
            className={`overflow-hidden rounded-[2.4rem] bg-[#efeae2] flex flex-col relative ${
              isPeek ? "min-h-[640px]" : "min-h-[580px]"
            }`}
          >
            
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
            className="flex-1 overflow-y-auto p-3 space-y-3 flex flex-col justify-end"
            style={{
              backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
              backgroundSize: "contain",
              backgroundColor: "#efeae2",
            }}
          >
            <p className="text-center text-[10px] text-[#667781] py-1 bg-white/45 backdrop-blur-xs rounded-md mx-auto px-2 mb-2 font-medium">
              Today
            </p>

            {/* User message (Sent) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-[#d9fdd3] px-3 py-2 text-xs text-[#303030] shadow-xs relative flex flex-col gap-0.5"
            >
              <p>Hello I want to buy footwear 👟</p>
              <span className="text-[8px] text-[#667781] self-end mt-0.5 flex items-center gap-0.5">
                9:41 AM <span className="text-[#53bdeb] font-bold">✓✓</span>
              </span>
            </motion.div>

            {/* Agent message (Received) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="max-w-[90%] rounded-lg rounded-tl-none bg-white px-3 py-2 text-xs text-[#303030] shadow-xs border border-[#e9edef] flex flex-col gap-0.5"
            >
              <p>Check our catalogue and choose your preferred footwear 🛍️</p>
              <span className="text-[8px] text-[#667781] self-end mt-0.5">9:41 AM</span>
            </motion.div>

            {/* Footwear Carousel */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x"
            >
              {carouselItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.55 + i * 0.1 }}
                  className="snap-center shrink-0 w-[138px] rounded-xl bg-white overflow-hidden border border-gray-100 shadow-sm flex flex-col"
                >
                  {/* Padded image wrapper with matching light bg */}
                  <div
                    className={`relative h-24 w-full flex items-center justify-center p-2.5 ${
                      i === 0 ? "bg-[#E0F2FE]" : i === 1 ? "bg-[#FEE2E2]" : "bg-[#F3F4F6]"
                    }`}
                  >
                    <div className="relative h-full w-full rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover hover:scale-105 transition duration-300"
                        unoptimized
                      />
                    </div>
                  </div>
                  <div className="p-2 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-gray-900 truncate leading-tight">
                        {item.name}
                      </p>
                      <p className="text-[8px] text-gray-500">{item.subtitle}</p>
                      <p className="text-[9px] text-[#00c980] font-extrabold mt-1">
                        {item.price}
                      </p>
                      <p className="text-[7.5px] text-gray-400 mt-0.5">{item.size}</p>

                      {/* Color dot indicators */}
                      <div className="mt-1 flex gap-1 items-center">
                        {item.colors.map((color, idx) => (
                          <span
                            key={idx}
                            className="h-1.5 w-1.5 rounded-full border border-gray-200/50"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mt-2.5 flex gap-1">
                      <button
                        type="button"
                        className="flex-1 rounded bg-[#00c980] py-1 text-[8px] font-bold text-white shadow-sm shadow-[#00c980]/20 active:scale-95 transition"
                      >
                        Buy
                      </button>
                      <button
                        type="button"
                        className="flex-1 rounded border border-[#00c980] py-1 text-[8px] font-bold text-[#00c980] bg-white hover:bg-[#00c980]/5 active:scale-95 transition"
                      >
                        Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* View More Button */}
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.1 }}
              className="w-full rounded-full border border-[#00c980] bg-white py-2 text-xs font-semibold text-[#00c980] shadow-sm hover:bg-[#00c980]/5 transition active:scale-[0.99]"
            >
              View More
            </motion.button>
          </div>

          {/* WhatsApp Chat Input Footer */}
          {!isPeek && (
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
          )}
        </div>
      </motion.div>
      </div>
    </motion.div>
  );
}
