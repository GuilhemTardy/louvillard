import { NextResponse, type NextRequest } from "next/server";
import { findEventByCode, getEvent, normalizeCode } from "@/lib/events";
import { grantAccess, revokeAccess } from "@/lib/access";
import { rateLimit } from "@/lib/rate-limit";
import { safeEqual } from "@/lib/signing";

/** Déverrouille une galerie avec un code (avec ou sans événement précisé). */
export async function POST(req: NextRequest) {
  const limit = await rateLimit("access", 10, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Trop de tentatives. Réessayez dans ${Math.ceil(limit.retryAfter / 60)} min.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }
  const body = (await req.json().catch(() => ({}))) as { code?: unknown; slug?: unknown };
  const code = typeof body.code === "string" ? normalizeCode(body.code) : "";
  const slug = typeof body.slug === "string" ? body.slug : null;
  // Délai constant pour décourager le test à la chaîne.
  await new Promise((r) => setTimeout(r, 350));

  let event = null;
  if (code.length >= 3) {
    if (slug) {
      const candidate = await getEvent(slug);
      if (candidate?.accessCodes.some((c) => safeEqual(normalizeCode(c), code))) event = candidate;
    } else {
      event = await findEventByCode(code);
    }
  }
  if (!event) return NextResponse.json({ error: "Code incorrect. Vérifiez-le et réessayez." }, { status: 401 });

  await grantAccess(event.slug);
  return NextResponse.json({ slug: event.slug, url: `/evenements/${event.slug}` });
}

/** Referme une galerie sur cet appareil. */
export async function DELETE(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (slug) await revokeAccess(slug);
  return NextResponse.json({ ok: true });
}
