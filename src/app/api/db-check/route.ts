import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    console.log("[Db Check] Probing database connection...");
    
    // Check database URL in environment
    const dbUrl = process.env.DATABASE_URL || "";
    const obfuscatedUrl = dbUrl.replace(/:[^:@]+@/, ":****@");
    
    // Try simple query
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      success: true,
      message: "Database connection verified successfully!",
      usersCount: userCount,
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
