import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encryptPhone } from "@/lib/crypto";
import {
  verifyTelegramInitData,
  telegramUserPhone,
} from "@/lib/telegram";
import { createNewWallet } from "@/lib/blockchain";

/**
 * Authenticates a Telegram Mini App user by validating the signed
 * initData payload, then returns the same encrypted phone token used
 * by the WhatsApp flows so cart/checkout work unchanged.
 */
export async function POST(req: NextRequest) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN is not configured" },
      { status: 500 }
    );
  }

  let initData = "";
  try {
    const body = await req.json();
    initData = body?.initData || "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!initData) {
    return NextResponse.json({ error: "initData required" }, { status: 400 });
  }

  const tgUser = verifyTelegramInitData(initData, botToken);
  if (!tgUser) {
    return NextResponse.json(
      { error: "Invalid Telegram signature" },
      { status: 401 }
    );
  }

  const phone = telegramUserPhone(tgUser.id);
  const name =
    [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") ||
    tgUser.username ||
    null;

  let user = await prisma.user.upsert({
    where: { phone },
    create: { phone, name },
    update: { name },
  });

  // Provision a crypto wallet on first login so the user can pay with
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

  return NextResponse.json({
    token: encryptPhone(phone),
    user: { id: user.id, name: user.name },
    hasAccount: !!(user.name && user.email && user.password),
    walletAddress: user.walletAddress,
  });
}
