import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sleek — Turn Chats into Footwear Sales",
  description:
    "Buy footwear with Sleek AI on WhatsApp. Pay with Opay, crypto, Flutterwave, or Paystack.",
  icons: {
    icon: "/sleek-logo.png",
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
