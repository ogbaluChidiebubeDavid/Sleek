import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sleek — Turn Chats into Footwear Sales",
  description:
    "Buy footwear with Sleek AI on WhatsApp. Pay with Opay, crypto, Flutterwave, or Paystack.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
