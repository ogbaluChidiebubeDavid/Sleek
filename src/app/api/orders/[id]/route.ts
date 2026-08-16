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
  if (order.paymentStatus === "paid") {
    return NextResponse.json({ error: "Order already paid" }, { status: 400 });
  }

  // Abandon checkout: put every item back in the cart and delete the order.
  if (body.abandon) {
    const items = await prisma.orderItem.findMany({ where: { orderId: id } });
    const cart =
      (await prisma.cart.findUnique({ where: { userId: order.userId } })) ||
      (await prisma.cart.create({ data: { userId: order.userId } }));
    for (const item of items) {
      await prisma.cartItem.upsert({
        where: {
          cartId_productId_color_size: {
            cartId: cart.id,
            productId: item.productId,
            color: item.color,
            size: item.size,
          },
        },
        create: {
          cartId: cart.id,
          productId: item.productId,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
        },
        update: { quantity: { increment: item.quantity } },
      });
    }
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true, abandoned: true });
  }

  // Deselect items mid-checkout: removed items go back to the cart, the
  // order keeps the checked ones and its total is recomputed.
  if (Array.isArray(body.keepItemIds)) {
    const keep = new Set<string>(body.keepItemIds);
    const items = await prisma.orderItem.findMany({ where: { orderId: id } });
    if (items.length > 0 && items.every((i) => !keep.has(i.id))) {
      return NextResponse.json(
        { error: "Keep at least one item" },
        { status: 400 }
      );
    }
    const removed = items.filter((i) => !keep.has(i.id));
    if (removed.length > 0) {
      const cart =
        (await prisma.cart.findUnique({ where: { userId: order.userId } })) ||
        (await prisma.cart.create({ data: { userId: order.userId } }));
      for (const item of removed) {
        await prisma.cartItem.upsert({
          where: {
            cartId_productId_color_size: {
              cartId: cart.id,
              productId: item.productId,
              color: item.color,
              size: item.size,
            },
          },
          create: {
            cartId: cart.id,
            productId: item.productId,
            color: item.color,
            size: item.size,
            quantity: item.quantity,
          },
          update: { quantity: { increment: item.quantity } },
        });
      }
      await prisma.orderItem.deleteMany({
        where: { id: { in: removed.map((i) => i.id) } },
      });
      const kept = items.filter((i) => keep.has(i.id));
      const total = kept.reduce((sum, i) => sum + i.price * i.quantity, 0);
      await prisma.order.update({ where: { id }, data: { totalAmount: total } });
    }

    const updated = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { include: { vendor: true } } } },
        user: true,
      },
    });
    return NextResponse.json({ success: true, order: updated });
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
