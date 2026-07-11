import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  initPaystack,
  initFlutterwave,
  initCryptomus,
  initOpay,
  PaymentProvider,
} from "@/lib/payments";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const { orderId, provider, email } = await req.json();

  if (!orderId || !provider) {
    return NextResponse.json({ error: "orderId and provider required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const reference = `SL-${order.trackingNumber.replace(/^SL-/, "")}-${uuidv4().slice(0, 8)}`;
  const metadata = { orderId: order.id, phone: order.user.phone };
  const amount = order.totalAmount;

  let result;
  switch (provider as PaymentProvider) {
    case "paystack":
      result = await initPaystack(email || "customer@sleek.shop", amount, reference, metadata);
      break;
    case "flutterwave":
      result = await initFlutterwave(email || "customer@sleek.shop", amount, reference, metadata);
      break;
    case "cryptomus":
      result = await initCryptomus(amount, reference, metadata);
      break;
    case "opay":
      result = await initOpay(amount, reference, metadata);
      break;
    default:
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentRef: reference, paymentMethod: provider },
  });

  return NextResponse.json(result);
}
