import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function generateTrackingNumber() {
  const prefix = "SL";
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

export function parseJsonArray<T>(value: string, fallback: T[] = []): T[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function getWhatsAppLink(message?: string) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348146272564";
  const text = encodeURIComponent(
    message || "Hello, I want to buy footwear"
  );
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${text}`;}

export function getDirectImageUrl(url: string): string {
  if (!url) return "";
  // Check if it is a Google Drive share link
  if (url.includes("drive.google.com")) {
    const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const fileId = (fileDMatch && fileDMatch[1]) || (idMatch && idMatch[1]);
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }
  return url;
}
