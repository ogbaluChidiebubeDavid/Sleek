import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { accountNumber, bankCode } = await req.json();

    if (!accountNumber || !bankCode) {
      return NextResponse.json(
        { error: "Account number and bank code are required" },
        { status: 400 }
      );
    }

    const cleanAccount = String(accountNumber).trim();
    if (cleanAccount.length !== 10 || !/^\d+$/.test(cleanAccount)) {
      return NextResponse.json(
        { error: "NUBAN account number must be exactly 10 digits" },
        { status: 400 }
      );
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      // In demo mode, return simulated verified account name
      return NextResponse.json({
        success: true,
        accountName: "DEMO VENDOR ACCOUNT",
        accountNumber: cleanAccount,
        bankCode,
      });
    }

    const res = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${cleanAccount}&bank_code=${bankCode}`,
      {
        headers: { Authorization: `Bearer ${secret}` },
        timeout: 8000,
      }
    );

    if (res.data?.status && res.data?.data?.account_name) {
      return NextResponse.json({
        success: true,
        accountName: res.data.data.account_name,
        accountNumber: cleanAccount,
        bankCode,
      });
    }

    return NextResponse.json(
      { error: res.data?.message || "Could not resolve bank account. Please check details." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Verify Bank API] Error:", error.response?.data || error.message);
    const msg =
      error.response?.data?.message ||
      "Bank account resolution failed. Please verify account number and bank.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
