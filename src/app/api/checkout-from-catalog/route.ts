import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateTrackingNumber } from "@/lib/utils";
import { sendInteractiveButtons } from "@/lib/whatsapp";
import { decryptPhone, encryptPhone } from "@/lib/crypto";
import { getBaseUrl } from "@/lib/request";

export async function POST(req: NextRequest) {
  let { phone, token, selectedItems } = await req.json();
  
  if (token) {
    phone = decryptPhone(token);
  }
  
  if (!phone) {
    return NextResponse.json({ error: "phone or token required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { phone },
    include: {
      cart: { include: { items: { include: { product: true } } } },
    },
  });

  if (!user?.cart?.items.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Filter items if selectedItems is provided
  let itemsToCheckout = user.cart.items;
  if (Array.isArray(selectedItems) && selectedItems.length > 0) {
    itemsToCheckout = user.cart.items.filter((item) =>
      selectedItems.some(
        (sel) =>
          sel.productId === item.productId &&
          sel.color === item.color &&
          sel.size === item.size
      )
    );
  }

  if (itemsToCheckout.length === 0) {
    return NextResponse.json({ error: "No selected items found in cart" }, { status: 400 });
  }

  const total = itemsToCheckout.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  const vendorId = itemsToCheckout[0]?.product?.vendorId || null;

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      vendorId,
      trackingNumber: generateTrackingNumber(),
      totalAmount: total,
      status: "awaiting_payment",
      items: {
        create: itemsToCheckout.map((i) => ({
          productId: i.productId,
          name: i.product.name,
          color: i.color,
          size: i.size,
          quantity: i.quantity,
          price: i.product.price,
        })),
      },
    },
  });

  // NOTE: cart items are intentionally kept until payment succeeds —
  // a failed/abandoned checkout must not wipe the user's cart. They are
  // removed in markOrderPaid / crypto-complete once the order is paid.

  const baseUrl = getBaseUrl(req);
  const checkoutUrl = `${baseUrl}/checkout/${order.id}?token=${encodeURIComponent(encryptPhone(phone))}`;

  return NextResponse.json({ orderId: order.id, checkoutUrl, trackingNumber: order.trackingNumber });
}
