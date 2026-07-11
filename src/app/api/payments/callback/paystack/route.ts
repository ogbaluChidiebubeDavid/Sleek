import { NextRequest, NextResponse } from "next/server";
import { verifyPaystack, markOrderPaid } from "@/lib/payments";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  const reference = req.nextUrl.searchParams.get("reference") || req.nextUrl.searchParams.get("trxref");

  if (!orderId || !reference) {
    return NextResponse.redirect(new URL("/checkout/error", req.url));
  }

  const ok = await verifyPaystack(reference);
  if (ok) {
    await markOrderPaid(orderId, reference, "paystack");
    return NextResponse.redirect(new URL(`/checkout/success?orderId=${orderId}`, req.url));
  }
  return NextResponse.redirect(new URL(`/checkout/${orderId}?failed=1`, req.url));
}
