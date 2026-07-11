import { NextRequest, NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/payments";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  const status = req.nextUrl.searchParams.get("status");
  const txRef = req.nextUrl.searchParams.get("tx_ref");

  if (orderId && status === "successful" && txRef) {
    await markOrderPaid(orderId, txRef, "flutterwave");
    return NextResponse.redirect(new URL(`/checkout/success?orderId=${orderId}`, req.url));
  }
  return NextResponse.redirect(new URL(`/checkout/${orderId}?failed=1`, req.url));
}
