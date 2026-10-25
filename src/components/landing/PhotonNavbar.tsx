"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { getWhatsAppLink, getTelegramBotLink } from "@/lib/utils";
import { SleekLogo } from "@/components/brand/SleekLogo";

export function PhotonNavbar() {
  const [open, setOpen] = useState(false);
  const waLink = getWhatsAppLink();
  const tgLink = getTelegramBotLink();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#f5f5f7]/95 backdrop-blur-xl border-b border-black/[0.08] shadow-xs">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Sleek home" className="flex items-center gap-2.5">
            <SleekLogo />
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-6 lg:flex">
          <a
            href="#faq"
            className="text-xs font-medium tracking-tight text-gray-600 transition hover:text-gray-950"
          >
            FAQ
          </a>
          <Link
            href="/vendor/signup"
            className="text-xs font-medium tracking-tight text-gray-600 transition hover:text-gray-950"
          >
            Vendor Portal
          </Link>
        </div>

        {/* Action CTAs */}
        <div className="hidden items-center gap-3 sm:flex">
          <a
            href={tgLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 hover:border-black/20"
          >
            <svg className="h-3.5 w-3.5 fill-[#229ED9]" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            <span>Telegram</span>
          </a>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800 active:scale-95"
          >
            <span>Launch Sleek AI</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          id="mobile-menu-button"
          className="relative z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white/80 p-2 text-gray-900 shadow-xs hover:bg-black/5 active:bg-black/10 lg:hidden cursor-pointer touch-manipulation select-none"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div 
          id="mobile-drawer"
          className="border-b border-black/10 bg-white px-6 py-6 shadow-2xl lg:hidden transition-all duration-200"
        >
          <div className="flex flex-col gap-4 text-sm font-semibold text-gray-900">
            <a href="#features" onClick={() => setOpen(false)} className="py-1 hover:text-emerald-600 transition">
              Conversational Features
            </a>
            <a href="#faq" onClick={() => setOpen(false)} className="py-1 hover:text-emerald-600 transition">
              FAQ
            </a>
            <Link href="/vendor/signup" onClick={() => setOpen(false)} className="py-1 hover:text-emerald-600 transition">
              Vendor Portal
            </Link>
            <div className="pt-3 flex flex-col gap-2.5">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#00c980] py-3 text-center text-sm font-bold text-white shadow-md shadow-[#00c980]/20"
              >
                <span>Chat on WhatsApp</span>
              </a>
              <a
                href={tgLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#229ED9] py-3 text-center text-sm font-bold text-white shadow-md shadow-[#229ED9]/20"
              >
                <span>Launch Telegram Store</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
