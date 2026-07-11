"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { getWhatsAppLink } from "@/lib/utils";
import { SleekLogo } from "@/components/brand/SleekLogo";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const waLink = getWhatsAppLink();

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
          </motion.div>
        </motion.div>
      )}
    </motion.header>
  );
}
