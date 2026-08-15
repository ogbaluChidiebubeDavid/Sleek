# Sleek — AI Footwear Commerce on WhatsApp & Telegram

Landing page styled after [useazza.com](https://www.useazza.com/) (light geometric hero, bold typography, phone mockup), built for footwear sales with Opay, Cryptomus, Flutterwave, and Paystack.

The store runs as a **Telegram Mini App** today and as a WhatsApp Flow once Meta business verification is complete — both share the same catalogue, cart, checkout and payment backend.

## Quick start

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Wire your WhatsApp number

1. Copy `.env.example` → `.env`
2. Set **`NEXT_PUBLIC_WHATSAPP_NUMBER`** to your WhatsApp Business number (e.g. `2348012345678`)
3. In [Meta Developer Console](https://developers.facebook.com/):
   - Add WhatsApp product → get **Phone number ID** and **Access token**
   - Webhook URL: `https://YOUR_DOMAIN/api/webhooks/whatsapp`
   - Verify token: `sleek_verify_token` (match `WHATSAPP_VERIFY_TOKEN` in `.env`)
   - Subscribe to **messages**

## Deploy to Vercel

SQLite does not persist on Vercel. Use a free [Neon](https://neon.tech) Postgres database:

1. Create a Neon project → copy connection string
2. In `prisma/schema.prisma`, set `provider = "postgresql"` and use Neon `DATABASE_URL`
3. Push to GitHub, then:

```bash
npx vercel
```

4. In Vercel **Environment Variables**, add all keys from `.env.example` plus:
   - `DATABASE_URL` (Postgres)
   - `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
   - WhatsApp & payment keys

5. Redeploy. Update Meta webhook URL to your Vercel domain.

Or connect the repo in [vercel.com/new](https://vercel.com/new) and import the project.

## Run it as a Telegram Mini App

The whole store (catalogue, cart, checkout, payments) runs inside Telegram as a Mini App. Users are identified by their Telegram account, so no phone number is needed.

1. **Create a bot** — talk to [@BotFather](https://t.me/BotFather) → `/newbot`, copy the token.
2. **Add env vars** (in `.env` and Vercel):
   - `TELEGRAM_BOT_TOKEN` — the bot token
   - `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` — the bot's public username (e.g. `sleek_footwear_bot`)
   - `TELEGRAM_WEBHOOK_SECRET` — any random string (verifies webhook calls)
   - `NEXT_PUBLIC_APP_URL` — your HTTPS app URL (Telegram requires HTTPS)
3. **One-time setup** — registers the webhook, sets the chat menu button (🛍 Shop) and bot commands:

   ```bash
   TELEGRAM_BOT_TOKEN=123:abc APP_URL=https://your-app.vercel.app TELEGRAM_WEBHOOK_SECRET=xyz node scripts/setup-telegram-bot.mjs
   ```
4. Open your bot in Telegram (`t.me/yourbot`) and press **Start** — it replies with an **🛍 Open Sleek Catalogue** button. The same button is always available via the menu button next to the message input.

How it works: the Mini App sends Telegram's signed `initData` to `/api/auth/telegram`, which verifies the signature with the bot token and maps the Telegram user to the existing `User` model (`phone = tg:<id>`) — so carts, checkout and payments work unchanged.

## User flow

1. **Get Started** → WhatsApp with `Hello I want to buy footwear`
2. **Sleek agent** → catalogue carousel (5 items, Buy / Cart / View more)
3. **View more** → `/catalog` in WhatsApp browser
4. **Checkout** → Opay / crypto / Flutterwave / Paystack
5. **Receipt** → tracking `SL-XXXXX` in chat

On Telegram: open the bot → **🛍 Open Sleek Catalogue** → same cart/checkout flow inside the Mini App.

## Brand

- Name: **Sleek**
- Logo: `src/components/brand/SleekLogo.tsx`
- Colors: `sleek-500` (#2f6bff) in `globals.css`
