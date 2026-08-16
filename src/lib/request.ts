import { NextRequest } from "next/server";

/**
 * Derives the public base URL from the incoming request so generated
 * links (checkout URLs, payment callbacks) always match the domain the
 * user actually hit — works on previews, production, and custom domains
 * without relying on NEXT_PUBLIC_APP_URL being set.
 */
export function getBaseUrl(req: NextRequest): string {
  const host =
    req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (host) {
    const proto =
      req.headers.get("x-forwarded-proto") ||
      (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return (
    process.env.NEXT_PUBLIC_APP_URL || "https://sleek-brown.vercel.app"
  );
}
