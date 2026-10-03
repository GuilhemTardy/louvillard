import path from "node:path";
import { readFile } from "node:fs/promises";
import sharp, { type Sharp } from "sharp";
import exifr from "exifr";

/**
 * Traitement des photos : orientation EXIF, aperçus filigranés.
 * Aucun alias d'import ici : ce module est aussi utilisé par les scripts Node.
 */

export const VARIANTS = {
  thumb: { width: 720, quality: 70 },
  large: { width: 1800, quality: 78 },
} as const;

export type Variant = keyof typeof VARIANTS;

let watermarkTile: Buffer | null = null;

async function getWatermarkTile() {
  if (!watermarkTile) {
    watermarkTile = await readFile(path.join(process.cwd(), "assets", "watermark.png"));
  }
  return watermarkTile;
}

async function watermarked(base: Sharp, targetWidth: number, quality: number) {
  const resized = await base
    .resize({ width: targetWidth, height: targetWidth, fit: "inside", withoutEnlargement: true })
    .toBuffer({ resolveWithObject: true });
  const tileWidth = Math.max(220, Math.round(resized.info.width * 0.34));
  const tile = await sharp(await getWatermarkTile()).resize({ width: tileWidth }).png().toBuffer();
  return sharp(resized.data)
    .composite([{ input: tile, tile: true, blend: "over" }])
    .jpeg({ quality, mozjpeg: true, progressive: true })
    .toBuffer();
}

export type ProcessedPhoto = {
  width: number;
  height: number;
  takenAt: string | null;
  thumb: Buffer;
  large: Buffer;
};

export async function processPhoto(input: Buffer): Promise<ProcessedPhoto> {
  // `rotate()` sans argument applique l'orientation EXIF puis la supprime.
  const oriented = await sharp(input, { failOn: "none" }).rotate().toBuffer({ resolveWithObject: true });
  const { width, height } = oriented.info;

  let takenAt: string | null = null;
  try {
    const exif = await exifr.parse(input, ["DateTimeOriginal", "CreateDate"]);
    const date: unknown = exif?.DateTimeOriginal ?? exif?.CreateDate;
    if (date instanceof Date && !Number.isNaN(date.getTime())) takenAt = date.toISOString();
  } catch {
    // Pas d'EXIF : on garde null.
  }

  const [thumb, large] = await Promise.all([
    watermarked(sharp(oriented.data), VARIANTS.thumb.width, VARIANTS.thumb.quality),
    watermarked(sharp(oriented.data), VARIANTS.large.width, VARIANTS.large.quality),
  ]);

  return { width, height, takenAt, thumb, large };
}

/** Aperçu filigrané d'une seule taille (photos de démonstration distantes). */
export async function watermarkVariant(input: Buffer, variant: Variant) {
  const { width, quality } = VARIANTS[variant];
  return watermarked(sharp(input, { failOn: "none" }).rotate(), width, quality);
}

/** Dossards détectés dans un nom de fichier : « D123 », « #123 », « dossard-123 ». */
export function bibsFromFilename(filename: string): string[] {
  const base = filename.replace(/\.[a-z0-9]+$/i, "");
  const found = new Set<string>();
  for (const m of base.matchAll(/(?:^|[^a-z0-9])(?:d|#|dossard[-_ ]?)(\d{1,5})(?=$|[^0-9])/gi)) {
    found.add(String(Number(m[1])));
  }
  return [...found];
}
