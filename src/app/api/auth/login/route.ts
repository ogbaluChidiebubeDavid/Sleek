import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { decryptPhone, encryptPhone } from "@/lib/crypto";
import { createNewWallet } from "@/lib/blockchain";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  token: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Valid email and password required" }, { status: 400 });
    }

    const { email, password, token, phone: rawPhone } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // 1. Look up user by email
    let user = await prisma.user.findFirst({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email. Please sign up." },
        { status: 404 }
      );
    }

    // 2. Validate password PIN
    if (user.password && user.password !== password) {
      return NextResponse.json(
        { error: "Incorrect password / PIN. Please try again." },
        { status: 401 }
      );
    }

    // If Telegram token is provided, link current Telegram session
    let sessionPhone = user.phone;
    if (token) {
      const tgPhone = decryptPhone(token);
      if (tgPhone && tgPhone.startsWith("tg:") && tgPhone !== user.phone) {
        // Transfer wallet & details to Telegram phone if needed or use main user
        if (!user.walletAddress) {
          const wallet = createNewWallet();
          user = await prisma.user.update({
            where: { id: user.id },
            data: { walletAddress: wallet.address, walletPrivateKey: wallet.privateKey },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      token: encryptPhone(user.phone),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      walletAddress: user.walletAddress,
    });
  } catch (error: any) {
    console.error("[Login API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
