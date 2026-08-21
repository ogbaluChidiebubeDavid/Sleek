import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import axios from "axios";

// Platform commission percentage taken from Paystack sales (e.g., 5%)
const PLATFORM_COMMISSION_PERCENTAGE = Number(process.env.PLATFORM_COMMISSION_PERCENTAGE) || 5;

export async function POST(req: NextRequest) {
  try {
    const { vendorId, bankName, bankCode, accountNumber, accountName } = await req.json();

    if (!vendorId || !bankName || !bankCode || !accountNumber || !accountName) {
      return NextResponse.json(
        { error: "All bank fields (vendorId, bankName, bankCode, accountNumber, accountName) are required" },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    let subaccountCode = vendor.paystackSubaccountCode;
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (secret) {
      try {
        if (subaccountCode) {
          // Update existing Paystack subaccount
          const updateRes = await axios.put(
            `https://api.paystack.co/subaccount/${subaccountCode}`,
            {
              business_name: vendor.businessName || accountName,
              settlement_bank: bankCode,
              account_number: accountNumber,
              percentage_charge: PLATFORM_COMMISSION_PERCENTAGE,
              description: `Payout subaccount for ${vendor.businessName}`,
            },
            { headers: { Authorization: `Bearer ${secret}` }, timeout: 8000 }
          );
          if (updateRes.data?.data?.subaccount_code) {
            subaccountCode = updateRes.data.data.subaccount_code;
          }
        } else {
          // Create new Paystack subaccount
          const createRes = await axios.post(
            "https://api.paystack.co/subaccount",
            {
              business_name: vendor.businessName || accountName,
              settlement_bank: bankCode,
              account_number: accountNumber,
              percentage_charge: PLATFORM_COMMISSION_PERCENTAGE,
              description: `Payout subaccount for ${vendor.businessName}`,
            },
            { headers: { Authorization: `Bearer ${secret}` }, timeout: 8000 }
          );
          if (createRes.data?.data?.subaccount_code) {
            subaccountCode = createRes.data.data.subaccount_code;
          }
        }
      } catch (err: any) {
        console.error("[Bank Details API] Paystack subaccount creation/update error:", err.response?.data || err.message);
        // If Paystack reports account doesn't match or other error, return friendly message
        const errMsg = err.response?.data?.message || "Failed to create Paystack subaccount with provided bank details.";
        return NextResponse.json({ error: errMsg }, { status: 400 });
      }
    } else {
      // Demo simulated subaccount code if secret key not configured
      subaccountCode = subaccountCode || `ACCT_DEMO_${Date.now().toString(36).toUpperCase()}`;
    }

    // Persist details to vendor
    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        bankName,
        bankCode,
        accountNumber,
        accountName,
        paystackSubaccountCode: subaccountCode,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Bank details and Paystack subaccount connected successfully!",
      vendor: {
        id: updatedVendor.id,
        bankName: updatedVendor.bankName,
        bankCode: updatedVendor.bankCode,
        accountNumber: updatedVendor.accountNumber,
        accountName: updatedVendor.accountName,
        paystackSubaccountCode: updatedVendor.paystackSubaccountCode,
      },
    });
  } catch (error: any) {
    console.error("[Bank Details API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save bank details" },
      { status: 500 }
    );
  }
}
