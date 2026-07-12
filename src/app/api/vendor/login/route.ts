import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and Password are required" }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { email },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Hash the input password and compare
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
    if (vendor.password !== hashedPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      vendor: {
        id: vendor.id,
        email: vendor.email,
        businessName: vendor.businessName,
        walletAddress: vendor.walletAddress,
        kycStatus: vendor.kycStatus,
      },
    });
  } catch (error: any) {
    console.error("[Vendor Login API] Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
