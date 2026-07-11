"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { formatCurrency, getWhatsAppLink } from "@/lib/utils";
import { CheckCircle, ExternalLink, MessageSquare } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<{
    trackingNumber: string;
    totalAmount: number;
    paymentRef: string | null;
    txHash: string | null;
  } | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then(setOrder)
      .catch(console.error);
  }, [orderId]);

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
            
            <p className="text-xs text-gray-500">
              Use this tracking number in WhatsApp to query shipping progress anytime.
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

      <a
        href={getWhatsAppLink(order ? `track ${order.trackingNumber}` : "I want to track my order")}
        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-3.5 font-bold text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition"
      >
        <MessageSquare className="h-5 w-5" /> Return to WhatsApp
      </a>
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
