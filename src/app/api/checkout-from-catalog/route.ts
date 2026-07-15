import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateTrackingNumber } from "@/lib/utils";
import { sendInteractiveButtons } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const { phone, selectedItems } = await req.json();
  if (!phone) {
    return NextResponse.json({ error: "phone required" }, { status: 400 });
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

  const order = await prisma.order.create({
    data: {
      userId: user.id,
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

  // Delete checked out items from CartItem table
  const itemIdsToDelete = itemsToCheckout.map((i) => i.id);
  await prisma.cartItem.deleteMany({
    where: {
      id: { in: itemIdsToDelete },
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const checkoutUrl = `${baseUrl}/checkout/${order.id}?phone=${encodeURIComponent(phone)}`;

  await sendInteractiveButtons(
    phone,
    "Do you want to add more footwear or continue to checkout?",
    [
      { id: "view_more", title: "Add more to cart" },
      { id: "checkout", title: "Continue checkout" },
    ]
  );

  return NextResponse.json({ orderId: order.id, checkoutUrl, trackingNumber: order.trackingNumber });
}
