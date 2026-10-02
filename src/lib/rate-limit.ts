import "server-only";
import { headers } from "next/headers";

/**
 * Limitation simple en mémoire (par instance). Suffisant pour freiner
 * le test de codes à la chaîne ; à remplacer par Upstash/KV si besoin.
 */
const buckets = new Map<string, { count: number; reset: number }>();

export async function clientIp() {
  const h = await headers();
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function rateLimit(scope: string, max: number, windowMs: number) {
  const key = `${scope}:${await clientIp()}`;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  bucket.count++;
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.reset < now) buckets.delete(k);
  }
  return bucket.count > max
    ? { ok: false, retryAfter: Math.ceil((bucket.reset - now) / 1000) }
    : { ok: true, retryAfter: 0 };
}
