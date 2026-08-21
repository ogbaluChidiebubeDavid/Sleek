import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sleek — Turn Chats into Footwear Sales",
  description:
    "Buy footwear with Sleek AI on WhatsApp and Telegram. Pay securely with Paystack, Opay, Flutterwave, or Crypto.",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/sleek-logo.png", sizes: "192x192", type: "image/png" },
      { url: "/sleek-logo.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Telegram Mini App SDK — no-op outside Telegram */}
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
