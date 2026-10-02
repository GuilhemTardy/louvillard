import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

let warned = false;

function secret() {
  const value = process.env.APP_SECRET;
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production") {
    throw new Error("APP_SECRET manquant (32 caractères minimum).");
  }
  if (!warned) {
    console.warn("[louvillard] APP_SECRET absent : clé de développement utilisée.");
    warned = true;
  }
  return "dev-only-secret-change-me-dev-only-secret-change-me";
}

const b64 = (input: string | Buffer) => Buffer.from(input).toString("base64url");

function hmac(data: string) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Jeton signé `payload.signature` (payload JSON en base64url). */
export function sign<T extends object>(payload: T, purpose: string) {
  const body = b64(JSON.stringify(payload));
  return `${body}.${hmac(`${purpose}:${body}`)}`;
}

export function verify<T>(token: string | undefined | null, purpose: string): T | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig || !safeEqual(sig, hmac(`${purpose}:${body}`))) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T & { exp?: number };
    if (typeof data.exp === "number" && data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}
