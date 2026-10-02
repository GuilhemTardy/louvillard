import { NextResponse, type NextRequest } from "next/server";
import { parseEventInput, requireAdmin } from "@/lib/admin";
import { saveEvent } from "@/lib/events";
import { storageWritable } from "@/lib/storage";
import type { EventRecord } from "@/lib/types";

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!storageWritable) {
    return NextResponse.json({ error: "Stockage non configuré : ajoutez Vercel Blob au projet." }, { status: 503 });
  }
  const parsed = await parseEventInput(await req.json().catch(() => ({})), null);
  if (typeof parsed === "string") return NextResponse.json({ error: parsed }, { status: 400 });
  const now = new Date().toISOString();
  const event: EventRecord = { ...parsed, slug: parsed.slug!, coverId: null, photos: [], createdAt: now, updatedAt: now };
  await saveEvent(event);
  return NextResponse.json({ slug: event.slug });
}
