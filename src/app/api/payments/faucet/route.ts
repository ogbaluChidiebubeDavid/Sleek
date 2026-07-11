import { NextRequest, NextResponse } from "next/server";
import { fundWallet } from "@/lib/blockchain";

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();
    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const txHash = await fundWallet(address, "0.05");
    if (!txHash) {
      return NextResponse.json({
        success: false,
        error: "Faucet key not configured or transaction failed. Please fund your wallet externally.",
      });
    }

    return NextResponse.json({ success: true, txHash });
  } catch (error: any) {
    console.error("[Faucet API] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
