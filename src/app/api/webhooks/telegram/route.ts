import { NextRequest, NextResponse } from "next/server";

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

  const msg = update?.message;
  if (msg?.chat?.id) {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://sleek-wa.vercel.app";
    const catalogUrl = `${appUrl}/catalog`;

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
