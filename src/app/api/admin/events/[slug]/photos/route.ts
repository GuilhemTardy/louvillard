import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getEvent, PHOTO_ID_RE, saveEvent } from "@/lib/events";
import { deletePrefix } from "@/lib/storage";
import type { EventRecord, Photo } from "@/lib/types";

type Ctx = RouteContext<"/api/admin/events/[slug]/photos">;

const cleanList = (v: unknown, max = 20) =>
  Array.isArray(v)
    ? [...new Set(v.map((x) => String(x).trim().slice(0, 60)).filter(Boolean))].slice(0, max)
    : [];

const cleanBibs = (v: unknown) => cleanList(v, 30).map((b) => b.replace(/\D/g, "").replace(/^0+(?=\d)/, "")).filter(Boolean);

function sortPhotos(photos: Photo[]) {
  return photos.sort((a, b) => {
    if (a.takenAt && b.takenAt && a.takenAt !== b.takenAt) return a.takenAt.localeCompare(b.takenAt);
    return a.filename.localeCompare(b.filename, "fr", { numeric: true });
  });
}

async function load(ctx: Ctx): Promise<EventRecord | NextResponse> {
  const { slug } = await ctx.params;
  const event = await getEvent(slug, { fresh: true });
  return event ?? NextResponse.json({ error: "Événement introuvable." }, { status: 404 });
}

/** Ajoute à l'événement les photos traitées. */
export async function POST(req: NextRequest, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const event = await load(ctx);
  if (event instanceof NextResponse) return event;
  const { photos } = (await req.json().catch(() => ({}))) as { photos?: Photo[] };
  if (!Array.isArray(photos)) return NextResponse.json({ error: "Aucune photo." }, { status: 400 });

  const existing = new Set(event.photos.map((p) => p.id));
  const fresh: Photo[] = photos
    .filter((p) => PHOTO_ID_RE.test(p.id) && !existing.has(p.id) && p.originalKey?.startsWith(`photos/${event.slug}/${p.id}/`))
    .map((p) => ({
      id: p.id,
      filename: String(p.filename).slice(0, 200),
      width: Number(p.width) || 0,
      height: Number(p.height) || 0,
      takenAt: typeof p.takenAt === "string" ? p.takenAt : null,
      bibs: cleanBibs(p.bibs),
      tags: cleanList(p.tags),
      originalKey: p.originalKey,
    }));
  event.photos = sortPhotos([...event.photos, ...fresh]);
  event.coverId ??= event.photos[0]?.id ?? null;
  await saveEvent(event);
  return NextResponse.json({ added: fresh.length, total: event.photos.length });
}

/** Modifie dossards, tags et couverture. */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const event = await load(ctx);
  if (event instanceof NextResponse) return event;
  const body = (await req.json().catch(() => ({}))) as {
    ids?: string[];
    addTags?: string[];
    removeTags?: string[];
    updates?: Record<string, { bibs?: string[]; tags?: string[] }>;
    coverId?: string;
  };
  const ids = new Set(cleanList(body.ids, 5000));
  const add = cleanList(body.addTags);
  const remove = new Set(cleanList(body.removeTags));
  for (const photo of event.photos) {
    if (ids.has(photo.id)) {
      photo.tags = [...new Set([...photo.tags.filter((t) => !remove.has(t)), ...add])];
    }
    const update = body.updates?.[photo.id];
    if (update?.bibs) photo.bibs = cleanBibs(update.bibs);
    if (update?.tags) photo.tags = cleanList(update.tags);
  }
  if (body.coverId && event.photos.some((p) => p.id === body.coverId)) event.coverId = body.coverId;
  await saveEvent(event);
  return NextResponse.json({ ok: true });
}

/** Supprime des photos (fichiers compris). */
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const event = await load(ctx);
  if (event instanceof NextResponse) return event;
  const { ids } = (await req.json().catch(() => ({}))) as { ids?: string[] };
  const remove = new Set(cleanList(ids, 5000).filter((id) => PHOTO_ID_RE.test(id)));
  event.photos = event.photos.filter((p) => !remove.has(p.id));
  if (event.coverId && remove.has(event.coverId)) event.coverId = event.photos[0]?.id ?? null;
  await saveEvent(event);
  // Les fichiers de démo (seed/) sont en lecture seule : seul le stockage principal est nettoyé.
  await Promise.all([...remove].map((id) => deletePrefix(`photos/${event.slug}/${id}/`)));
  return NextResponse.json({ ok: true, total: event.photos.length });
}
