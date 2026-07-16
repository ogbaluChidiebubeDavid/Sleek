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
  const wabaId = "1650336676063669"; // From webhook logs

  if (!token) {
    console.error("Missing token in env");
    return;
  }

  try {
    console.log("Fetching message templates for WABA ID:", wabaId);
    const templatesRes = await axios.get(`https://graph.facebook.com/v21.0/${wabaId}/message_templates`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Templates found:", templatesRes.data.data.length);
    for (const t of templatesRes.data.data) {
      console.log(`- Name: ${t.name}, Language: ${t.language}, Status: ${t.status}, Category: ${t.category}`);
      if (t.components) {
        console.log("  Components:", JSON.stringify(t.components, null, 2));
      }
    }
  } catch (err: any) {
    console.error("Error:", err.response?.data || err.message);
  }
}

main();
