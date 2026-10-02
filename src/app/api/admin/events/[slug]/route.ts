import { NextResponse, type NextRequest } from "next/server";
import { parseEventInput, requireAdmin } from "@/lib/admin";
import { getEvent, removeEvent, saveEvent } from "@/lib/events";

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/admin/events/[slug]">) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { slug } = await ctx.params;
  const event = await getEvent(slug, { fresh: true });
  if (!event) return NextResponse.json({ error: "Événement introuvable." }, { status: 404 });
  const parsed = await parseEventInput(await req.json().catch(() => ({})), slug);
  if (typeof parsed === "string") return NextResponse.json({ error: parsed }, { status: 400 });
  await saveEvent({ ...event, ...parsed, slug });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/admin/events/[slug]">) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { slug } = await ctx.params;
  const event = await getEvent(slug, { fresh: true });
  if (!event) return NextResponse.json({ error: "Événement introuvable." }, { status: 404 });
  if (event.demo) {
    return NextResponse.json(
      { error: "Les événements de démo se masquent avec SHOW_DEMO_EVENTS=false." },
      { status: 400 },
    );
  }
  await removeEvent(slug);
  return NextResponse.json({ ok: true });
}
