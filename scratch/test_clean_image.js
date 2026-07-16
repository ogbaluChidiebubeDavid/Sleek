const axios = require("axios");

const token = "EAAV7tl3CmwkBR4NwjTtUHGypsQDVHjZC4bxx13XvHcOmByMLQqtSdz8pZCcMZBpgJDfb99ZABOGgBoU8x84BGqYf4IrrzFTOa38TYsPBLbUZBQIeZACouNyFkvY4Shp9OllxeZCikl5hZB50eoqWEhEcixhlfCpcOlZCfFctiTcHER8s4Mz5m71aAZCp88xsMb4r8WEwZDZD";
const phoneId = "1222221030970686";
const targetPhone = "2348146272564";

async function main() {
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: targetPhone,
    type: "template",
    template: {
      name: "open_catalogue",
      language: { code: "en" },
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "image",
              image: { link: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Everest_North_Face_toward_Base_Camp_Tibet_Luca_Galuzzi_2006.jpg" }
            }
          ]
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [
            { type: "text", text: `?phone=${targetPhone}` }
          ]
        }
      ]
    }
  };

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      console.log(`[Attempt ${attempt}] Sending open_catalogue with clean image...`);
      const res = await axios.post(
        `https://graph.facebook.com/v21.0/${phoneId}/messages`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Success! Meta Response:", JSON.stringify(res.data, null, 2));
      return;
    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        console.warn("DNS lookup failed. Retrying in 1.5s...");
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        console.error("Meta Send API call failed:");
        if (error.response) {
          console.error("Status:", error.response.status);
          console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
          console.error(error.message);
        }
        return;
      }
    }
  }
}

main();
