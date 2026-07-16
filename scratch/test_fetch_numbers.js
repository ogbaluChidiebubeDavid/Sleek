const axios = require("axios");

const token = "EAAV7tl3CmwkBR4NwjTtUHGypsQDVHjZC4bxx13XvHcOmByMLQqtSdz8pZCcMZBpgJDfb99ZABOGgBoU8x84BGqYf4IrrzFTOa38TYsPBLbUZBQIeZACouNyFkvY4Shp9OllxeZCikl5hZB50eoqWEhEcixhlfCpcOlZCfFctiTcHER8s4Mz5m71aAZCp88xsMb4r8WEwZDZD";

const ids = ["1650336676063669", "1691148905642264"];

async function main() {
  for (const id of ids) {
    try {
      console.log(`\nQuerying phone numbers for ID: ${id}...`);
      const res = await axios.get(`https://graph.facebook.com/v21.0/${id}/phone_numbers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`Success for ${id}:`, JSON.stringify(res.data, null, 2));
    } catch (error) {
      console.error(`Failed for ${id}:`, error.response?.data || error.message);
    }
  }
}

main();
