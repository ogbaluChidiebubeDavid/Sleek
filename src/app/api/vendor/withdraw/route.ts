import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withdrawFunds } from "@/lib/blockchain";
import { ethers } from "ethers";

export async function POST(req: NextRequest) {
  try {
    const { vendorId, toAddress, amountEth } = await req.json();

    if (!vendorId || !toAddress || !amountEth) {
      return NextResponse.json(
        { error: "Vendor ID, Destination Address, and Amount are required" },
        { status: 400 }
      );
    }

    // Verify address is valid format
    if (!ethers.isAddress(toAddress)) {
      return NextResponse.json({ error: "Invalid target Ethereum address" }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Verify vendor has completed KYC liveness & ID check
    if (vendor.kycStatus !== "verified") {
      return NextResponse.json(
        { error: "Account KYC verification is pending. Please complete KYC." },
        { status: 403 }
      );
    }

    // Execute the on-chain transfer
    console.log(`[Vendor Withdrawal] Initiating transfer of ${amountEth} ETH for vendor ${vendor.businessName}`);
    const txHash = await withdrawFunds(vendor.walletPrivateKey, toAddress, amountEth);

    return NextResponse.json({
      success: true,
      txHash,
    });
  } catch (error: any) {
    console.error("[Vendor Withdrawal API] Error:", error);
    return NextResponse.json(
      { error: error.message || "On-chain transaction failed. Verify your balance." },
      { status: 500 }
    );
  }
}
