const axios = require("axios");

const token = "EAAV7tl3CmwkBR4NwjTtUHGypsQDVHjZC4bxx13XvHcOmByMLQqtSdz8pZCcMZBpgJDfb99ZABOGgBoU8x84BGqYf4IrrzFTOa38TYsPBLbUZBQIeZACouNyFkvY4Shp9OllxeZCikl5hZB50eoqWEhEcixhlfCpcOlZCfFctiTcHER8s4Mz5m71aAZCp88xsMb4r8WEwZDZD";

async function main() {
  try {
    console.log("Querying Meta token details via debug_token endpoint...");
    
    // In Meta, debug_token needs a developer app token or system user token to query
    const res = await axios.get(`https://graph.facebook.com/debug_token`, {
      params: {
        input_token: token,
        access_token: token
      }
    });
    
    console.log("Token Debug Info:", JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error("Token Debug failed:", error.response?.data || error.message);
  }
}

main();
