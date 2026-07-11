import { NextRequest, NextResponse } from "next/server";
import { handleIncomingMessage } from "@/lib/conversation";

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
  try {
    const body = await req.json();

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
  } catch (error) {
    console.error("[WhatsApp Webhook]", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
