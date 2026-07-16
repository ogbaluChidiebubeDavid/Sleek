const axios = require("axios");

const token = "EAAV7tl3CmwkBR4NwjTtUHGypsQDVHjZC4bxx13XvHcOmByMLQqtSdz8pZCcMZBpgJDfb99ZABOGgBoU8x84BGqYf4IrrzFTOa38TYsPBLbUZBQIeZACouNyFkvY4Shp9OllxeZCikl5hZB50eoqWEhEcixhlfCpcOlZCfFctiTcHER8s4Mz5m71aAZCp88xsMb4r8WEwZDZD";

async function main() {
  try {
    console.log("Querying /me/whatsapp_business_accounts...");
    const accountsRes = await axios.get(`https://graph.facebook.com/v21.0/me/whatsapp_business_accounts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("WABA accounts list:", JSON.stringify(accountsRes.data, null, 2));
    
    const wabaId = accountsRes.data.data?.[0]?.id;
    if (wabaId) {
      console.log(`\nQuerying phone numbers for WABA ID: ${wabaId}...`);
      const phonesRes = await axios.get(`https://graph.facebook.com/v21.0/${wabaId}/phone_numbers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Registered Phone Numbers details:", JSON.stringify(phonesRes.data, null, 2));
    }
  } catch (error) {
    console.error("Meta API query failed:", error.response?.data || error.message);
  }
}

main();
