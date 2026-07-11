import { NextRequest, NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/payments";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const orderId = req.nextUrl.searchParams.get("orderId");
  const reference = body?.payload?.reference || body?.reference;
  const status = body?.payload?.status || body?.status;

  if (orderId && (status === "SUCCESS" || status === "success")) {
    await markOrderPaid(orderId, reference || "opay", "opay");
    return NextResponse.json({ received: true });
  }
  return NextResponse.json({ received: false }, { status: 400 });
}

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  if (orderId) {
    return NextResponse.redirect(new URL(`/checkout/success?orderId=${orderId}`, req.url));
  }
  return NextResponse.redirect(new URL("/", req.url));
}
