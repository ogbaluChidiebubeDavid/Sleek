import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sleekai.xyz"),
  title: "Sleek AI — Conversational E-Commerce Protocol",
  description:
    "Buy and sell through text. Autonomous conversational commerce powered by AI on WhatsApp and Telegram with KYC-verified vendors and escrow payment protection.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png?v=3" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
      </head>
      <body className="antialiased bg-[#f5f5f7] text-gray-900">
        {/* Telegram Mini App SDK — no-op outside Telegram */}
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
