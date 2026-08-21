import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendTextMessage } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  try {
    const vendorId = req.nextUrl.searchParams.get("vendorId");
    if (!vendorId) {
      return NextResponse.json({ error: "vendorId required" }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: { vendorId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[Vendor Orders GET API] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId and status required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status,
        shipping_status: status
      },
    });

    const userPhone = order.user?.phone;
    let messageText = "";
    if (status === "packaging" || status === "processing") {
      messageText = `📦 *Order Update — Being Packaged*\n\nYour order *${order.trackingNumber}* has been confirmed and is now being carefully packaged by the vendor for courier dispatch.`;
    } else if (status === "shipped") {
      messageText = `🚚 *Order Shipped!*\n\nYour Sleek footwear order *${order.trackingNumber}* has been packaged and handed to the courier.\n\nExpected delivery: Within 3 working days.\n\nTrack progress anytime by sending:\n/track ${order.paymentRef || order.trackingNumber}`;
    } else if (status === "delivered") {
      messageText = `🎉 *Order Delivered!*\n\nYour Sleek footwear order *${order.trackingNumber}* has been successfully delivered. Thank you for shopping with Sleek! 👟`;
    }

    if (messageText && userPhone) {
      if (userPhone.startsWith("tg:")) {
        try {
          const { sendTelegramMessage } = await import("@/lib/telegram");
          const chatId = userPhone.replace("tg:", "");
          await sendTelegramMessage(chatId, messageText);
          console.log(`[Vendor Orders] Sent Telegram notification to ${chatId}: ${status}`);
        } catch (err) {
          console.error("[Vendor Orders] Failed to send Telegram notification:", err);
        }
      } else {
        try {
          await sendTextMessage(userPhone, messageText);
          console.log(`[Vendor Orders] Sent WhatsApp notification to ${userPhone}: ${status}`);
        } catch (err) {
          console.error("[Vendor Orders] Failed to send WhatsApp notification:", err);
        }
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("[Vendor Orders POST API] Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
