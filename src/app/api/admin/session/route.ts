import { NextResponse, type NextRequest } from "next/server";
import { adminConfigured, checkAdminPassword, endAdminSession, startAdminSession } from "@/lib/access";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limit = await rateLimit("admin-login", 6, 15 * 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  if (!adminConfigured) {
    return NextResponse.json({ error: "Définissez ADMIN_PASSWORD dans les variables d'environnement." }, { status: 503 });
  }
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  await new Promise((r) => setTimeout(r, 400));
  if (typeof password !== "string" || !checkAdminPassword(password)) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }
  await startAdminSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await endAdminSession();
  return NextResponse.json({ ok: true });
}
