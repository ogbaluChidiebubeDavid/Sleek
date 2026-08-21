import { NextRequest, NextResponse } from "next/server";
import { verifyPaystack, markOrderPaid } from "@/lib/payments";
import { prisma } from "@/lib/db";

/**
 * Paystack redirect callback. Robust against Paystack appending its
 * reference with another '?' (corrupting searchParams) — params are
 * parsed from the raw URL, and the order can also be resolved via the
 * payment reference we stored at init time.
 */
export async function GET(req: NextRequest) {
  const raw = req.url;

  const param = (name: string): string | null => {
    const m = raw.match(new RegExp(`[?&]${name}=([^&?]+)`));
    return m ? decodeURIComponent(m[1]) : null;
  };

  const reference = param("reference") || param("trxref");
  let orderId = param("orderId");

  if (!reference) {
    return NextResponse.redirect(new URL("/catalog", req.url));
  }

  // Resolve the order: by orderId param if valid, else by the reference
  // we saved on the order when initializing the transaction.
  let order = null;
  if (orderId) {
    order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { trackingNumber: orderId }],
      },
    }).catch(() => null);
  }
  if (!order) {
    order = await prisma.order
      .findFirst({ where: { paymentRef: reference } })
      .catch(() => null);
    orderId = order?.id || orderId;
  }

  if (!orderId || !order) {
    return NextResponse.redirect(new URL("/catalog", req.url));
  }
  if (order.paymentStatus === "paid") {
    return NextResponse.redirect(new URL(`/checkout/success?orderId=${order.id}`, req.url));
  }

  const ok = await verifyPaystack(reference);
  if (ok) {
    await markOrderPaid(order.id, reference, "paystack").catch((err) =>
      console.error("[Paystack callback] markOrderPaid failed:", err)
    );
    return NextResponse.redirect(new URL(`/checkout/success?orderId=${order.id}`, req.url));
  }
  return NextResponse.redirect(new URL(`/checkout/${order.id}?failed=1`, req.url));
}
