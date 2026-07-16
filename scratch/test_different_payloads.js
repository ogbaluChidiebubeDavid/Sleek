const axios = require("axios");

const token = "EAAV7tl3CmwkBR4NwjTtUHGypsQDVHjZC4bxx13XvHcOmByMLQqtSdz8pZCcMZBpgJDfb99ZABOGgBoU8x84BGqYf4IrrzFTOa38TYsPBLbUZBQIeZACouNyFkvY4Shp9OllxeZCikl5hZB50eoqWEhEcixhlfCpcOlZCfFctiTcHER8s4Mz5m71aAZCp88xsMb4r8WEwZDZD";
const phoneId = "1222221030970686";
const targetPhone = "2348146272564";

const payloads = {
  "V1 (String index, simple text suffix)": {
    name: "open_catalog",
    language: { code: "en" },
    components: [
      {
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: [
          { type: "text", text: "?phone=2348146272564" }
        ]
      }
    ]
  },
  "V2 (Integer index, simple text suffix)": {
    name: "open_catalog",
    language: { code: "en" },
    components: [
      {
        type: "button",
        sub_type: "url",
        index: 0,
        parameters: [
          { type: "text", text: "?phone=2348146272564" }
        ]
      }
    ]
  },
  "V3 (Including empty body component)": {
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
          { type: "text", text: "?phone=2348146272564" }
        ]
      }
    ]
  },
  "V4 (Image Header for open_catalogue)": {
    name: "open_catalogue",
    language: { code: "en" },
    components: [
      {
        type: "header",
        parameters: [
          {
            type: "image",
            image: { link: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop" }
          }
        ]
      },
      {
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: [
          { type: "text", text: "?phone=2348146272564" }
        ]
      }
    ]
  },
  "V5 (Open Catalogue with empty parameters for buttons)": {
    name: "open_catalogue",
    language: { code: "en" },
    components: [
      {
        type: "header",
        parameters: [
          {
            type: "image",
            image: { link: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop" }
          }
        ]
      }
    ]
  }
};

async function main() {
  for (const [name, config] of Object.entries(payloads)) {
    try {
      console.log(`\n------------------ Testing Payload: ${name} ------------------`);
      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: targetPhone,
        type: "template",
        template: config
      };

      const res = await axios.post(
        `https://graph.facebook.com/v21.0/${phoneId}/messages`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log(`Success! response:`, res.data);
      break; // Stop at first success!
    } catch (error) {
      console.error(`Failed:`);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", JSON.stringify(error.response.data, null, 2));
      } else {
        console.error(error.message);
      }
    }
  }
}

main();
