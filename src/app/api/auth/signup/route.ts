import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { decryptPhone } from "@/lib/crypto";
import { createNewWallet } from "@/lib/blockchain";

const schema = z.object({
  phone: z.string().min(8).optional(),
  token: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(4).optional(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  let { phone, token, name, email, password } = parsed.data;
  if (token) {
    phone = decryptPhone(token);
  }

  if (!phone) {
    return NextResponse.json({ error: "phone or token required" }, { status: 400 });
  }

  const cleanEmail = email ? email.toLowerCase().trim() : null;

  // Check if another user already has this email
  if (cleanEmail) {
    const existingByEmail = await prisma.user.findFirst({
      where: { email: cleanEmail, NOT: { phone } },
    });
    if (existingByEmail) {
      // If password matches, return the existing user with their permanent wallet
      if (password && existingByEmail.password === password) {
        return NextResponse.json({
          user: { id: existingByEmail.id, phone: existingByEmail.phone, name: existingByEmail.name, email: existingByEmail.email },
          walletAddress: existingByEmail.walletAddress,
        });
      }
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in with your PIN." },
        { status: 400 }
      );
    }
  }

  let user = await prisma.user.upsert({
    where: { phone },
    create: { phone, name, email: cleanEmail, password },
    update: {
      name: name || undefined,
      email: cleanEmail || undefined,
      ...(password ? { password } : {}),
    },
  });

  // Provision a crypto wallet only if user does not already have one
  if (!user.walletAddress) {
    const wallet = createNewWallet();
    user = await prisma.user.update({
      where: { id: user.id },
      data: { walletAddress: wallet.address, walletPrivateKey: wallet.privateKey },
    });
  }

  const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) await prisma.cart.create({ data: { userId: user.id } });

  return NextResponse.json({
    user: { id: user.id, phone: user.phone, name: user.name, email: user.email },
    walletAddress: user.walletAddress,
  });
}
