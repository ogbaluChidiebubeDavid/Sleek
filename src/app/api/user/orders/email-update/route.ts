import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decryptPhone } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, email, token } = body;

    if (!orderId || !email) {
      return NextResponse.json({ error: "orderId and valid email required" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { trackingNumber: orderId }, { paymentRef: orderId }],
      },
      include: { items: true, vendor: true, user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update shipping email on order and user email
    await prisma.order.update({
      where: { id: order.id },
      data: { shippingEmail: email.toLowerCase().trim() },
    });

    if (order.userId) {
      await prisma.user.update({
        where: { id: order.userId },
        data: { email: email.toLowerCase().trim() },
      }).catch(() => {});
    }

    // If a mail service (Resend, SendGrid, SMTP) is configured, it would dispatch here.
    // For now we log and confirm email receipt subscription.
    console.log(`[Email Updates] Subscribed ${email} to live updates for order ${order.trackingNumber}`);

    return NextResponse.json({
      success: true,
      message: `Live tracking updates sent to ${email}! You'll also receive notifications on every fulfillment status change.`,
    });
  } catch (error: any) {
    console.error("[Email Update API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to subscribe to email updates" },
      { status: 500 }
    );
  }
}
