import "server-only";
import path from "node:path";
import { createReadStream } from "node:fs";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { del, get, list, put } from "@vercel/blob";

/**
 * Stockage clé → fichier.
 *  - Vercel Blob (privé) dès que BLOB_READ_WRITE_TOKEN est défini (production) ;
 *  - sinon le dossier local `.data/` (développement).
 * Le dossier `seed/` (démo, en lecture seule) sert de repli en lecture.
 */

const SEED_DIR = path.join(process.cwd(), "seed");
const LOCAL_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.STORAGE_DIR ?? path.join(process.cwd(), ".data"));

export const usingBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function safeKey(key: string) {
  if (!/^[a-z0-9][a-z0-9/_.-]*$/i.test(key) || key.includes("..")) {
    throw new Error(`Clé de stockage invalide : ${key}`);
  }
  return key;
}

async function fileExists(p: string) {
  try {
    return (await stat(/*turbopackIgnore: true*/ p)).isFile();
  } catch {
    return false;
  }
}

export type StoredFile = {
  stream: ReadableStream<Uint8Array>;
  size: number | null;
  contentType: string;
  etag?: string;
};

function contentTypeFor(key: string) {
  if (key.endsWith(".json")) return "application/json";
  if (key.endsWith(".png")) return "image/png";
  if (key.endsWith(".webp")) return "image/webp";
  if (/\.(tiff?)$/i.test(key)) return "image/tiff";
  return "image/jpeg";
}

async function openLocal(file: string, key: string): Promise<StoredFile | null> {
  if (!(await fileExists(file))) return null;
  const { size, mtimeMs } = await stat(/*turbopackIgnore: true*/ file);
  return {
    stream: Readable.toWeb(createReadStream(/*turbopackIgnore: true*/ file)) as ReadableStream<Uint8Array>,
    size,
    contentType: contentTypeFor(key),
    etag: `"${size.toString(36)}-${Math.round(mtimeMs).toString(36)}"`,
  };
}

/** Ouvre un fichier en flux (pour le servir sans le charger en mémoire). */
/** Photos de démonstration hébergées en ligne (Unsplash). */
const REMOTE_RE = /^https:\/\/images\.unsplash\.com\//;

export const isRemoteKey = (key: string) => REMOTE_RE.test(key);

async function openRemote(url: string): Promise<StoredFile | null> {
  const res = await fetch(url, { cache: "force-cache" }).catch(() => null);
  if (!res?.ok || !res.body) return null;
  const size = Number(res.headers.get("content-length"));
  return {
    stream: res.body,
    size: Number.isFinite(size) && size > 0 ? size : null,
    contentType: res.headers.get("content-type") ?? "image/jpeg",
  };
}

export async function openFile(key: string): Promise<StoredFile | null> {
  if (isRemoteKey(key)) return openRemote(key);
  safeKey(key);
  if (usingBlob) {
    const result = await get(key, { access: "private" }).catch(() => null);
    if (result?.statusCode === 200) {
      return { stream: result.stream, size: result.blob.size, contentType: result.blob.contentType, etag: result.blob.etag };
    }
  } else {
    const local = await openLocal(path.join(LOCAL_DIR, key), key);
    if (local) return local;
  }
  return openLocal(path.join(SEED_DIR, key), key);
}

export async function readBuffer(key: string): Promise<Buffer | null> {
  const file = await openFile(key);
  if (!file) return null;
  return Buffer.from(await new Response(file.stream).arrayBuffer());
}

export async function readJson<T>(key: string, fresh = false): Promise<T | null> {
  safeKey(key);
  if (usingBlob) {
    const result = await get(key, { access: "private", useCache: !fresh }).catch(() => null);
    if (result?.statusCode === 200) return (await new Response(result.stream).json()) as T;
  } else {
    try {
      return JSON.parse(await readFile(/*turbopackIgnore: true*/ path.join(LOCAL_DIR, key), "utf8")) as T;
    } catch {
      // absent localement
    }
  }
  try {
    return JSON.parse(await readFile(/*turbopackIgnore: true*/ path.join(SEED_DIR, key), "utf8")) as T;
  } catch {
    return null;
  }
}

export async function writeFileKey(key: string, data: Buffer | string, contentType = contentTypeFor(key)) {
  safeKey(key);
  if (usingBlob) {
    await put(key, data, { access: "private", contentType, addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 });
    return;
  }
  const file = path.join(LOCAL_DIR, key);
  await mkdir(/*turbopackIgnore: true*/ path.dirname(file), { recursive: true });
  await writeFile(/*turbopackIgnore: true*/ file, data);
}

/** Supprime toutes les clés sous un préfixe (stockage principal uniquement). */
export async function deletePrefix(prefix: string) {
  safeKey(prefix);
  if (usingBlob) {
    let cursor: string | undefined;
    do {
      const page = await list({ prefix, cursor, limit: 1000 });
      if (page.blobs.length) await del(page.blobs.map((b) => b.url));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return;
  }
  await rm(/*turbopackIgnore: true*/ path.join(LOCAL_DIR, prefix), { recursive: true, force: true });
}

export async function deleteKeys(keys: string[]) {
  if (!keys.length) return;
  keys.forEach(safeKey);
  if (usingBlob) {
    await del(keys);
    return;
  }
  await Promise.all(keys.map((k) => rm(/*turbopackIgnore: true*/ path.join(LOCAL_DIR, k), { force: true })));
}

/** Liste les clés JSON d'un dossier, stockage principal + démo. */
export async function listJsonKeys(prefix: string): Promise<{ key: string; seed: boolean }[]> {
  safeKey(prefix);
  const found = new Map<string, boolean>();
  try {
    for (const name of await readdir(/*turbopackIgnore: true*/ path.join(SEED_DIR, prefix))) {
      if (name.endsWith(".json")) found.set(`${prefix}${name}`, true);
    }
  } catch {
    // pas de démo
  }
  if (usingBlob) {
    let cursor: string | undefined;
    do {
      const page = await list({ prefix, cursor, limit: 1000 });
      for (const b of page.blobs) if (b.pathname.endsWith(".json")) found.set(b.pathname, false);
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  } else {
    try {
      for (const name of await readdir(/*turbopackIgnore: true*/ path.join(LOCAL_DIR, prefix))) {
        if (name.endsWith(".json")) found.set(`${prefix}${name}`, false);
      }
    } catch {
      // dossier pas encore créé
    }
  }
  return [...found].map(([key, seed]) => ({ key, seed }));
}

/** En production sans Blob, le système de fichiers est en lecture seule. */
export const storageWritable = usingBlob || process.env.VERCEL !== "1";

/** Extension du fichier original (jpg pour les photos distantes). */
export const extOf = (key: string) => (isRemoteKey(key) ? "jpg" : (key.split(".").pop() ?? "jpg").toLowerCase());
