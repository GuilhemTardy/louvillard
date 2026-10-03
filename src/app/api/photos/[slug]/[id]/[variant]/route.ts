import { type NextRequest } from "next/server";
import { getEvent, PHOTO_ID_RE, photoKey } from "@/lib/events";
import { hasAccess, isAdmin } from "@/lib/access";
import { watermarkVariant } from "@/lib/images";
import { isRemoteKey, openFile, readBuffer } from "@/lib/storage";

/** Petit cache mémoire des aperçus générés à la volée (photos de démo distantes). */
const remoteCache = new Map<string, Buffer>();

async function remotePreview(originalKey: string, variant: "thumb" | "large") {
  const cacheKey = `${variant}:${originalKey}`;
  const hit = remoteCache.get(cacheKey);
  if (hit) return hit;
  const width = variant === "thumb" ? 900 : 2000;
  const source = await readBuffer(originalKey.replace(/([?&])w=\d+&h=\d+/, (_, p) => `${p}w=${width}`));
  if (!source) return null;
  const out = await watermarkVariant(source, variant);
  if (remoteCache.size > 300) remoteCache.delete(remoteCache.keys().next().value!);
  remoteCache.set(cacheKey, out);
  return out;
}

/** Aperçus filigranés : accessibles avec le code de l'événement (ou pour la couverture). */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/photos/[slug]/[id]/[variant]">) {
  const { slug, id, variant } = await ctx.params;
  if ((variant !== "thumb" && variant !== "large") || !PHOTO_ID_RE.test(id)) {
    return new Response("Not found", { status: 404 });
  }
  const event = await getEvent(slug);
  if (!event) return new Response("Not found", { status: 404 });
  const isCover = event.coverId === id;
  if (!isCover && !(await hasAccess(slug)) && !(await isAdmin())) {
    return new Response("Accès refusé", { status: 403 });
  }
  const cacheControl = isCover ? "public, max-age=3600, stale-while-revalidate=86400" : "private, max-age=86400";

  const photo = event.photos.find((p) => p.id === id);
  if (photo && isRemoteKey(photo.originalKey)) {
    const data = await remotePreview(photo.originalKey, variant);
    if (!data) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": cacheControl, "X-Content-Type-Options": "nosniff" },
    });
  }

  const file = await openFile(photoKey(slug, id, variant));
  if (!file) return new Response("Not found", { status: 404 });
  if (file.etag && req.headers.get("if-none-match") === file.etag) {
    await file.stream.cancel();
    return new Response(null, { status: 304, headers: { ETag: file.etag } });
  }
  return new Response(file.stream, {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": cacheControl,
      "X-Content-Type-Options": "nosniff",
      ...(file.etag ? { ETag: file.etag } : {}),
      ...(file.size ? { "Content-Length": String(file.size) } : {}),
    },
  });
}
