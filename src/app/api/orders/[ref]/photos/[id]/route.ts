import { type NextRequest } from "next/server";
import sharp from "sharp";
import { resolveOrder } from "@/lib/orders";
import { openFile, readBuffer } from "@/lib/storage";

/** Téléchargement d'un original HD acheté (ou de sa miniature avec ?preview=1). */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/orders/[ref]/photos/[id]">) {
  const { ref, id } = await ctx.params;
  const { event, photos } = await resolveOrder(ref);
  const photo = photos.find((p) => p.id === id);
  if (!event || !photo) return new Response("Lien invalide ou expiré.", { status: 404 });

  // Miniature sans filigrane, générée à la volée depuis l'original acheté.
  if (req.nextUrl.searchParams.has("preview")) {
    const original = await readBuffer(photo.originalKey);
    if (!original) return new Response("Fichier introuvable.", { status: 404 });
    const preview = await sharp(original, { failOn: "none" })
      .rotate()
      .resize({ width: 640, height: 640, fit: "inside" })
      .jpeg({ quality: 72, mozjpeg: true })
      .toBuffer();
    return new Response(new Uint8Array(preview), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=86400" },
    });
  }

  const file = await openFile(photo.originalKey);
  if (!file) return new Response("Fichier introuvable.", { status: 404 });

  const ext = photo.originalKey.split(".").pop() ?? "jpg";
  const filename = `lou-villard-${event.slug}-${photo.id}.${ext}`;
  return new Response(file.stream, {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": `attachment; filename="${filename}"`,
      ...(file.size ? { "Content-Length": String(file.size) } : {}),
    },
  });
}
