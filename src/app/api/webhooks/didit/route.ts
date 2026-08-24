import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      body = { raw: rawBody };
    }

    // Log the webhook for auditability
    await prisma.webhookLog.create({
      data: {
        payload: rawBody,
        headers: JSON.stringify(Object.fromEntries(req.headers.entries())),
      },
    });

    // Didit webhook events: session.completed, session.approved, session.declined
    const eventType = body?.event || body?.type || body?.status;
    const vendorId = body?.vendor_data || body?.session?.vendor_data || body?.metadata?.vendorId;
    const sessionStatus = body?.session?.status || body?.status || eventType;

    if (vendorId) {
      if (
        sessionStatus === "Approved" ||
        sessionStatus === "approved" ||
        sessionStatus === "session.approved" ||
        sessionStatus === "session.completed"
      ) {
        await prisma.vendor.update({
          where: { id: vendorId },
          data: { kycStatus: "verified" },
        });
        console.log(`[Didit Webhook] Vendor ${vendorId} KYC marked as verified.`);
      } else if (
        sessionStatus === "Declined" ||
        sessionStatus === "declined" ||
        sessionStatus === "session.declined"
      ) {
        await prisma.vendor.update({
          where: { id: vendorId },
          data: { kycStatus: "declined" },
        });
        console.log(`[Didit Webhook] Vendor ${vendorId} KYC marked as declined.`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Didit Webhook Error]:", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}
