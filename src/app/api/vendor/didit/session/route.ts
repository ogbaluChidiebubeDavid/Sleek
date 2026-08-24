import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createDiditSession } from "@/lib/didit";

export async function POST(req: NextRequest) {
  try {
    const { vendorId } = await req.json();
    if (!vendorId) {
      return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const session = await createDiditSession(
      vendor.id,
      vendor.email,
      vendor.businessName
    );

    return NextResponse.json({
      success: true,
      ...session,
    });
  } catch (error: any) {
    console.error("[Didit Session API] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create Didit session" }, { status: 500 });
  }
}
