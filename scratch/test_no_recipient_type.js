const axios = require("axios");

const token = "EAAV7tl3CmwkBR4NwjTtUHGypsQDVHjZC4bxx13XvHcOmByMLQqtSdz8pZCcMZBpgJDfb99ZABOGgBoU8x84BGqYf4IrrzFTOa38TYsPBLbUZBQIeZACouNyFkvY4Shp9OllxeZCikl5hZB50eoqWEhEcixhlfCpcOlZCfFctiTcHER8s4Mz5m71aAZCp88xsMb4r8WEwZDZD";
const phoneId = "1222221030970686";
const targetPhone = "2348146272564";

async function main() {
  try {
    console.log(`Attempting to send template "open_catalog" without recipient_type...`);
    const payload = {
      messaging_product: "whatsapp",
      to: targetPhone,
      type: "template",
      template: {
        name: "open_catalog",
        language: { code: "en" },
        components: [
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

    const res = await axios.post(
      `https://graph.facebook.com/v21.0/${phoneId}/messages`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log("Success! Meta Response:", JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error("Meta Send API call failed:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

main();
