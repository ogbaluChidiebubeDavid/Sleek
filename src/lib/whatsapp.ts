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

export async function sendCtaUrlButton(
  to: string,
  bodyText: string,
  buttonText: string,
  url: string
) {
  const config = getConfig();
  if (!config) {
    console.warn("[WhatsApp] Missing credentials — CTA URL not sent");
    return { simulated: true };
  }

  // Fallback check: Meta Cloud API strictly requires HTTPS URLs for CTA interactive buttons.
  // If we detect http:// (like localhost), we automatically use the text link fallback.
  if (!url.startsWith("https://")) {
    console.warn("[WhatsApp] URL must be HTTPS for cta_url. Falling back to text link message:", url);
    return await sendTextMessage(to, `${bodyText}\n\n👉 *${buttonText}*:\n${url}`);
  }

  const { token, phoneId } = config;
  try {
    const res = await axios.post(
      `${API_BASE}/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to.replace(/\D/g, ""),
        type: "interactive",
        interactive: {
          type: "cta_url",
          body: { text: bodyText },
          action: {
            name: "cta_url",
            parameters: {
              display_text: buttonText,
              url: url,
            },
          },
        },
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    console.error("[WhatsApp Send Error - sendCtaUrlButton]:", error.response?.data || error.message);
    // If Meta's API rejects the interactive payload for any reason, deliver via standard text link:
    console.log("[WhatsApp Fallback] Retrying delivery via standard text link message...");
    return await sendTextMessage(to, `${bodyText}\n\n👉 *${buttonText}*:\n${url}`);
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
  await sendTextMessage(to, introText);

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

  await sendInteractiveButtons(to, "Browse our full catalogue:", [
    { id: "view_more", title: "View more" },
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

export async function sendTemplateMessage(
  to: string,
  templateName: string,
  parameters: any[],
  buttonParameters: any[] = []
) {
  const config = getConfig();
  if (!config) return { simulated: true };

  const { token, phoneId } = config;
  try {
    const components: any[] = [];
    if (parameters.length > 0) {
      components.push({
        type: "body",
        parameters: parameters,
      });
    }
    if (buttonParameters.length > 0) {
      components.push({
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: buttonParameters,
      });
    }

    const res = await axios.post(
      `${API_BASE}/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to.replace(/\D/g, ""),
        type: "template",
        template: {
          name: templateName,
          language: { code: "en_US" },
          components: components,
        },
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    console.error(`[WhatsApp Template Error - ${templateName}]:`, error.response?.data || error.message);
    throw error;
  }
}

export async function sendCatalogLink(to: string) {
  const config = getConfig();
  if (!config) {
    console.warn("[WhatsApp] Missing credentials — sendCatalogLink simulated");
    return { simulated: true };
  }

  const { token, phoneId } = config;
  const link = `https://sleek-brown.vercel.app/catalog?phone=${encodeURIComponent(to)}`;

  try {
    const res = await axios.post(
      `${API_BASE}/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to.replace(/\D/g, ""),
        type: "interactive",
        interactive: {
          type: "cta_url",
          header: {
            type: "text",
            text: "Sleek Digital Storefront"
          },
          body: {
            text: "Tap the button below to browse all footwear collections, create your digital wallet, and check out seamlessly without leaving the chat thread."
          },
          footer: {
            text: "Powered by Chain Abstraction"
          },
          action: {
            name: "cta_url",
            parameters: {
              display_text: "Open Catalogue 🛍️",
              url: link
            }
          }
        }
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    console.error("[WhatsApp Send Error - sendCatalogLink]:", error.response?.data || error.message);
    // Fallback: deliver via standard clickable text link
    return await sendTextMessage(
      to,
      `Explore our full footwear collection, customize your order, and shop our premium catalogue:\n\n👉 *Open Catalogue*:\n${link}`
    );
  }
}

export async function sendCheckoutLink(to: string, orderId: string, total: number, itemsNames: string) {
  const config = getConfig();
  if (!config) {
    console.warn("[WhatsApp] Missing credentials — sendCheckoutLink simulated");
    return { simulated: true };
  }

  const { token, phoneId } = config;
  const link = `https://sleek-brown.vercel.app/checkout/${orderId}?phone=${encodeURIComponent(to)}`;

  try {
    const res = await axios.post(
      `${API_BASE}/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to.replace(/\D/g, ""),
        type: "interactive",
        interactive: {
          type: "cta_url",
          header: {
            type: "text",
            text: "Sleek Secure Checkout"
          },
          body: {
            text: `Your order for *${itemsNames}* has been created successfully!\n\nTotal: ₦${total.toLocaleString()}\n\nTap below to complete onboarding, create your crypto wallet, and pay.`
          },
          footer: {
            text: "Powered by Privy & Base Sepolia"
          },
          action: {
            name: "cta_url",
            parameters: {
              display_text: "Secure Checkout 💳",
              url: link
            }
          }
        }
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error: any) {
    console.error("[WhatsApp Send Error - sendCheckoutLink]:", error.response?.data || error.message);
    // Fallback: deliver via standard clickable text link
    return await sendTextMessage(
      to,
      `Your order for *${itemsNames}* has been created successfully!\nTotal: ₦${total.toLocaleString()}\n\n👉 *Secure Checkout*:\n${link}`
    );
  }
}
