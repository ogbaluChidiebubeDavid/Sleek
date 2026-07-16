import axios from "axios";
import fs from "fs";
import path from "path";

// Manually parse .env file
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    }
  }
}

async function main() {
  loadEnv();
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = "2348148463933"; // Recipient from logs
  const API_BASE = "https://graph.facebook.com/v21.0";

  if (!token || !phoneId) {
    console.error("Missing token or phoneId in env");
    return;
  }

  const imageUrl = "https://sleek-brown.vercel.app/footwear-suede.jpg";
  console.log("Testing with imageUrl:", imageUrl);

  const components = [
    {
      type: "header",
      parameters: [
        {
          type: "image",
          image: {
            link: imageUrl
          }
        }
      ]
    },
    {
      type: "button",
      sub_type: "url",
      index: "0",
      parameters: [
        { type: "text", text: `?phone=${encodeURIComponent(to)}` }
      ]
    }
  ];

  try {
    const res = await axios.post(
      `${API_BASE}/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to.replace(/\D/g, ""),
        type: "template",
        template: {
          name: "open_catalogue",
          language: { code: "en" },
          components: components,
        },
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`Success sending open_catalogue:`, res.data);
  } catch (error: any) {
    console.error(`Error sending open_catalogue:`, JSON.stringify(error.response?.data || error.message, null, 2));
  }
}

main();
