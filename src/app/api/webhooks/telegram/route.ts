import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const WELCOME_TEXT = `Welcome to Sleek Footwear Co. 👟

Browse our full catalogue, add to cart, pay securely (Opay, Paystack, Flutterwave or crypto) and track your order — right here in Telegram.

Tap the button below to open the store.`;

/**
 * Telegram bot webhook. Replies to any message with a Web App button
 * that opens the catalogue as a Telegram Mini App.
 */
export async function POST(req: NextRequest) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "Bot not configured" }, { status: 500 });
  }

  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (
    webhookSecret &&
    req.headers.get("x-telegram-bot-api-secret-token") !== webhookSecret
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let update: any;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  // Telegram Stars payments: approve the pre-checkout and finalize the
  // order when the payment succeeds.
  if (update?.pre_checkout_query) {
    const q = update.pre_checkout_query;
    const order = await prisma.order.findUnique({
      where: { id: q.invoice_payload },
    });
    const ok = !!order && order.paymentStatus !== "paid";
    await fetch(
      `https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pre_checkout_query_id: q.id,
          ok,
          ...(ok ? {} : { error_message: "Order not found or already paid." }),
        }),
      }
    ).catch((err) =>
      console.error("[Telegram] answerPreCheckoutQuery failed:", err)
    );
    return NextResponse.json({ ok: true });
  }

  if (update?.message?.successful_payment) {
    const sp = update.message.successful_payment;
    const order = await prisma.order.findUnique({
      where: { id: sp.invoice_payload },
      include: { items: { include: { product: true } } },
    });
    if (order && order.paymentStatus !== "paid") {
      const vendorId = order.items[0]?.product?.vendorId ?? null;
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "paid",
          status: "processing",
          paymentMethod: "telegram_stars",
          paymentRef: sp.telegram_payment_charge_id,
          vendorId,
        },
      }).catch((err) => console.error("[Telegram] order update failed:", err));
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: update.message.chat.id,
          text: `Payment received ✅\n\nOrder ${order.trackingNumber} is confirmed and being processed. You paid ${sp.total_amount} Stars.`,
        }),
      }).catch(() => {});
    }
    return NextResponse.json({ ok: true });
  }

  const msg = update?.message;
  if (msg?.chat?.id) {
    // Derive the URL from the request itself so the Mini App button always
    // matches whichever domain Telegram hit the webhook on (works with
    // custom domains without redeploying env vars).
    const origin =
      req.headers.get("x-forwarded-proto") && req.headers.get("x-forwarded-host")
        ? `${req.headers.get("x-forwarded-proto")}://${req.headers.get("x-forwarded-host")}`
        : process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const catalogUrl = `${origin}/catalog`;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: msg.chat.id,
        text: WELCOME_TEXT,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🛍 Open Sleek Catalogue",
                web_app: { url: catalogUrl },
              },
            ],
          ],
        },
      }),
    }).catch((err) => console.error("[Telegram] sendMessage failed:", err));
  }

  return NextResponse.json({ ok: true });
}
