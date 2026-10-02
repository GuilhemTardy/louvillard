import { NextResponse, type NextRequest } from "next/server";
import { getEvent } from "@/lib/events";
import { hasAccess } from "@/lib/access";
import { createCheckout } from "@/lib/orders";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limit = await rateLimit("checkout", 20, 10 * 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Trop de tentatives, patientez un instant." }, { status: 429 });

  const body = (await req.json().catch(() => ({}))) as { slug?: unknown; photoIds?: unknown; email?: unknown };
  const slug = typeof body.slug === "string" ? body.slug : "";
  const photoIds = Array.isArray(body.photoIds) ? body.photoIds.filter((x): x is string => typeof x === "string") : [];
  const email =
    typeof body.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) ? body.email.trim() : null;

  const event = await getEvent(slug);
  if (!event) return NextResponse.json({ error: "Événement introuvable." }, { status: 404 });
  if (!(await hasAccess(slug))) return NextResponse.json({ error: "Code d'accès requis." }, { status: 403 });

  try {
    const url = await createCheckout({ event, photoIds: photoIds.slice(0, 2000), email, origin: req.nextUrl.origin });
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[checkout]", error);
    const message = error instanceof Error ? error.message : "Paiement indisponible.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
