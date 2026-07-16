import { prisma } from "@/lib/db";
import { parseJsonArray, generateTrackingNumber, formatCurrency } from "@/lib/utils";
import {
  sendTextMessage,
  sendInteractiveButtons,
  sendProductCarousel,
  sendFlowLink,
  sendCtaUrlButton,
  sendCatalogLink,
  sendCheckoutLink,
} from "@/lib/whatsapp";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  // Hardcode the public production Vercel domain as the default fallback
  // This bypasses Vercel's login protection wall placed on preview deployments,
  // allowing Meta Cloud API to crawl/validate links and deliver native buttons!
  return "https://sleek-brown.vercel.app";
}

type StateData = {
  pendingProductId?: string;
  pendingAction?: "buy" | "cart";
  selectedColor?: string;
  selectedSize?: string;
  checkoutOrderId?: string;
};

async function getState(phone: string) {
  let state = await prisma.conversationState.findUnique({ where: { phone } });
  if (!state) {
    state = await prisma.conversationState.create({
      data: { phone, step: "idle", data: "{}" },
    });
  }
  return state;
}

async function setState(phone: string, step: string, data: StateData = {}) {
  await prisma.conversationState.upsert({
    where: { phone },
    create: { phone, step, data: JSON.stringify(data) },
    update: { step, data: JSON.stringify(data) },
  });
}

async function getOrCreateUser(phone: string) {
  let user = await prisma.user.findUnique({
    where: { phone },
    include: { cart: true },
  });
  if (!user) {
    user = await prisma.user.create({
      data: { phone },
      include: { cart: true },
    });
    await prisma.cart.create({ data: { userId: user.id } });
    user = await prisma.user.findUniqueOrThrow({
      where: { phone },
      include: { cart: true },
    });
  } else if (!user.cart) {
    await prisma.cart.create({ data: { userId: user.id } });
    user = await prisma.user.findUniqueOrThrow({
      where: { phone },
      include: { cart: true },
    });
  }
  return user;
}

async function getFeaturedProducts(limit = 5) {
  return prisma.product.findMany({
    where: { featured: true },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function sendCatalogueGreeting(phone: string) {
  await sendCatalogLink(phone);
  await setState(phone, "browsing", {});
}

export async function handleIncomingMessage(
  phone: string,
  text: string,
  buttonId?: string
) {
  const normalized = (buttonId || text).trim().toLowerCase();
  const state = await getState(phone);
  const data: StateData = JSON.parse(state.data || "{}");

  if (normalized === "i want to check out" || normalized.includes("i want to checkout")) {
    await sendInteractiveButtons(
      phone,
      "Do you want to add more footwear or continue to checkout?",
      [
        { id: "view_more", title: "Add more to cart" },
        { id: "checkout", title: "Continue checkout" },
      ]
    );
    await setState(phone, "post_checkout", {});
    return;
  }

  if (
    normalized.includes("hello, i want to buy footwear") ||
    (normalized.includes("hello") &&
      (normalized.includes("footwear") || normalized.includes("buy") || normalized.includes("shoe")))
  ) {
    await sendCatalogueGreeting(phone);
    return;
  }

  if (
    normalized === "view_more" || 
    normalized.includes("view more") || 
    normalized.includes("add more") ||
    normalized === "view_catalogue"
  ) {
    await sendCatalogLink(phone);
    await setState(phone, "catalog_open", data);
    return;
  }

  if (normalized.startsWith("buy_") || normalized.startsWith("cart_")) {
    const action = normalized.startsWith("buy_") ? "buy" : "cart";
    const productId = normalized.replace(/^(buy_|cart_)/, "");
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      await sendTextMessage(phone, "Sorry, that product is no longer available.");
      return;
    }

    if (action === "cart") {
      await sendCatalogLink(phone);
      return;
    }

    const colors = parseJsonArray<string>(product.colors);
    const sizes = parseJsonArray<string>(product.sizes);
    await setState(phone, "select_variant", {
      pendingProductId: productId,
      pendingAction: action,
    });
    await sendTextMessage(
      phone,
      `*${product.name}* — ${formatCurrency(product.price)}\n\nReply with your preferred color and size.\n\nExample: *Black 42*`
    );
    return;
  }

  if (state.step === "select_variant" && data.pendingProductId) {
    const product = await prisma.product.findUnique({
      where: { id: data.pendingProductId },
    });
    if (!product) {
      await setState(phone, "idle", {});
      await sendTextMessage(phone, "Product not found. Say hello to start again.");
      return;
    }

    const colors = parseJsonArray<string>(product.colors);
    const sizes = parseJsonArray<string>(product.sizes);
    const parts = text.trim().split(/\s+/);
    const size = parts[parts.length - 1];
    const color = parts.slice(0, -1).join(" ") || parts[0];

    const matchedColor =
      colors.find((c) => c.toLowerCase() === color.toLowerCase()) || colors[0];
    const matchedSize =
      sizes.find((s) => s === size) || sizes.find((s) => text.includes(s)) || sizes[0];

    const user = await getOrCreateUser(phone);
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true },
    });
    if (!cart) throw new Error("Cart missing");

    await prisma.cartItem.upsert({
      where: {
        cartId_productId_color_size: {
          cartId: cart.id,
          productId: product.id,
          color: matchedColor,
          size: matchedSize,
        },
      },
      create: {
        cartId: cart.id,
        productId: product.id,
        color: matchedColor,
        size: matchedSize,
        quantity: 1,
      },
      update: { quantity: { increment: 1 } },
    });

    if (data.pendingAction === "buy") {
      await initiateCheckout(phone, user.id);
    } else {
      await sendInteractiveButtons(
        phone,
        `Added *${product.name}* (${matchedColor}, ${matchedSize}) to your cart.`,
        [
          { id: "view_more", title: "Add more" },
          { id: "checkout", title: "Checkout" },
        ]
      );
      await setState(phone, "browsing", {});
    }
    return;
  }

  if (
    normalized.startsWith("pay_opay_") ||
    normalized.startsWith("pay_crypto_") ||
    normalized.startsWith("pay_card_")
  ) {
    const oid = normalized.replace(/^pay_(opay|crypto|card)_/, "");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const provider = normalized.includes("opay")
      ? "opay"
      : normalized.includes("crypto")
        ? "cryptomus"
        : "paystack";
    await sendTextMessage(
      phone,
      `Complete payment here: ${baseUrl}/checkout/${oid}?phone=${encodeURIComponent(phone)}\n\nSelected: ${provider}`
    );
    return;
  }

  if (normalized === "checkout" || normalized.includes("continue to checkout")) {
    const user = await getOrCreateUser(phone);

    // Check if the user has a pending (awaiting_payment) order
    const pendingOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: "awaiting_payment",
      },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    if (pendingOrder) {
      const total = pendingOrder.totalAmount;
      const itemsNames = pendingOrder.items.map((i) => i.name).join(", ");
      await sendCheckoutLink(phone, pendingOrder.id, total, itemsNames);
      await setState(phone, "checkout", { checkoutOrderId: pendingOrder.id });
      return;
    }

    await initiateCheckout(phone, user.id);
    return;
  }

  if (normalized.includes("add more") || normalized === "view_more") {
    await sendFlowLink(phone, "Add more footwear to your cart:", "/catalog");
    return;
  }

  if (
    normalized.includes("where is my order") ||
    normalized.includes("where's my order") ||
    normalized.includes("track my order") ||
    normalized.includes("order status") ||
    normalized.includes("status of my order")
  ) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (user) {
      const latestOrder = await prisma.order.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      if (latestOrder) {
        await handleTracking(phone, latestOrder.trackingNumber);
        return;
      }
    }
    await sendTextMessage(
      phone,
      "You don't have any active orders yet. Reply with a tracking number (e.g., *track SL-XXXXX*) to look up a specific shipment."
    );
    return;
  }

  if (normalized.startsWith("track") || normalized.includes("tracking")) {
    const tracking = text.match(/SL-[A-Z0-9-]+/i)?.[0];
    if (tracking) {
      await handleTracking(phone, tracking.toUpperCase());
    } else {
      await sendTextMessage(
        phone,
        "Send your tracking number (e.g. SL-XXXXX) or reply: *track SL-XXXXX*"
      );
    }
    return;
  }

  if (normalized === "track_order") {
    await sendTextMessage(
      phone,
      "Reply with your tracking number, e.g. *track SL-ABC123*"
    );
    return;
  }

  if (state.step === "post_checkout") {
    await sendInteractiveButtons(
      phone,
      "Would you like to add more footwear or continue to checkout?",
      [
        { id: "view_more", title: "Add more to cart" },
        { id: "checkout", title: "Continue checkout" },
      ]
    );
    return;
  }

  await sendCatalogueGreeting(phone);
}

async function initiateCheckout(phone: string, userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart?.items.length) {
    await sendTextMessage(phone, "Your cart is empty. Browse our catalogue first!");
    await sendCatalogueGreeting(phone);
    return;
  }

  const total = cart.items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  const order = await prisma.order.create({
    data: {
      userId,
      trackingNumber: generateTrackingNumber(),
      totalAmount: total,
      status: "awaiting_payment",
      shipping_status: "awaiting_payment",
      items: {
        create: cart.items.map((i) => ({
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

  await setState(phone, "checkout", { checkoutOrderId: order.id });

  await sendCheckoutLink(phone, order.id, total, cart.items.map((i) => i.product.name).join(", "));
}

export async function handleTracking(phone: string, trackingNumber: string) {
  const order = await prisma.order.findUnique({
    where: { trackingNumber },
    include: { items: true, user: true },
  });

  if (!order) {
    await sendTextMessage(phone, `No order found for *${trackingNumber}*. Check the number and try again.`);
    return;
  }

  const statusLabels: Record<string, string> = {
    pending: "Order received",
    awaiting_payment: "Awaiting payment",
    paid: "Payment confirmed — preparing shipment",
    processing: "Being packed at our warehouse",
    shipped: "On the way to you (Expected delivery in 3 working days)",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  const itemsList = order.items
    .map((i) => `• ${i.name} (${i.color}, ${i.size}) x${i.quantity}`)
    .join("\n");

  const shippingInfo = order.shippingAddress
    ? `\n*Shipping Info:*\nName: ${order.shippingName}\nAddress: ${order.shippingAddress}, ${order.shippingCity}, ${order.shippingCountry}`
    : "";

  const txInfo = order.txHash
    ? `\n*Transaction Hash:*\n${order.txHash}\nExplorer: https://sepolia.basescan.org/tx/${order.txHash}`
    : "";

  await sendTextMessage(
    phone,
    `*Order ${order.trackingNumber}*\nStatus: ${statusLabels[order.shipping_status] || order.shipping_status || statusLabels[order.status] || order.status}\nPayment: ${order.paymentStatus}\n\n${itemsList}\n${shippingInfo}${txInfo}\n\nTotal: ${formatCurrency(order.totalAmount)}`
  );
}

export async function sendPaymentReceipt(phone: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, vendor: true },
  });
  if (!order) return;

  const itemsList = order.items
    .map((i) => `• ${i.name} (${i.color}, ${i.size}) — ${formatCurrency(i.price * i.quantity)}`)
    .join("\n");

  const vendorInfo = order.vendor
    ? `\n*Vendor Summary:*\nName: ${order.vendor.businessName}\nPhone: ${order.vendor.phone || "N/A"}`
    : "";

  const shippingInfo = `*Shipping Address:*\n${order.shippingName}\n${order.shippingAddress}\n${order.shippingCity}, ${order.shippingCountry}`;
  const txExplorer = order.txHash
    ? `*Transaction Hash:*\n${order.txHash}\nExplorer: https://sepolia.basescan.org/tx/${order.txHash}`
    : "";

  await sendTextMessage(
    phone,
    `✅ *Payment successful*\n\nReceipt #${order.paymentRef || order.id.slice(-8).toUpperCase()}\nTracking: *${order.trackingNumber}*${vendorInfo}\n\n${itemsList}\n\nTotal paid: ${formatCurrency(order.totalAmount)}\n\n${shippingInfo}\n\n${txExplorer}\n\nSave your tracking number to check status anytime. Reply *track ${order.trackingNumber}*`
  );

  await sendInteractiveButtons(
    phone,
    "Would you like to add more footwear or continue shopping?",
    [
      { id: "view_more", title: "Add more to cart" },
      { id: "track_order", title: "Track another order" },
    ]
  );
  await setState(phone, "post_checkout", {});
}
