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
