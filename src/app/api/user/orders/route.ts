import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decryptPhone } from "@/lib/crypto";

export async function GET(req: NextRequest) {
  try {
    const tokenParam = req.nextUrl.searchParams.get("token");
    const phoneParam = req.nextUrl.searchParams.get("phone");

    let phone = phoneParam;
    if (tokenParam) {
      phone = decryptPhone(tokenParam);
    }

    if (!phone) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return NextResponse.json({ orders: [] });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: { include: { product: { include: { vendor: true } } } },
        vendor: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const enrichedOrders = orders.map((order) => {
      const vendor = order.vendor || order.items[0]?.product?.vendor || null;
      return {
        ...order,
        vendor: vendor
          ? {
              id: vendor.id,
              businessName: vendor.businessName,
              phone: vendor.phone,
              email: vendor.email,
              walletAddress: vendor.walletAddress,
            }
          : null,
      };
    });

    return NextResponse.json({ orders: enrichedOrders });
  } catch (error: any) {
    console.error("[User Orders API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
