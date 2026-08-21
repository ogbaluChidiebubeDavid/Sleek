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
      },
      update: {
        name: name || undefined,
        email: cleanEmail,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Delivery details updated successfully!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        walletAddress: user.walletAddress,
        deliveryAddress,
        deliveryCity,
        deliveryPhone: deliveryPhone || user.phone,
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
