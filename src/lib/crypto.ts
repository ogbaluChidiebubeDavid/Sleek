import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

// derive a key from env or a fallback passphrase
const SECRET_KEY = process.env.ENCRYPTION_KEY 
  ? crypto.createHash("sha256").update(process.env.ENCRYPTION_KEY).digest()
  : crypto.createHash("sha256").update("sleek-footwear-secret-key-2026").digest();

const IV_LENGTH = 16;

export function encryptPhone(phone: string): string {
  if (!phone) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(phone, "utf8", "hex");
  encrypted += cipher.final("hex");
  // Combine IV and encrypted string with delimiter
  const combined = iv.toString("hex") + ":" + encrypted;
  // Convert to URL-safe Base64 representation
  return Buffer.from(combined).toString("base64url");
}

export function decryptPhone(token: string): string {
  if (!token) return "";
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [ivHex, encryptedHex] = decoded.split(":");
    if (!ivHex || !encryptedHex) return "";
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("[Decryption Error]: Failed to decrypt phone token", err);
    return "";
  }
}
