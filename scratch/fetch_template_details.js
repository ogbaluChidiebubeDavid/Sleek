const axios = require("axios");

const token = "EAAV7tl3CmwkBR4NwjTtUHGypsQDVHjZC4bxx13XvHcOmByMLQqtSdz8pZCcMZBpgJDfb99ZABOGgBoU8x84BGqYf4IrrzFTOa38TYsPBLbUZBQIeZACouNyFkvY4Shp9OllxeZCikl5hZB50eoqWEhEcixhlfCpcOlZCfFctiTcHER8s4Mz5m71aAZCp88xsMb4r8WEwZDZD";
const wabaId = "1650336676063669";

async function main() {
  try {
    console.log(`Querying Meta template configurations for WABA: ${wabaId}...`);
    const res = await axios.get(`https://graph.facebook.com/v21.0/${wabaId}/message_templates`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const templates = res.data.data || [];
    console.log(`Found ${templates.length} templates.`);
    
    const targets = ["open_catalogue", "open_catalog", "secure_checkout"];
    targets.forEach(name => {
      const match = templates.find(t => t.name === name);
      if (match) {
        console.log(`\n=================== TEMPLATE: ${name} ===================`);
        console.log(JSON.stringify(match, null, 2));
      } else {
        console.log(`\nTemplate "${name}" not found in fetched list.`);
      }
    });
  } catch (error) {
    console.error("Fetch templates failed:", error.response?.data || error.message);
  }
}

main();
