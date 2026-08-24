import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Per-session config, NOT a secret and NOT an env var. "Free KYC" workflow.
const WORKFLOW_ID = "bf73ef41-2ed2-4652-83ad-4827942fb983";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const vendorId = body.vendorId || body.vendorData;

    if (!vendorId) {
      return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sleek-brown.vercel.app";
    const callbackUrl = `${appUrl}/vendor/dashboard?didit_session=`;

    const apiKey = process.env.DIDIT_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "DIDIT_API_KEY is not configured" }, { status: 500 });
    }

    const res = await fetch("https://verification.didit.me/v3/session/", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workflow_id: WORKFLOW_ID,
        vendor_data: vendor.id,
        callback: `${callbackUrl}${vendor.id}`,
        metadata: {
          email: vendor.email,
          businessName: vendor.businessName,
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("[Didit Session API] Create session error:", detail);
      return NextResponse.json({ error: "session_create_failed", detail }, { status: 502 });
    }

    const session = await res.json();
    return NextResponse.json({
      success: true,
      url: session.url,
      session_id: session.session_id,
      session_token: session.session_token,
      status: session.status,
    });
  } catch (error: any) {
    console.error("[Didit Session API] Unexpected error:", error);
    return NextResponse.json({ error: error.message || "Failed to create Didit session" }, { status: 500 });
  }
}
