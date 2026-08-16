import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Approximate Naira value of one Telegram Star (XTR ≈ $0.013).
// Override with TELEGRAM_NGN_PER_STAR if the rate shifts.
const NGN_PER_STAR = Number(process.env.TELEGRAM_NGN_PER_STAR) || 20;

/**
 * Creates a Telegram Stars invoice link (paid from the user's built-in
 * Telegram wallet) for an order. The Mini App opens it with
 * Telegram.WebApp.openInvoice(); payment confirmation arrives on the
 * /api/webhooks/telegram webhook (successful_payment).
 */
export async function POST(req: NextRequest) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "Telegram payments not configured" }, { status: 500 });
  }

  const { orderId } = await req.json().catch(() => ({}));
  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.paymentStatus === "paid") {
    return NextResponse.json({ error: "Order already paid" }, { status: 400 });
  }

  const stars = Math.max(1, Math.ceil(order.totalAmount / NGN_PER_STAR));

  const res = await fetch(`https://api.telegram.org/bot${botToken}/createInvoiceLink`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Sleek Footwear Order",
      description: `Order ${order.trackingNumber} • ${order.items.length} item(s)`,
      payload: order.id,
      currency: "XTR",
      prices: [{ label: "Order total", amount: stars }],
    }),
  });

  const data = await res.json();
  if (!data.ok) {
    console.error("[Telegram Stars] createInvoiceLink failed:", data);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 502 });
  }

  return NextResponse.json({ invoiceLink: data.result, stars });
}
