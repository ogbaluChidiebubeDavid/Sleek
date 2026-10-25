"use client";

import Link from "next/link";
import { SleekLogo } from "@/components/brand/SleekLogo";
import { getWhatsAppLink, getTelegramBotLink } from "@/lib/utils";

export function Footer() {
  const waLink = getWhatsAppLink();
  const tgLink = getTelegramBotLink();

  return (
    <footer className="border-t border-black/[0.06] bg-[#f5f5f7] py-14 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-black/[0.06]">
          {/* Brand Info */}
          <div className="col-span-2 space-y-3">
            <SleekLogo />
            <p className="text-gray-500 max-w-sm leading-relaxed">
              The AI-native conversational commerce engine for Africa. Operating across WhatsApp and Telegram with safe payment protection.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-gray-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Lagos, Nigeria • Operating 24/7</span>
            </div>
          </div>

          {/* Channels */}
          <div className="space-y-2.5">
            <span className="font-bold text-gray-950 font-mono text-[11px] uppercase tracking-wider block">
              Channels
            </span>
            <ul className="space-y-2 text-gray-600">
              <li>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-black transition">
                  WhatsApp AI Shopper
                </a>
              </li>
              <li>
                <a href={tgLink} target="_blank" rel="noopener noreferrer" className="hover:text-black transition">
                  Telegram Mini App
                </a>
              </li>
            </ul>
          </div>

          {/* Merchants */}
          <div className="space-y-2.5">
            <span className="font-bold text-gray-950 font-mono text-[11px] uppercase tracking-wider block">
              Vendors
            </span>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link href="/vendor/signup" className="hover:text-black transition">
                  Vendor Sign Up &amp; KYC
                </Link>
              </li>
              <li>
                <Link href="/vendor/dashboard" className="hover:text-black transition">
                  Vendor Dashboard
                </Link>
              </li>
              <li>
                <a href="#safety" className="hover:text-black transition">
                  Seller Protection
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div className="space-y-2.5">
            <span className="font-bold text-gray-950 font-mono text-[11px] uppercase tracking-wider block">
              Trust &amp; Legal
            </span>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link href="/privacy" className="hover:text-black transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-black transition">
                  Buyer Protection Terms
                </a>
              </li>
              <li>
                <a href={getWhatsAppLink("Support inquiry")} target="_blank" rel="noopener noreferrer" className="hover:text-black transition">
                  Dispute Resolution
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500">
          <p>© {new Date().getFullYear()} Sleek Technologies Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-400 font-mono text-[11px]">
            <span>KYC Verified Vendors</span>
            <span>•</span>
            <span>Paystack Certified</span>
            <span>•</span>
            <span>Safe Payment Hold</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
