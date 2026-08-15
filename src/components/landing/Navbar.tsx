"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { getWhatsAppLink, getTelegramBotLink } from "@/lib/utils";
import { SleekLogo } from "@/components/brand/SleekLogo";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const waLink = getWhatsAppLink();
  const tgLink = getTelegramBotLink();

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#f4f5f7]/90 backdrop-blur-md"
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" aria-label="Sleek home">
          <SleekLogo />
        </Link>

        <button
          type="button"
          className="md:hidden text-gray-800 p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Features
          </a>
          <a href="#payments" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Payments
          </a>
          <a href="#faq" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            FAQ
          </a>
          <Link href="/vendor/signup" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Vendor Portal
          </Link>
          <a
            href={tgLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Shop on Telegram"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2AABEE] text-white shadow-md shadow-[#2AABEE]/30 transition hover:bg-[#229ED9]"
          >
            {/* Telegram paper-plane icon */}
            <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          </a>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-sleek-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-sleek-500/30 hover:bg-sleek-600 transition"
          >
            Get Started
          </a>
        </div>
      </nav>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-gray-200 bg-white px-6 py-4 md:hidden"
        >
          <motion.div className="flex flex-col gap-3">
            <a href="#features" onClick={() => setOpen(false)} className="text-gray-700">
              Features
            </a>
            <a href="#payments" onClick={() => setOpen(false)} className="text-gray-700">
              Payments
            </a>
            <Link href="/vendor/signup" onClick={() => setOpen(false)} className="text-gray-700">
              Vendor Portal
            </Link>
            <a
              href={waLink}
              className="mt-2 rounded-full bg-sleek-500 py-3 text-center font-semibold text-white"
            >
              Get Started
            </a>
            <a
              href={tgLink}
              className="rounded-full bg-[#2AABEE] py-3 text-center font-semibold text-white"
            >
              Shop on Telegram
            </a>
          </motion.div>
        </motion.div>
      )}
    </motion.header>
  );
}
