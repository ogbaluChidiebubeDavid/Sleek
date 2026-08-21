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
      // Payment succeeded — remove the purchased items from the user's cart.
      const cart = await prisma.cart
        .findUnique({ where: { userId: order.userId } })
        .catch(() => null);
      if (cart) {
        await prisma.cartItem
          .deleteMany({
            where: {
              cartId: cart.id,
              OR: order.items.map((i) => ({
                productId: i.productId,
                color: i.color,
                size: i.size,
              })),
            },
          })
          .catch(() => {});
      }
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

  // Handle Callback Queries (e.g. "Track Order" button clicks)
  if (update?.callback_query) {
    const cb = update.callback_query;
    const data = cb.data || "";
    if (data.startsWith("track_")) {
      const orderId = data.replace("track_", "");
      const order = await prisma.order.findFirst({
        where: { OR: [{ id: orderId }, { trackingNumber: orderId }, { paymentRef: orderId }] },
        include: { items: true, vendor: true, user: true },
      });

      if (order) {
        const statusEmoji = order.status === "delivered" ? "✅" : order.status === "shipped" ? "🚚" : order.status === "packaging" || order.status === "processing" ? "📦" : "🟡";
        const itemsList = order.items
          .map((i) => `• *${i.name}* (${i.color}, Size ${i.size}) x${i.quantity}`)
          .join("\n");
        const vendorName = order.vendor?.businessName ? `\n🏪 *Vendor:* ${order.vendor.businessName}` : "";

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: cb.message?.chat?.id || cb.from.id,
            text: `${statusEmoji} *LIVE ORDER TRACKING*

📦 *Tracking ID:* \`${order.trackingNumber}\`
🧾 *Payment Ref:* \`${order.paymentRef || "N/A"}\`${vendorName}
📊 *Status:* *${order.status.toUpperCase()}*
💰 *Total:* *₦${order.totalAmount.toLocaleString()}*

🛍️ *Items:*
${itemsList}

📍 *Destination:*
${order.shippingName || "Customer"} • ${order.shippingAddress || "Delivery Address"}`,
            parse_mode: "Markdown",
          }),
        }).catch(() => {});
      }
    }
    // Acknowledge callback query
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: cb.id }),
    }).catch(() => {});
    return NextResponse.json({ ok: true });
  }

  const msg = update?.message;
  if (msg?.chat?.id) {
    const origin =
      req.headers.get("x-forwarded-proto") && req.headers.get("x-forwarded-host")
        ? `${req.headers.get("x-forwarded-proto")}://${req.headers.get("x-forwarded-host")}`
        : process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const catalogUrl = `${origin}/catalog`;

    const text = (msg.text || "").trim();
    const isTrackCommand =
      text.toLowerCase().startsWith("/track") ||
      text.toLowerCase().startsWith("track") ||
      text.toLowerCase().startsWith("/order") ||
      text.startsWith("SL-") ||
      text.startsWith("SLK-");

    if (isTrackCommand) {
      // Extract the tracking query
      let query = text.replace(/^\/?(track|order)\s*/i, "").trim();
      if (!query && (text.startsWith("SL-") || text.startsWith("SLK-"))) {
        query = text;
      }

      if (query) {
        // Search by paymentRef, trackingNumber, or ID
        const order = await prisma.order.findFirst({
          where: {
            OR: [
              { paymentRef: query },
              { paymentRef: { equals: query, mode: "insensitive" } },
              { trackingNumber: query },
              { trackingNumber: { equals: query, mode: "insensitive" } },
              { id: query },
            ],
          },
          include: {
            items: { include: { product: true } },
            vendor: true,
            user: true,
          },
        });

        if (order) {
          const statusLabels: Record<string, { label: string; emoji: string; desc: string }> = {
            paid: {
              label: "Paid • Order Received",
              emoji: "🟡",
              desc: "Payment confirmed. Vendor has been alerted to start packaging your footwear.",
            },
            packaging: {
              label: "Being Packaged",
              emoji: "📦",
              desc: "The vendor is carefully inspecting and packaging your items for courier dispatch.",
            },
            processing: {
              label: "Being Packaged",
              emoji: "📦",
              desc: "The vendor is carefully inspecting and packaging your items for courier dispatch.",
            },
            shipped: {
              label: "Shipped • In Transit",
              emoji: "🚚",
              desc: "Your package has been dispatched with the courier and is on its way to you!",
            },
            delivered: {
              label: "Delivered",
              emoji: "✅",
              desc: "Your package has been successfully delivered. Thank you for shopping with Sleek!",
            },
            cancelled: {
              label: "Cancelled",
              emoji: "❌",
              desc: "This order has been cancelled.",
            },
            awaiting_payment: {
              label: "Awaiting Payment",
              emoji: "⏳",
              desc: "Checkout created but payment has not been completed yet.",
            },
          };

          const statusInfo = statusLabels[order.status] || {
            label: order.status,
            emoji: "📦",
            desc: "Order is in progress.",
          };

          const itemsList = order.items
            .map((i) => `• *${i.name}* (${i.color}, Size ${i.size}) x${i.quantity}`)
            .join("\n");

          const vendorName = order.vendor?.businessName ? `\n🏪 *Vendor:* ${order.vendor.businessName}` : "";
          const paymentRefInfo = order.paymentRef ? `\n🧾 *Payment Ref:* \`${order.paymentRef}\`` : "";

          const trackingMessage = `${statusInfo.emoji} *ORDER STATUS: ${statusInfo.label.toUpperCase()}*

📦 *Tracking Number:* \`${order.trackingNumber}\`${paymentRefInfo}${vendorName}
💰 *Total Amount:* *₦${order.totalAmount.toLocaleString()}*
💳 *Payment Status:* ${order.paymentStatus.toUpperCase()}

🛍️ *Items in this order:*
${itemsList}

ℹ️ *Latest Update:*
_${statusInfo.desc}_

📍 *Delivery Destination:*
${order.shippingName || "Customer"}
${order.shippingAddress ? `${order.shippingAddress}, ${order.shippingCity || ""}` : "Address specified at checkout"}`;

          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: msg.chat.id,
              text: trackingMessage,
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "🛍 Open Store Catalogue",
                      web_app: { url: catalogUrl },
                    },
                  ],
                ],
              },
            }),
          }).catch(() => {});
          return NextResponse.json({ ok: true });
        } else {
          // Not found
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: msg.chat.id,
              text: `🔍 *No order found* for reference:\n\`${query}\`\n\nPlease check your payment reference (e.g. \`SL-...\`) or tracking number (e.g. \`SLK-...\`) and try again.\n\nExample:\n\`/track SL-MT3IUKD6-PJ3F-a54c6cf2\``,
              parse_mode: "Markdown",
            }),
          }).catch(() => {});
          return NextResponse.json({ ok: true });
        }
      } else {
        // No query provided - list recent orders for this Telegram user
        const phone = `tg:${msg.chat.id}`;
        const userOrders = await prisma.order.findMany({
          where: { user: { phone } },
          orderBy: { createdAt: "desc" },
          take: 3,
        });

        if (userOrders.length > 0) {
          const ordersSummary = userOrders
            .map((o, idx) => {
              const statusEmoji = o.status === "delivered" ? "✅" : o.status === "shipped" ? "🚚" : o.status === "packaging" || o.status === "processing" ? "📦" : "🟡";
              return `${idx + 1}. ${statusEmoji} *${o.trackingNumber}* (₦${o.totalAmount.toLocaleString()})\n   Ref: \`${o.paymentRef || "N/A"}\`\n   Status: *${o.status.toUpperCase()}*`;
            })
            .join("\n\n");

          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: msg.chat.id,
              text: `📦 *Your Recent Orders:*\n\n${ordersSummary}\n\nTo track any order, reply with:\n\`/track <payment_ref_or_order_id>\``,
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  userOrders.map((o) => ({
                    text: `Track ${o.trackingNumber}`,
                    callback_data: `track_${o.id}`,
                  })),
                ],
              },
            }),
          }).catch(() => {});
          return NextResponse.json({ ok: true });
        } else {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: msg.chat.id,
              text: `📦 *Track Your Order*\n\nPlease provide your order tracking number or payment reference.\n\nExample:\n\`/track SL-MT3IUKD6-PJ3F-a54c6cf2\``,
              parse_mode: "Markdown",
            }),
          }).catch(() => {});
          return NextResponse.json({ ok: true });
        }
      }
    }

    // Default Greeting
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
