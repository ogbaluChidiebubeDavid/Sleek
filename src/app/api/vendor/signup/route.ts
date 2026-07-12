import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createNewWallet } from "@/lib/blockchain";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, businessName, kycFaceImage, password, kycIdImage } = await req.json();

    if (!email || !businessName || !password) {
      return NextResponse.json({ error: "Email, Business Name, and Password are required" }, { status: 400 });
    }

    // Check if email already registered
    const existing = await prisma.vendor.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ error: "Email already registered as a vendor" }, { status: 400 });
    }

    // Create wallet for vendor (chain abstraction)
    const wallet = createNewWallet();

    // Hash the password with SHA-256
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const vendor = await prisma.vendor.create({
      data: {
        email,
        businessName,
        password: hashedPassword,
        walletAddress: wallet.address,
        walletPrivateKey: wallet.privateKey,
        kycStatus: "verified", // Completed both face scan and ID upload, we mark as verified
        kycFaceImage,
        kycIdImage,
      },
    });

    return NextResponse.json({
      success: true,
      vendor: {
        id: vendor.id,
        email: vendor.email,
        businessName: vendor.businessName,
        walletAddress: vendor.walletAddress,
        walletPrivateKey: vendor.walletPrivateKey,
        kycStatus: vendor.kycStatus,
      },
    });
  } catch (error: any) {
    console.error("[Vendor Signup API] Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
