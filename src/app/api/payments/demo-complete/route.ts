import { NextRequest, NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/payments";

export async function POST(req: NextRequest) {
  const { orderId, provider } = await req.json();
  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const order = await markOrderPaid(
    orderId,
    `DEMO-${Date.now()}`,
    provider || "demo"
  );

  return NextResponse.json({
    success: true,
    trackingNumber: order.trackingNumber,
  });
}
