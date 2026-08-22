import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decryptPhone } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, phone: rawPhone, name, email, deliveryAddress, deliveryCity, deliveryPhone } = body;

    let phone = rawPhone;
    if (token) {
      phone = decryptPhone(token);
    }

    if (!phone) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cleanEmail = email ? email.toLowerCase().trim() : undefined;

    const user = await prisma.user.upsert({
      where: { phone },
      create: {
        phone,
        name: name || undefined,
        email: cleanEmail,
        shippingName: name || undefined,
        shippingEmail: cleanEmail,
        shippingPhone: deliveryPhone || phone,
        shippingAddress: deliveryAddress || undefined,
        shippingCity: deliveryCity || undefined,
        shippingCountry: "Nigeria",
      },
      update: {
        name: name || undefined,
        email: cleanEmail,
        shippingName: name || undefined,
        shippingEmail: cleanEmail,
        shippingPhone: deliveryPhone || undefined,
        shippingAddress: deliveryAddress || undefined,
        shippingCity: deliveryCity || undefined,
      },
    });

    // Also update any orders for this user that don't have a shipping address set yet
    if (deliveryAddress || name) {
      await prisma.order.updateMany({
        where: {
          userId: user.id,
          OR: [{ shippingAddress: null }, { shippingAddress: "" }],
        },
        data: {
          shippingName: name || user.name || undefined,
          shippingEmail: cleanEmail || user.email || undefined,
          shippingAddress: deliveryAddress || user.shippingAddress || undefined,
          shippingCity: deliveryCity || user.shippingCity || undefined,
          shippingCountry: "Nigeria",
        },
      }).catch((err) => console.error("[User Profile API] Order backfill failed:", err));
    }

    return NextResponse.json({
      success: true,
      message: "Delivery details updated successfully!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        walletAddress: user.walletAddress,
        deliveryAddress: user.shippingAddress,
        deliveryCity: user.shippingCity,
        deliveryPhone: user.shippingPhone || user.phone,
      },
    });
  } catch (error: any) {
    console.error("[User Profile API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
