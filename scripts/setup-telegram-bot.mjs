/**
 * One-time Telegram bot setup.
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN=123:abc \
 *   APP_URL=https://your-app.vercel.app \
 *   TELEGRAM_WEBHOOK_SECRET=some-random-string \
 *   node scripts/setup-telegram-bot.mjs
 *
 * - Registers the webhook that greets users with the Mini App button
 * - Sets the bot's menu button (bottom-left of the chat) to open the store
 * - Registers basic bot commands
 */

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const appUrl = process.env.APP_URL;
const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!botToken || !appUrl) {
  console.error(
    "Missing TELEGRAM_BOT_TOKEN or APP_URL environment variables."
  );
  process.exit(1);
}

if (!appUrl.startsWith("https://")) {
  console.error("APP_URL must be HTTPS — Telegram requires it for Web Apps.");
  process.exit(1);
}

const api = (method, body) =>
  fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());

const results = await Promise.all([
  api("setWebhook", {
    url: `${appUrl}/api/webhooks/telegram`,
    ...(webhookSecret ? { secret_token: webhookSecret } : {}),
  }),
  api("setChatMenuButton", {
    menu_button: {
      type: "web_app",
      text: "🛍 Shop",
      web_app: { url: `${appUrl}/catalog` },
    },
  }),
  api("setMyCommands", {
    commands: [{ command: "start", description: "Open the Sleek store" }],
  }),
]);

const names = ["setWebhook", "setChatMenuButton", "setMyCommands"];
results.forEach((res, i) => {
  console.log(`${names[i]}: ${res.ok ? "✅ ok" : `❌ ${JSON.stringify(res)}`}`);
});
