const axios = require("axios");

async function main() {
  const url = "https://sleek-brown.vercel.app/api/webhooks/whatsapp";
  const payload = {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "1650336676063669",
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "2348146272564",
                phone_number_id: "1222221030970686"
              },
              contacts: [
                {
                  profile: { name: "Test User" },
                  wa_id: "2348148463933"
                }
              ],
              messages: [
                {
                  from: "2348148463933",
                  id: "wamid.HBgLMjM0ODE0ODQ2MzkzM1ASAhI=",
                  timestamp: "1783944481",
                  text: { body: "hello" },
                  type: "text"
                }
              ]
            },
            field: "messages"
          }
        ]
      }
    ]
  };

  try {
    console.log(`Sending mock webhook request to: ${url}...`);
    const res = await axios.post(url, payload);
    console.log("Webhook Response:", JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error("Webhook Call Failed:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

main();
