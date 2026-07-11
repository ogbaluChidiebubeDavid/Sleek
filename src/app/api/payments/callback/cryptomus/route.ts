import { NextRequest, NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/payments";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  if (orderId) {
    return NextResponse.redirect(new URL(`/checkout/success?orderId=${orderId}`, req.url));
  }
  return NextResponse.redirect(new URL("/", req.url));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const orderId = body?.order_id?.split("-")?.[0];
  const status = body?.status || body?.payment_status;

  if (status === "paid" || status === "paid_over") {
    const order = await prisma.order.findFirst({
      where: { paymentRef: body.order_id },
    });
    if (order) {
      await markOrderPaid(order.id, body.order_id, "cryptomus");
    }
  }
  return NextResponse.json({ ok: true });
}
