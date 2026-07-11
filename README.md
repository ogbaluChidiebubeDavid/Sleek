# Sleek — AI Footwear Commerce on WhatsApp

Landing page styled after [useazza.com](https://www.useazza.com/) (light geometric hero, bold typography, phone mockup), built for footwear sales with Opay, Cryptomus, Flutterwave, and Paystack.

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

## User flow

1. **Get Started** → WhatsApp with `Hello I want to buy footwear`
2. **Sleek agent** → catalogue carousel (5 items, Buy / Cart / View more)
3. **View more** → `/catalog` in WhatsApp browser
4. **Checkout** → Opay / crypto / Flutterwave / Paystack
5. **Receipt** → tracking `SL-XXXXX` in chat

## Brand

- Name: **Sleek**
- Logo: `src/components/brand/SleekLogo.tsx`
- Colors: `sleek-500` (#2f6bff) in `globals.css`
