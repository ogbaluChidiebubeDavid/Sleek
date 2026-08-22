import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { markOrderPaid } from "@/lib/payments";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (secret && signature) {
      const hash = crypto
        .createHmac("sha512", secret)
        .update(rawBody)
        .digest("hex");

      if (hash !== signature) {
        console.warn("[Paystack Webhook] Invalid signature rejected");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const event = payload.event;
    const data = payload.data;

    console.log(`[Paystack Webhook] Received event: ${event}, reference: ${data?.reference}`);

    if (event === "charge.success" && data?.status === "success") {
      const reference = data.reference;
      const orderIdFromMeta = data.metadata?.orderId;

      let order = null;
      if (orderIdFromMeta) {
        order = await prisma.order.findUnique({
          where: { id: orderIdFromMeta },
        });
      }

      if (!order && reference) {
        order = await prisma.order.findFirst({
          where: {
            OR: [
              { paymentRef: reference },
              { trackingNumber: reference },
              { id: reference },
            ],
          },
        });
      }

      if (order && order.paymentStatus !== "paid") {
        console.log(`[Paystack Webhook] Marking order ${order.trackingNumber} (${order.id}) as paid via reference ${reference}`);
        await markOrderPaid(order.id, reference, "paystack");
      }
    }

    return NextResponse.json({ status: true });
  } catch (error: any) {
    console.error("[Paystack Webhook] Error processing webhook:", error);
    return NextResponse.json({ error: error.message || "Webhook error" }, { status: 500 });
  }
}
