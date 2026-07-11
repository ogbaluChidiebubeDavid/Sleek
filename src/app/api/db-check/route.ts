import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    console.log("[Db Check] Probing database connection...");
    
    // Check database URL in environment
    const dbUrl = process.env.DATABASE_URL || "";
    const obfuscatedUrl = dbUrl.replace(/:[^:@]+@/, ":****@");
    
    // Try query counts
    const userCount = await prisma.user.count();
    const stateCount = await prisma.conversationState.count();
    const states = await prisma.conversationState.findMany({ take: 10 });
    const logCount = await prisma.webhookLog.count();
    const logs = await prisma.webhookLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10
    });
    
    return NextResponse.json({
      success: true,
      message: "Database connection verified successfully!",
      usersCount: userCount,
      conversationStatesCount: stateCount,
      conversationStates: states.map(s => ({ phone: s.phone, step: s.step, updatedAt: s.updatedAt })),
      webhookLogsCount: logCount,
      webhookLogs: logs,
      databaseUrlConfigured: dbUrl ? "Yes" : "No",
      databaseUrlPattern: obfuscatedUrl
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || error.toString(),
      stack: error.stack,
      databaseUrlConfigured: process.env.DATABASE_URL ? "Yes" : "No"
    }, { status: 500 });
  }
}
