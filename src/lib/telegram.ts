import crypto from "crypto";

export type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

/**
 * Validates Telegram WebApp initData (HMAC-SHA256 signed by the bot token)
 * and returns the authenticated user, or null if the signature is invalid.
 */
export function verifyTelegramInitData(
  initData: string,
  botToken: string
): TelegramUser | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return null;

    params.delete("hash");
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");

    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();
    const computedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (computedHash !== hash) return null;

    const userRaw = params.get("user");
    if (!userRaw) return null;
    const user = JSON.parse(userRaw);
    return typeof user?.id === "number" ? user : null;
  } catch {
    return null;
  }
}

/**
 * Telegram users are stored against the existing unique `phone` field
 * using a namespaced pseudo-phone, so all phone/token-based flows
 * (cart, checkout, signup) work unchanged.
 */
export function telegramUserPhone(tgId: number | string): string {
  return `tg:${tgId}`;
}

/**
 * Sends a message directly to a Telegram user's chat.
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  replyMarkup?: any
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.warn("[Telegram] Cannot send message: TELEGRAM_BOT_TOKEN not configured");
    return false;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      // Fallback without Markdown if parsing fails
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
        }),
      });
    }
    return true;
  } catch (err) {
    console.error("[Telegram] sendTelegramMessage error:", err);
    return false;
  }
}
