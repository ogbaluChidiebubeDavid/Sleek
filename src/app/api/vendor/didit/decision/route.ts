import { NextRequest, NextResponse } from "next/server";
import { getDiditDecision } from "@/lib/didit";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    const vendorId = req.nextUrl.searchParams.get("vendorId") || undefined;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const decision = await getDiditDecision(sessionId, vendorId);
    return NextResponse.json(decision);
  } catch (error: any) {
    console.error("[Didit Decision API] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to check Didit decision" }, { status: 500 });
  }
}
