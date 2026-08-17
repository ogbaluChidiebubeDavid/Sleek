"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";

function DemoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId") || "";
  const provider = searchParams.get("provider") || "demo";
  const [completing, setCompleting] = useState(false);

  const complete = async () => {
    if (!orderId) return;
    setCompleting(true);
    try {
      await fetch("/api/payments/demo-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, provider }),
      });
      router.push(`/checkout/success?orderId=${orderId}`);
    } catch (err) {
      console.error("Demo completion failed:", err);
      setCompleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b0e] text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0ba4db]/10 border border-[#0ba4db]/20">
          <CreditCard className="h-6 w-6 text-[#0ba4db]" />
        </div>
        <h1 className="text-lg font-bold">Demo Checkout</h1>
        <p className="text-xs text-gray-400 leading-relaxed">
          Live payment keys for <span className="font-mono text-gray-300">{provider}</span> are
          not configured yet, so this is a simulated checkout. Add the provider&apos;s secret
          key in Vercel to enable real payments.
        </p>
        <button
          type="button"
          onClick={complete}
          disabled={completing || !orderId}
          className="w-full rounded-xl bg-[#00c980] py-3.5 font-bold text-white text-sm hover:bg-[#059669] transition disabled:opacity-50"
        >
          {completing ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Completing…
            </span>
          ) : (
            "Complete Demo Payment"
          )}
        </button>
        {!orderId && (
          <p className="text-[11px] text-red-400">
            Missing orderId — restart checkout from the catalogue.
          </p>
        )}
      </div>
    </div>
  );
}

export default function DemoCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070b0e]" />}>
      <DemoContent />
    </Suspense>
  );
}
