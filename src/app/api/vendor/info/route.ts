import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getWalletBalance } from "@/lib/blockchain";

export async function GET(req: NextRequest) {
  try {
    const vendorId = req.nextUrl.searchParams.get("vendorId");
    if (!vendorId) {
      return NextResponse.json({ error: "vendorId required" }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Query real on-chain balance
    const balance = await getWalletBalance(vendor.walletAddress);

    return NextResponse.json({
      success: true,
      balance,
      walletAddress: vendor.walletAddress,
      businessName: vendor.businessName,
      email: vendor.email,
      kycStatus: vendor.kycStatus,
    });
  } catch (error: any) {
    console.error("[Vendor Info GET API] Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
