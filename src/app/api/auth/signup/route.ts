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
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  let { phone, token, name, email } = parsed.data;
  if (token) {
    phone = decryptPhone(token);
  }

  if (!phone) {
    return NextResponse.json({ error: "phone or token required" }, { status: 400 });
  }

  let user = await prisma.user.upsert({
    where: { phone },
    create: { phone, name, email },
    update: { name, email },
  });

  // Provision a crypto wallet at signup so the user can pay with
  // real crypto at checkout without any extra steps.
  if (!user.walletAddress) {
    const wallet = createNewWallet();
    user = await prisma.user.update({
      where: { id: user.id },
      data: { walletAddress: wallet.address, walletPrivateKey: wallet.privateKey },
    });
  }

  const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) await prisma.cart.create({ data: { userId: user.id } });

  return NextResponse.json({ user: { id: user.id, phone: user.phone, name: user.name } });
}
