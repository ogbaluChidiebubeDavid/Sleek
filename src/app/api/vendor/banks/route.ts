import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Curated list of popular Nigerian commercial & fintech banks for fallback
const POPULAR_NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Guaranty Trust Bank (GTBank)", code: "058" },
  { name: "Zenith Bank", code: "057" },
  { name: "United Bank For Africa (UBA)", code: "033" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "OPay Digital Services (Paycom)", code: "999992" },
  { name: "PalmPay", code: "999991" },
  { name: "Kuda Bank", code: "50211" },
  { name: "Moniepoint MFB", code: "50515" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Sterling Bank", code: "232" },
  { name: "Fidelity Bank", code: "070" },
  { name: "Union Bank of Nigeria", code: "032" },
  { name: "Wema Bank", code: "035" },
  { name: "FCMB (First City Monument Bank)", code: "214" },
  { name: "Polaris Bank", code: "076" },
  { name: "Ecobank Nigeria", code: "050" },
  { name: "Heritage Bank", code: "030" },
  { name: "Keystone Bank", code: "082" },
  { name: "Jaiz Bank", code: "301" },
  { name: "Taj Bank", code: "302" },
  { name: "VFD Microfinance Bank", code: "566" },
  { name: "Rubies MFB", code: "125" },
  { name: "Providus Bank", code: "101" },
];

let cachedBanks: { name: string; code: string }[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

export async function GET(_req: NextRequest) {
  const now = Date.now();
  if (cachedBanks && now - lastFetchTime < CACHE_TTL_MS) {
    return NextResponse.json({ success: true, banks: cachedBanks });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ success: true, banks: POPULAR_NIGERIAN_BANKS });
  }

  try {
    const res = await axios.get("https://api.paystack.co/bank?country=nigeria&currency=NGN&perPage=100", {
      headers: { Authorization: `Bearer ${secret}` },
      timeout: 6000,
    });

    if (res.data?.status && Array.isArray(res.data?.data)) {
      const formatted = res.data.data.map((b: any) => ({
        name: b.name,
        code: b.code,
      }));
      cachedBanks = formatted;
      lastFetchTime = now;
      return NextResponse.json({ success: true, banks: formatted });
    }
  } catch (error) {
    console.warn("[Banks API] Paystack bank list fetch failed, using fallback list:", error);
  }

  return NextResponse.json({ success: true, banks: POPULAR_NIGERIAN_BANKS });
}
