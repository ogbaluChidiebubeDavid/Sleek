import axios from "axios";
import crypto from "crypto";

export type PaymentProvider = "opay" | "cryptomus" | "flutterwave" | "paystack";

export interface PaymentInitResult {
  provider: PaymentProvider;
  authorizationUrl?: string;
  reference: string;
  deepLink?: string;
  invoiceUrl?: string;
  raw?: unknown;
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function initPaystack(
  email: string,
  amount: number,
  reference: string,
  metadata: Record<string, string>
): Promise<PaymentInitResult> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return {
      provider: "paystack",
      reference,
      authorizationUrl: `${getAppUrl()}/checkout/demo?ref=${reference}&provider=paystack`,
    };
  }

  const res = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: email || "customer@sleek.shop",
      amount: Math.round(amount * 100),
      reference,
      callback_url: `${getAppUrl()}/api/payments/callback/paystack?orderId=${metadata.orderId}`,
      metadata,
    },
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
      authorizationUrl: `${getAppUrl()}/checkout/demo?ref=${reference}&provider=flutterwave`,
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
      invoiceUrl: `${getAppUrl()}/checkout/demo?ref=${reference}&provider=cryptomus`,
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

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "paid",
      status: "processing",
      paymentMethod: method,
      paymentRef: ref,
    },
    include: { user: true, items: true },
  });

  await prisma.cartItem.deleteMany({
    where: { cart: { userId: order.userId } },
  });

  await sendPaymentReceipt(order.user.phone, order.id);
  return order;
}
