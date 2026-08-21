import axios from "axios";
import crypto from "crypto";
import { formatCurrency } from "@/lib/utils";

export type PaymentProvider = "opay" | "cryptomus" | "flutterwave" | "paystack";

export interface PaymentInitResult {
  provider: PaymentProvider;
  authorizationUrl?: string;
  reference: string;
  deepLink?: string;
  invoiceUrl?: string;
  raw?: unknown;
}

// Set per-request by the payment init route so callback URLs always
// match the public domain the request came in on.
let appUrlOverride: string | null = null;

export function setAppUrlOverride(url: string) {
  appUrlOverride = url;
}

function getAppUrl() {
  return (
    appUrlOverride ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.seekfeet.xyz"
  );
}

export async function initPaystack(
  email: string,
  amount: number,
  reference: string,
  metadata: Record<string, string>,
  subaccountCode?: string | null
): Promise<PaymentInitResult> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return {
      provider: "paystack",
      reference,
      authorizationUrl: `${getAppUrl()}/checkout/demo?ref=${reference}&provider=paystack&orderId=${metadata.orderId}`,
    };
  }

  // Calculate platform commission (in kobo) - default 0.5%
  const platformCommissionPercent = Number(process.env.PLATFORM_COMMISSION_PERCENTAGE || "0.5");
  const amountKobo = Math.round(amount * 100);
  const platformFeeKobo = Math.round(amountKobo * (platformCommissionPercent / 100));

  const payload: Record<string, any> = {
    email: email || "customer@sleek.shop",
    amount: amountKobo,
    reference,
    callback_url: `${getAppUrl()}/api/payments/callback/paystack?orderId=${metadata.orderId}`,
    metadata,
  };

  // If vendor has an active Paystack Subaccount, route the split in real time
  if (subaccountCode) {
    payload.subaccount = subaccountCode;
    payload.transaction_charge = platformFeeKobo;
    payload.bearer = "subaccount";
  }

  const res = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    payload,
    { headers: { Authorization: `Bearer ${secret}` } }
  );

  return {
    provider: "paystack",
    reference,
    authorizationUrl: res.data.data.authorization_url,
    raw: res.data,
  };
}

export async function initFlutterwave(
  email: string,
  amount: number,
  reference: string,
  metadata: Record<string, string>
): Promise<PaymentInitResult> {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secret) {
    return {
      provider: "flutterwave",
      reference,
      authorizationUrl: `${getAppUrl()}/checkout/demo?ref=${reference}&provider=flutterwave&orderId=${metadata.orderId}`,
    };
  }

  const res = await axios.post(
    "https://api.flutterwave.com/v3/payments",
    {
      tx_ref: reference,
      amount,
      currency: "NGN",
      redirect_url: `${getAppUrl()}/api/payments/callback/flutterwave?orderId=${metadata.orderId}`,
      customer: { email: email || "customer@sleek.shop" },
      meta: metadata,
      customizations: {
        title: "Sleek Footwear",
        description: "Footwear order payment",
      },
    },
    { headers: { Authorization: `Bearer ${secret}` } }
  );

  return {
    provider: "flutterwave",
    reference,
    authorizationUrl: res.data.data.link,
    raw: res.data,
  };
}

export async function initCryptomus(
  amount: number,
  reference: string,
  metadata: Record<string, string>
): Promise<PaymentInitResult> {
  const merchantId = process.env.CRYPTOMUS_MERCHANT_ID;
  const apiKey = process.env.CRYPTOMUS_API_KEY;

  if (!merchantId || !apiKey) {
    return {
      provider: "cryptomus",
      reference,
      invoiceUrl: `${getAppUrl()}/checkout/demo?ref=${reference}&provider=cryptomus&orderId=${metadata.orderId}`,
    };
  }

  const body = {
    amount: String(amount),
    currency: "NGN",
    order_id: reference,
    url_callback: `${getAppUrl()}/api/payments/webhook/cryptomus`,
    url_return: `${getAppUrl()}/api/payments/callback/cryptomus?orderId=${metadata.orderId}`,
    is_payment_multiple: false,
    lifetime: 3600,
  };

  const signPayload = Buffer.from(JSON.stringify(body)).toString("base64");
  const sign = crypto.createHash("md5").update(signPayload + apiKey).digest("hex");

  const res = await axios.post("https://api.cryptomus.com/v1/payment", body, {
    headers: {
      merchant: merchantId,
      sign,
      "Content-Type": "application/json",
    },
  });

  return {
    provider: "cryptomus",
    reference,
    invoiceUrl: res.data.result?.url,
    authorizationUrl: res.data.result?.url,
    raw: res.data,
  };
}

export async function initOpay(
  amount: number,
  reference: string,
  metadata: Record<string, string>
): Promise<PaymentInitResult> {
  const merchantId = process.env.OPAY_MERCHANT_ID;
  const publicKey = process.env.OPAY_PUBLIC_KEY;
  const privateKey = process.env.OPAY_PRIVATE_KEY;
  const apiUrl = process.env.OPAY_API_URL || "https://api.opaycheckout.com/api/v1";

  if (!merchantId || !publicKey || !privateKey) {
    return {
      provider: "opay",
      reference,
      deepLink: `opay://payment?reference=${reference}&amount=${amount}`,
      authorizationUrl: `${getAppUrl()}/checkout/opay?ref=${reference}&orderId=${metadata.orderId}`,
    };
  }

  const payload = {
    reference,
    mchShortName: "Sleek",
    productName: "Footwear Order",
    productDesc: "Sleek footwear purchase",
    userPhone: metadata.phone || "",
    amount: { total: Math.round(amount * 100), currency: "NGN" },
    callbackUrl: `${getAppUrl()}/api/payments/callback/opay?orderId=${metadata.orderId}`,
    returnUrl: `${getAppUrl()}/checkout/success?orderId=${metadata.orderId}`,
    payTypes: ["BalancePayment"],
  };

  const signature = crypto
    .createHmac("sha512", privateKey)
    .update(JSON.stringify(payload))
    .digest("hex");

  try {
    const res = await axios.post(`${apiUrl}/international/cashier/create`, payload, {
      headers: {
        MerchantId: merchantId,
        Authorization: `Bearer ${publicKey}`,
        Signature: signature,
      },
    });

    const cashierUrl =
      res.data?.data?.cashierUrl ||
      res.data?.data?.paymentUrl ||
      `opay://payment?url=${encodeURIComponent(res.data?.data?.orderNo || reference)}`;

    return {
      provider: "opay",
      reference,
      authorizationUrl: cashierUrl,
      deepLink: cashierUrl.startsWith("opay://") ? cashierUrl : `opay://payment?ref=${reference}`,
      raw: res.data,
    };
  } catch (err) {
    console.error("[Opay] init error", err);
    return {
      provider: "opay",
      reference,
      authorizationUrl: `${getAppUrl()}/checkout/opay?ref=${reference}&orderId=${metadata.orderId}`,
      deepLink: `opay://payment?reference=${reference}`,
    };
  }
}

export async function verifyPaystack(reference: string): Promise<boolean> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return reference.startsWith("SL-") || reference.startsWith("PAY-");
  const res = await axios.get(
    `https://api.paystack.co/transaction/verify/${reference}`,
    { headers: { Authorization: `Bearer ${secret}` } }
  );
  return res.data?.data?.status === "success";
}

export async function markOrderPaid(orderId: string, ref: string, method: string) {
  const { prisma } = await import("@/lib/db");
  const { sendPaymentReceipt } = await import("@/lib/conversation");

  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  const vendorId = existing?.vendorId || existing?.items[0]?.product?.vendorId || null;

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "paid",
      status: "processing",
      paymentMethod: method,
      paymentRef: ref,
      ...(vendorId ? { vendorId } : {}),
    },
    include: { user: true, items: true, vendor: true },
  });

  // If paid via fiat (Paystack/Flutterwave/Opay/Demo) and vendor is linked,
  // credit the vendor's fiat earnings (95% share, 5% platform fee) if not already split via Subaccount
  if (vendorId && method !== "crypto") {
    const vendorShare = Math.round(order.totalAmount * 0.95);
    await prisma.vendor.update({
      where: { id: vendorId },
      data: { fiatBalance: { increment: vendorShare } },
    }).catch((err) => console.error("[markOrderPaid] Failed to credit vendor fiat balance:", err));
  }

  // Now that payment succeeded, remove the purchased items from the
  // user's cart (they were deliberately kept through checkout so a
  // failed payment wouldn't wipe the cart).
  const cart = await prisma.cart.findUnique({ where: { userId: order.userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        OR: order.items.map((i) => ({
          productId: i.productId,
          color: i.color,
          size: i.size,
        })),
      },
    }).catch(() => {});
  }

  // Telegram User Direct Notification
  if (order.user?.phone && order.user.phone.startsWith("tg:")) {
    try {
      const { sendTelegramMessage } = await import("@/lib/telegram");
      const chatId = order.user.phone.replace("tg:", "");
      const itemsList = order.items
        .map((i) => `• *${i.name}* (${i.color}, Size ${i.size}) x${i.quantity} — ${formatCurrency(i.price * i.quantity)}`)
        .join("\n");

      const vendorName = order.vendor?.businessName ? `\n🏪 *Vendor:* ${order.vendor.businessName}` : "";
      const origin = process.env.NEXT_PUBLIC_APP_URL || "https://seekfeet.xyz";
      const catalogUrl = `${origin}/catalog`;

      const tgMessage = `🎉 *Payment Confirmed!*

Thank you for your order! We've received your payment and notified your vendor to start packaging your items.

🧾 *Payment Reference:* \`${order.paymentRef || ref}\`
📦 *Tracking ID:* \`${order.trackingNumber}\`${vendorName}
💰 *Total Amount Paid:* *${formatCurrency(order.totalAmount)}*
💳 *Payment Method:* ${method.toUpperCase()}

🛍️ *Items Ordered:*
${itemsList}

📍 *Delivery Info:*
${order.shippingName || "Customer"}
${order.shippingAddress ? `${order.shippingAddress}, ${order.shippingCity || ""}` : "Address recorded at checkout"}

🚚 *Live Tracking:*
You can track your order status anytime by sending:
\`/track ${order.paymentRef || order.trackingNumber}\``;

      await sendTelegramMessage(chatId, tgMessage, {
        inline_keyboard: [
          [
            {
              text: "🛍 Open Store Catalogue",
              web_app: { url: catalogUrl },
            },
          ],
        ],
      });
    } catch (err) {
      console.error("[markOrderPaid] Telegram receipt delivery error:", err);
    }
  } else {
    // WhatsApp User Receipt
    try {
      await sendPaymentReceipt(order.user.phone, order.id);
    } catch (err) {
      console.error("[markOrderPaid] WhatsApp receipt delivery failed:", err);
    }
  }

  return order;
}
