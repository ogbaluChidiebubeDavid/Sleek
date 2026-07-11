import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createNewWallet } from "@/lib/blockchain";

export async function POST(req: NextRequest) {
  try {
    const { email, businessName, kycFaceImage } = await req.json();

    if (!email || !businessName) {
      return NextResponse.json({ error: "Email and Business Name are required" }, { status: 400 });
    }

    // Check if email already registered
    const existing = await prisma.vendor.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ error: "Email already registered as a vendor" }, { status: 400 });
    }

    // Create wallet for vendor
    const wallet = createNewWallet();

    const vendor = await prisma.vendor.create({
      data: {
        email,
        businessName,
        walletAddress: wallet.address,
        walletPrivateKey: wallet.privateKey,
        kycStatus: "verified", // Face liveness check is client-verified, we mark verified
        kycFaceImage,
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
