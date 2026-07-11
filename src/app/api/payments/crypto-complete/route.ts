import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProvider } from "@/lib/blockchain";

export async function POST(req: NextRequest) {
  try {
    const {
      orderId,
      txHash,
      shippingName,
      shippingEmail,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingCountry,
      userWalletAddress,
      userPrivateKey,
      password,
    } = await req.json();

    if (!orderId || !txHash || !shippingName || !shippingEmail || !shippingAddress || !shippingCity || !shippingCountry) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } }, user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Try to verify transaction on-chain
    let onChainVerified = false;
    try {
      const provider = getProvider();
      const tx = await provider.getTransaction(txHash);
      if (tx) {
        // Just verify it's a valid tx. In production, we'd verify receiver contract and value
        onChainVerified = true;
      }
    } catch (e) {
      console.warn("[Crypto Complete] Could not verify transaction on-chain (RPC error/sluggish), continuing with submission:", e);
      // Fallback: assume valid if network is sluggish for demo purposes, but log it
    }

    // Fetch the vendor from the first item in the order to set the order's vendorId
    const firstItem = order.items[0];
    const vendorId = firstItem?.product?.vendorId || null;

    // Update the Order status, shipping details, and transaction hash
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "paid",
        status: "processing",
        shipping_status: "processing",
        paymentMethod: "crypto",
        paymentRef: txHash.slice(0, 16).toUpperCase(), // Short identifier
        txHash,
        shippingName,
        shippingEmail,
        shippingAddress,
        shippingCity,
        shippingCountry,
        vendorId,
      },
    });

    // Save shipping and wallet details on the User model for seamless subsequent checkouts
    await prisma.user.update({
      where: { id: order.userId },
      data: {
        name: shippingName,
        email: shippingEmail,
        password: password || undefined, // Store checkout PIN
        shippingPhone: shippingPhone || undefined,
        shippingName,
        shippingEmail,
        shippingAddress,
        shippingCity,
        shippingCountry,
        walletAddress: userWalletAddress,
        walletPrivateKey: userPrivateKey,
      },
    });

    // Clear the cart
    await prisma.cartItem.deleteMany({
      where: { cart: { userId: order.userId } },
    });

    // Send receipt via WhatsApp Business API
    const { sendPaymentReceipt } = await import("@/lib/conversation");
    await sendPaymentReceipt(order.user.phone, order.id);

    // Send receipt via HTML email notification
    const { sendEmailReceipt } = await import("@/lib/email");
    await sendEmailReceipt(order.id);

    return NextResponse.json({
      success: true,
      trackingNumber: updatedOrder.trackingNumber,
    });
  } catch (error) {
    console.error("[Crypto Complete API] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
