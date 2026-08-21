import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decryptPhone } from "@/lib/crypto";

export async function GET(req: NextRequest) {
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
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      walletAddress: user.walletAddress,
      hasPassword: !!user.password,
      hasAccount: !!(user.email && user.password),
    },
  });
}
