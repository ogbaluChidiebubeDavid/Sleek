import crypto from "node:crypto";
import { prisma } from "@/lib/db";

// Whole-number floats (1.0) -> integers (1), recursively. Matches Didit's server canonicalisation.
function shortenFloats(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(shortenFloats);
  if (v && typeof v === "object") {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, shortenFloats(x)]),
    );
  }
  if (typeof v === "number" && !Number.isInteger(v) && v % 1 === 0) return Math.trunc(v);
  return v;
}

// Recursive lexicographic key sort (array order preserved).
function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object") {
    return Object.keys(v as object)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = sortKeys((v as Record<string, unknown>)[k]);
        return acc;
      }, {});
  }
  return v;
}

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-signature-v2") ?? "";
  const ts = Number(req.headers.get("x-timestamp"));

  // Log raw webhook
  try {
    await prisma.webhookLog.create({
      data: {
        payload: raw,
        headers: JSON.stringify(Object.fromEntries(req.headers.entries())),
      },
    });
  } catch (e) {}

  const secret = process.env.DIDIT_WEBHOOK_SECRET;

  // If secret is set, verify X-Signature-V2 HMAC
  if (secret) {
    // 1. Freshness — reject anything older/newer than 300s (replay protection).
    if (!ts || Math.abs(Date.now() / 1000 - ts) > 300) {
      console.warn("[Didit Webhook] Rejected: stale timestamp.");
      return new Response("stale", { status: 401 });
    }

    // 2. Canonicalise (shortenFloats -> sortKeys -> JSON.stringify with unescaped Unicode, the JS default).
    const parsed = JSON.parse(raw);
    const canonical = JSON.stringify(sortKeys(shortenFloats(parsed)));

    // 3. Constant-time HMAC-SHA256 compare against X-Signature-V2.
    const expected = crypto
      .createHmac("sha256", secret)
      .update(canonical, "utf8")
      .digest("hex");

    if (
      sig.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
    ) {
      console.warn("[Didit Webhook] Rejected: invalid signature.");
      return new Response("bad sig", { status: 401 });
    }
  }

  let parsedBody: any;
  try {
    parsedBody = JSON.parse(raw);
  } catch (e) {
    return new Response("bad json", { status: 400 });
  }

  const vendorId = parsedBody.vendor_data || parsedBody.session?.vendor_data;
  const status = parsedBody.status;

  if (vendorId) {
    switch (status) {
      case "Approved":
        await prisma.vendor.update({
          where: { id: vendorId },
          data: { kycStatus: "verified" },
        });
        console.log(`[Didit Webhook] Vendor ${vendorId} KYC Approved.`);
        break;
      case "Declined":
        await prisma.vendor.update({
          where: { id: vendorId },
          data: { kycStatus: "declined" },
        });
        console.log(`[Didit Webhook] Vendor ${vendorId} KYC Declined.`);
        break;
      case "In Review":
        await prisma.vendor.update({
          where: { id: vendorId },
          data: { kycStatus: "in_review" },
        });
        console.log(`[Didit Webhook] Vendor ${vendorId} KYC In Review.`);
        break;
      case "In Progress":
        await prisma.vendor.update({
          where: { id: vendorId },
          data: { kycStatus: "in_progress" },
        });
        break;
      case "Kyc Expired":
        await prisma.vendor.update({
          where: { id: vendorId },
          data: { kycStatus: "pending" },
        });
        break;
      default:
        break;
    }
  }

  return new Response("ok", { status: 200 });
}
