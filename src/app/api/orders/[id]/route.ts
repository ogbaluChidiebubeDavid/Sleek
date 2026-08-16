import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decryptPhone } from "@/lib/crypto";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: {
              vendor: true,
            },
          },
        },
      },
      user: true,
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

/**
 * Persists shipping details before a payment (used by the Paystack and
 * Telegram Stars paths, which don't run through crypto-complete).
 * Authorized by the phone/token attached to the order's user.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  let phone = body.phone;
  if (body.token) phone = decryptPhone(body.token);

  const order = await prisma.order.findUnique({ where: { id }, include: { user: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!phone || order.user.phone !== phone) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const shipping = {
    shippingName: body.shippingName,
    shippingEmail: body.shippingEmail,
    shippingPhone: body.shippingPhone,
    shippingAddress: body.shippingAddress,
    shippingCity: body.shippingCity,
    shippingCountry: body.shippingCountry,
  };

  await prisma.order.update({
    where: { id },
    data: Object.fromEntries(
      Object.entries(shipping).filter(([, v]) => v != null && v !== "")
    ),
  });
  await prisma.user.update({
    where: { id: order.userId },
    data: Object.fromEntries(
      Object.entries(shipping).filter(([, v]) => v != null && v !== "")
    ),
  });

  return NextResponse.json({ success: true });
}
