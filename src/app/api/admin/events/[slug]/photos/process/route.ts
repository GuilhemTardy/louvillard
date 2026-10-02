import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getEvent, PHOTO_ID_RE, photoKey } from "@/lib/events";
import { bibsFromFilename, processPhoto } from "@/lib/images";
import { readBuffer, usingBlob, writeFileKey } from "@/lib/storage";
import type { Photo } from "@/lib/types";

export const maxDuration = 120;

const EXT_RE = /\.(jpe?g|png|webp|tiff?)$/i;

/**
 * Traite un original : génère les aperçus filigranés et renvoie la fiche photo.
 *  - en local : reçoit le fichier en multipart ;
 *  - avec Vercel Blob : reçoit `{ id, pathname, filename }` après l'envoi direct.
 * La fiche n'est ajoutée à l'événement qu'au moment du « commit » (POST ../photos).
 */
export async function POST(req: NextRequest, ctx: RouteContext<"/api/admin/events/[slug]/photos/process">) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { slug } = await ctx.params;
  if (!(await getEvent(slug, { fresh: true }))) {
    return NextResponse.json({ error: "Événement introuvable." }, { status: 404 });
  }

  let id: string;
  let filename: string;
  let originalKey: string;
  let buffer: Buffer | null;

  if (req.headers.get("content-type")?.includes("multipart/form-data")) {
    if (usingBlob) return NextResponse.json({ error: "Envoyez via Vercel Blob." }, { status: 400 });
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
    filename = file.name.slice(0, 200);
    const ext = (filename.match(EXT_RE)?.[1] ?? "jpg").toLowerCase();
    id = randomBytes(6).toString("hex");
    originalKey = `photos/${slug}/${id}/original.${ext}`;
    buffer = Buffer.from(await file.arrayBuffer());
    await writeFileKey(originalKey, buffer);
  } else {
    const body = (await req.json().catch(() => ({}))) as { id?: string; pathname?: string; filename?: string };
    id = String(body.id ?? "");
    filename = String(body.filename ?? "photo.jpg").slice(0, 200);
    originalKey = String(body.pathname ?? "");
    if (!PHOTO_ID_RE.test(id) || !originalKey.startsWith(`photos/${slug}/${id}/original.`) || !EXT_RE.test(originalKey)) {
      return NextResponse.json({ error: "Référence de fichier invalide." }, { status: 400 });
    }
    buffer = await readBuffer(originalKey);
    if (!buffer) return NextResponse.json({ error: "Fichier introuvable dans le stockage." }, { status: 404 });
  }

  try {
    const processed = await processPhoto(buffer);
    await Promise.all([
      writeFileKey(photoKey(slug, id, "thumb"), processed.thumb, "image/jpeg"),
      writeFileKey(photoKey(slug, id, "large"), processed.large, "image/jpeg"),
    ]);
    const photo: Photo = {
      id,
      filename,
      width: processed.width,
      height: processed.height,
      takenAt: processed.takenAt,
      bibs: bibsFromFilename(filename),
      tags: [],
      originalKey,
    };
    return NextResponse.json({ photo });
  } catch (error) {
    console.error("[process]", error);
    return NextResponse.json({ error: "Image illisible ou format non pris en charge." }, { status: 422 });
  }
}
