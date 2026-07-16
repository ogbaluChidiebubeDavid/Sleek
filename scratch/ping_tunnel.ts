import axios from "axios";

async function main() {
  try {
    const res = await axios.get("https://dd4e4ab081f86c.lhr.life", { timeout: 3000 });
    console.log("Status:", res.status);
  } catch (err: any) {
    console.error("Error pinging tunnel:", err.message);
  }
}

main();
