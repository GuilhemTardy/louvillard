import "server-only";
import { cookies } from "next/headers";
import { safeEqual, sign, verify } from "./signing";

const ACCESS_COOKIE = "lv_access";
const ADMIN_COOKIE = "lv_admin";
const ACCESS_DAYS = 60;
const ADMIN_HOURS = 12;

type AccessPayload = { slugs: string[]; exp: number };

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function unlockedSlugs(): Promise<string[]> {
  const store = await cookies();
  return verify<AccessPayload>(store.get(ACCESS_COOKIE)?.value, "access")?.slugs ?? [];
}

export async function hasAccess(slug: string) {
  return (await unlockedSlugs()).includes(slug);
}

export async function grantAccess(slug: string) {
  const store = await cookies();
  const slugs = [slug, ...(await unlockedSlugs()).filter((s) => s !== slug)].slice(0, 20);
  const exp = Date.now() + ACCESS_DAYS * 86_400_000;
  store.set(ACCESS_COOKIE, sign<AccessPayload>({ slugs, exp }, "access"), {
    ...cookieBase,
    maxAge: ACCESS_DAYS * 86_400,
  });
}

export async function revokeAccess(slug: string) {
  const store = await cookies();
  const slugs = (await unlockedSlugs()).filter((s) => s !== slug);
  const exp = Date.now() + ACCESS_DAYS * 86_400_000;
  store.set(ACCESS_COOKIE, sign<AccessPayload>({ slugs, exp }, "access"), { ...cookieBase, maxAge: ACCESS_DAYS * 86_400 });
}

// ------------------------------------------------------------------ admin

export const adminConfigured = Boolean(process.env.ADMIN_PASSWORD);

export function checkAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(password, expected);
}

export async function isAdmin() {
  const store = await cookies();
  return Boolean(verify<{ exp: number }>(store.get(ADMIN_COOKIE)?.value, "admin"));
}

export async function startAdminSession() {
  const store = await cookies();
  store.set(ADMIN_COOKIE, sign({ exp: Date.now() + ADMIN_HOURS * 3_600_000 }, "admin"), {
    ...cookieBase,
    sameSite: "strict",
    maxAge: ADMIN_HOURS * 3600,
  });
}

export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}
