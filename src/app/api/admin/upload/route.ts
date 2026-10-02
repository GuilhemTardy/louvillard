import { NextResponse, type NextRequest } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAdmin } from "@/lib/access";

const ORIGINAL_RE = /^photos\/[a-z0-9-]+\/[a-z0-9]{4,32}\/original\.(jpe?g|png|webp|tiff?)$/;

/** Jetons d'envoi direct navigateur → Vercel Blob (contourne la limite de 4,5 Mo des fonctions). */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      request: req,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await isAdmin())) throw new Error("Session admin expirée.");
        if (!ORIGINAL_RE.test(pathname)) throw new Error("Chemin d'envoi invalide.");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/tiff"],
          maximumSizeInBytes: 80 * 1024 * 1024,
          addRandomSuffix: false,
          allowOverwrite: true,
        };
      },
      onUploadCompleted: async () => {
        // Le traitement est déclenché par l'admin juste après l'envoi.
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Envoi refusé." }, { status: 400 });
  }
}
