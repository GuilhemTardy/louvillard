import "server-only";
import { deletePrefix, listJsonKeys, readJson, writeFileKey } from "./storage";
import type { EventRecord, GalleryEvent, PublicEvent } from "./types";

const EVENTS_PREFIX = "events/";
const CACHE_TTL = 15_000;

type Cached = { at: number; value: EventRecord | null };
const cache = new Map<string, Cached>();
let listCache: { at: number; value: EventRecord[] } | null = null;

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const PHOTO_ID_RE = /^[a-z0-9]{4,32}$/;

const showDemo = process.env.SHOW_DEMO_EVENTS !== "false";

export function normalizeCode(code: string) {
  return code.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/gi, "").toUpperCase();
}

export async function getEvent(slug: string, { fresh = false } = {}): Promise<EventRecord | null> {
  if (!SLUG_RE.test(slug)) return null;
  const hit = cache.get(slug);
  if (!fresh && hit && Date.now() - hit.at < CACHE_TTL) return hit.value;
  let value = await readJson<EventRecord>(`${EVENTS_PREFIX}${slug}.json`, fresh);
  if (value?.demo && !showDemo) value = null;
  cache.set(slug, { at: Date.now(), value });
  return value;
}

export async function listEvents({ fresh = false } = {}): Promise<EventRecord[]> {
  if (!fresh && listCache && Date.now() - listCache.at < CACHE_TTL) return listCache.value;
  const keys = await listJsonKeys(EVENTS_PREFIX);
  const events = (
    await Promise.all(keys.map(({ key }) => readJson<EventRecord>(key, fresh)))
  ).filter((e): e is EventRecord => Boolean(e) && (showDemo || !e!.demo));
  events.sort((a, b) => b.date.localeCompare(a.date));
  listCache = { at: Date.now(), value: events };
  for (const e of events) cache.set(e.slug, { at: Date.now(), value: e });
  return events;
}

export async function saveEvent(event: EventRecord) {
  event.updatedAt = new Date().toISOString();
  await writeFileKey(`${EVENTS_PREFIX}${event.slug}.json`, JSON.stringify(event, null, 2), "application/json");
  cache.set(event.slug, { at: Date.now(), value: event });
  listCache = null;
}

export async function removeEvent(slug: string) {
  await deletePrefix(`photos/${slug}/`);
  await deletePrefix(`${EVENTS_PREFIX}${slug}.json`);
  cache.delete(slug);
  listCache = null;
}

/** Recherche l'événement correspondant à un code saisi. */
export async function findEventByCode(code: string): Promise<EventRecord | null> {
  const wanted = normalizeCode(code);
  if (wanted.length < 3) return null;
  const events = await listEvents();
  return events.find((e) => e.accessCodes.some((c) => normalizeCode(c) === wanted)) ?? null;
}

export function toPublicEvent(event: EventRecord): PublicEvent {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { accessCodes, photos, demo, ...rest } = event;
  return { ...rest, demo: Boolean(demo), photoCount: photos.length };
}

export function toGalleryEvent(event: EventRecord): GalleryEvent {
  return {
    ...toPublicEvent(event),
    photos: event.photos.map((p) => ({
      id: p.id,
      width: p.width,
      height: p.height,
      takenAt: p.takenAt ?? null,
      bibs: p.bibs,
      tags: p.tags,
    })),
  };
}

export function photoKey(slug: string, photoId: string, variant: "thumb" | "large") {
  return `photos/${slug}/${photoId}/${variant}.jpg`;
}
