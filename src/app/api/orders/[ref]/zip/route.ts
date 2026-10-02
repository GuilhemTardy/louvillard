import { PassThrough, Readable } from "node:stream";
import archiver from "archiver";
import { resolveOrder } from "@/lib/orders";
import { openFile } from "@/lib/storage";

export const maxDuration = 300;

/** Archive ZIP (sans recompression) de toutes les photos d'une commande. */
export async function GET(_req: Request, ctx: RouteContext<"/api/orders/[ref]/zip">) {
  const { ref } = await ctx.params;
  const { event, photos } = await resolveOrder(ref);
  if (!event || !photos.length) return new Response("Lien invalide ou expiré.", { status: 404 });

  const archive = archiver("zip", { store: true });
  const output = new PassThrough();
  archive.on("error", (err: Error) => output.destroy(err));
  archive.pipe(output);

  (async () => {
    for (const photo of photos) {
      const file = await openFile(photo.originalKey);
      if (!file) continue;
      const ext = photo.originalKey.split(".").pop() ?? "jpg";
      const entry = Readable.fromWeb(file.stream as import("node:stream/web").ReadableStream);
      archive.append(entry, { name: `lou-villard-${event.slug}-${photo.id}.${ext}` });
      // Un fichier à la fois pour limiter la mémoire.
      await new Promise<void>((resolve, reject) => {
        archive.once("entry", () => resolve());
        archive.once("error", reject);
      });
    }
    await archive.finalize();
  })().catch((err) => output.destroy(err));

  return new Response(Readable.toWeb(output) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="lou-villard-${event.slug}.zip"`,
      "Cache-Control": "private, no-store",
    },
  });
}
