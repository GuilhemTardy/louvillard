import { type NextRequest } from "next/server";
import { getEvent, PHOTO_ID_RE, photoKey } from "@/lib/events";
import { hasAccess, isAdmin } from "@/lib/access";
import { openFile } from "@/lib/storage";

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

  const file = await openFile(photoKey(slug, id, variant));
  if (!file) return new Response("Not found", { status: 404 });
  if (file.etag && req.headers.get("if-none-match") === file.etag) {
    await file.stream.cancel();
    return new Response(null, { status: 304, headers: { ETag: file.etag } });
  }
  return new Response(file.stream, {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": isCover ? "public, max-age=3600, stale-while-revalidate=86400" : "private, max-age=86400",
      "X-Content-Type-Options": "nosniff",
      ...(file.etag ? { ETag: file.etag } : {}),
      ...(file.size ? { "Content-Length": String(file.size) } : {}),
    },
  });
}
