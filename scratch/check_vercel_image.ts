import axios from "axios";

async function main() {
  try {
    const res = await axios.get("https://sleek-brown.vercel.app/footwear-suede.jpg", { timeout: 5000 });
    console.log("Status of Vercel image:", res.status);
    console.log("Content-Type:", res.headers["content-type"]);
  } catch (err: any) {
    console.error("Error fetching Vercel image:", err.message);
  }
}

main();
