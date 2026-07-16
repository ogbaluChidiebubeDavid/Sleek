const axios = require("axios");

const token = "EAAV7tl3CmwkBR4NwjTtUHGypsQDVHjZC4bxx13XvHcOmByMLQqtSdz8pZCcMZBpgJDfb99ZABOGgBoU8x84BGqYf4IrrzFTOa38TYsPBLbUZBQIeZACouNyFkvY4Shp9OllxeZCikl5hZB50eoqWEhEcixhlfCpcOlZCfFctiTcHER8s4Mz5m71aAZCp88xsMb4r8WEwZDZD";
const phoneId = "1222221030970686";
const targetPhone = "2348146272564";

const configs = [
  {
    name: "Body Component + Button Index 0 as String",
    payload: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: targetPhone,
      type: "template",
      template: {
        name: "open_catalog",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: []
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
    }
  },
  {
    name: "Body Component + Button Index 0 as Integer",
    payload: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: targetPhone,
      type: "template",
      template: {
        name: "open_catalog",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: []
          },
          {
            type: "button",
            sub_type: "url",
            index: 0,
            parameters: [
              { type: "text", text: `?phone=${targetPhone}` }
            ]
          }
        ]
      }
    }
  },
  {
    name: "Button component without sub_type or index (just type and parameters)",
    payload: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: targetPhone,
      type: "template",
      template: {
        name: "open_catalog",
        language: { code: "en" },
        components: [
          {
            type: "button",
            parameters: [
              { type: "text", text: `?phone=${targetPhone}` }
            ]
          }
        ]
      }
    }
  }
];

async function runTest() {
  for (const item of configs) {
    console.log(`\nTesting: ${item.name}...`);
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await axios.post(
          `https://graph.facebook.com/v21.0/${phoneId}/messages`,
          item.payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Success! Meta Response:", res.data);
        return; // Stop if success
      } catch (error) {
        if (error.code === 'ENOTFOUND') {
          console.warn(`DNS lookup failed. Retrying in 1s...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.error("API Error:");
          if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
          } else {
            console.error(error.message);
          }
          break; // Stop retrying this config, move to next
        }
      }
    }
  }
}

runTest();
