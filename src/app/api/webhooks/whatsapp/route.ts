import { NextRequest, NextResponse } from "next/server";
import { handleIncomingMessage } from "@/lib/conversation";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "sleek_verify_token";

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  let rawBody = "";
  try {
    rawBody = await req.text();
    
    // Log incoming webhook to Supabase audit log
    try {
      await prisma.webhookLog.create({
        data: {
          payload: rawBody,
          headers: JSON.stringify(Object.fromEntries(req.headers.entries())),
        },
      });
    } catch (logError) {
      console.error("[WhatsApp Webhook Logging Error]:", logError);
    }

    if (!rawBody) {
      return NextResponse.json({ status: "empty_payload" });
    }

    const body = JSON.parse(rawBody);
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages?.length) {
      return NextResponse.json({ status: "ok" });
    }

    for (const message of messages) {
      const phone = message.from;
      let text = "";
      let buttonId: string | undefined;

      if (message.type === "text") {
        text = message.text?.body || "";
      } else if (message.type === "interactive") {
        const interactive = message.interactive;
        if (interactive?.type === "button_reply") {
          buttonId = interactive.button_reply?.id;
          text = interactive.button_reply?.title || buttonId || "";
        } else if (interactive?.type === "list_reply") {
          buttonId = interactive.list_reply?.id;
          text = interactive.list_reply?.title || buttonId || "";
        }
      } else if (message.type === "button") {
        text = message.button?.text || "";
        buttonId = message.button?.payload;
      }

      if (phone && (text || buttonId)) {
        await handleIncomingMessage(phone, text, buttonId);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("[WhatsApp Webhook Error]:", error);
    
    // Save error state in log if possible
    try {
      await prisma.webhookLog.create({
        data: {
          payload: JSON.stringify({ error: error.message || error.toString(), rawBody }),
          headers: "CRASH_LOG",
        },
      });
    } catch {}
    
    return NextResponse.json({ status: "error", error: error.message }, { status: 500 });
  }
}
