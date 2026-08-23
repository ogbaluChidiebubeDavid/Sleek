"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  formatCurrency,
  getWhatsAppLink,
  isTelegramWebApp,
  closeTelegramApp,
} from "@/lib/utils";
import { CheckCircle, ExternalLink, MessageSquare } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<{
    trackingNumber: string;
    totalAmount: number;
    paymentRef: string | null;
    txHash: string | null;
    vendor?: {
      businessName: string;
      phone?: string;
    } | null;
  } | null>(null);

  useEffect(() => {
    try {
      localStorage.removeItem("sleek_cart_backup");
    } catch (e) {}
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then(setOrder)
      .catch(console.error);
  }, [orderId]);

  const inTelegram = isTelegramWebApp() || (order as any)?.user?.phone?.startsWith("tg:");

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6 text-center">
      <CheckCircle className="h-16 w-16 text-green-400 mb-6" />
      <h1 className="text-3xl font-bold mb-2">Payment successful</h1>
      
      {order ? (
        <div className="max-w-md w-full space-y-4 mb-8">
          <p className="text-gray-400 text-sm">
            Receipt Ref: <span className="text-white font-mono">{order.paymentRef || orderId?.slice(-8).toUpperCase()}</span>
          </p>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Tracking Number</span>
              <p className="text-xl font-mono text-sleek-400 font-bold mt-0.5">{order.trackingNumber}</p>
            </div>

            {order.vendor && (
              <div className="bg-black/30 border border-white/5 rounded-xl p-3 text-left space-y-1.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  🏪 Fulfilled by Vendor
                </span>
                <p className="text-sm font-semibold text-white">{order.vendor.businessName}</p>
                {order.vendor.phone && (
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`tel:${order.vendor.phone}`}
                      className="text-xs text-[#00c980] bg-[#00c980]/10 hover:bg-[#00c980]/20 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1 border border-[#00c980]/20"
                    >
                      📞 Call ({order.vendor.phone})
                    </a>
                    <a
                      href={`https://wa.me/${order.vendor.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1 border border-[#25D366]/20"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                )}
              </div>
            )}
            
            <p className="text-xs text-gray-500">
              Use this tracking number {inTelegram ? "in our Telegram bot chat to track your order" : "in WhatsApp to query shipping progress anytime"}.
            </p>

            <p className="text-2xl font-bold font-mono text-white mt-4">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>

          {order.txHash && (
            <div className="text-xs text-gray-400">
              <p className="font-semibold text-gray-300 mb-1">Transaction Hash:</p>
              <p className="font-mono text-gray-500 truncate max-w-xs mx-auto mb-2">{order.txHash}</p>
              <a
                href={`https://sepolia.basescan.org/tx/${order.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sleek-400 hover:text-sleek-300 font-semibold hover:underline"
              >
                View on Basescan <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-400 text-sm mb-8">Loading order transaction details...</p>
      )}

      {inTelegram ? (
        <button
          type="button"
          onClick={closeTelegramApp}
          className="inline-flex items-center gap-2 rounded-full bg-[#2AABEE] px-8 py-3.5 font-bold text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition"
        >
          <MessageSquare className="h-5 w-5" /> Return to Telegram
        </button>
      ) : (
        <a
          href={getWhatsAppLink(order ? `track ${order.trackingNumber}` : "I want to track my order")}
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-3.5 font-bold text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition"
        >
          <MessageSquare className="h-5 w-5" /> Return to WhatsApp
        </a>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
