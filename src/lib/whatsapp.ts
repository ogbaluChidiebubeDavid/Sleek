import axios from "axios";

const API_BASE = "https://graph.facebook.com/v21.0";

function getConfig() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return null;
  return { token, phoneId };
}

export async function sendTextMessage(to: string, body: string) {
  const config = getConfig();
  if (!config) {
    console.warn("[WhatsApp] Missing credentials — message not sent:", body.slice(0, 80));
    return { simulated: true };
  }

  const { token, phoneId } = config;
  try {
    const res = await axios.post(
      `${API_BASE}/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        to: to.replace(/\D/g, ""),
        type: "text",
        text: { body },
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    console.error("[WhatsApp Send Error - sendTextMessage]:", error.response?.data || error.message);
    return { error: error.message, details: error.response?.data };
  }
}

export async function sendInteractiveButtons(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[]
) {
  const config = getConfig();
  if (!config) {
    console.warn("[WhatsApp] Missing credentials — interactive not sent");
    return { simulated: true };
  }

  const { token, phoneId } = config;
  try {
    const res = await axios.post(
      `${API_BASE}/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        to: to.replace(/\D/g, ""),
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: bodyText },
          action: {
            buttons: buttons.slice(0, 3).map((b) => ({
              type: "reply",
              reply: { id: b.id, title: b.title.slice(0, 20) },
            })),
          },
        },
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    console.error("[WhatsApp Send Error - sendInteractiveButtons]:", error.response?.data || error.message);
    return { error: error.message, details: error.response?.data };
  }
}

export async function sendProductCarousel(
  to: string,
  introText: string,
  products: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    colors?: string[];
    sizes?: string[];
  }[]
) {
  const config = getConfig();
  const catalogText =
    introText +
    "\n\n" +
    products
      .map(
        (p, i) =>
          `${i + 1}. *${p.name}* — ₦${p.price.toLocaleString()}\n` +
          (p.colors && p.colors.length ? `   Colors: ${p.colors.join(", ")}\n` : "") +
          (p.sizes && p.sizes.length ? `   Sizes: ${p.sizes.join(", ")}\n` : "") +
          `   Reply: BUY_${p.id} | CART_${p.id}`
      )
      .join("\n\n");

  await sendTextMessage(to, catalogText);

  if (!config) return { simulated: true };

  const { token, phoneId } = config;

  for (const product of products.slice(0, 5)) {
    const colorText = product.colors && product.colors.length ? `\nColors: ${product.colors.join(", ")}` : "";
    const sizeText = product.sizes && product.sizes.length ? `\nSizes: ${product.sizes.join(", ")}` : "";

    try {
      await axios.post(
        `${API_BASE}/${phoneId}/messages`,
        {
          messaging_product: "whatsapp",
          to: to.replace(/\D/g, ""),
          type: "interactive",
          interactive: {
            type: "button",
            header: {
              type: "image",
              image: { link: product.imageUrl },
            },
            body: {
              text: `${product.name}\n₦${product.price.toLocaleString()}${colorText}${sizeText}`,
            },
            action: {
              buttons: [
                { type: "reply", reply: { id: `buy_${product.id}`, title: "Buy" } },
                {
                  type: "reply",
                  reply: { id: `cart_${product.id}`, title: "Add to cart" },
                },
                {
                  type: "reply",
                  reply: { id: "view_more", title: "View more" },
                },
              ],
            },
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error: any) {
      console.error(`[WhatsApp Send Error - sendProductCarousel Carousel Item ${product.name}]:`, error.response?.data || error.message);
    }
  }

  await sendInteractiveButtons(to, "Browse our full catalogue or checkout:", [
    { id: "view_more", title: "View more" },
    { id: "checkout", title: "Checkout" },
    { id: "track_order", title: "Track order" },
  ]);

  return { sent: true };
}

export async function sendFlowLink(to: string, message: string, flowPath: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${baseUrl}${flowPath}?phone=${encodeURIComponent(to)}`;
  await sendTextMessage(
    to,
    `${message}\n\nOpen catalogue: ${link}\n\n(Works inside WhatsApp browser)`
  );
}
