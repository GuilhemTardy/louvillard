"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Photo } from "@/lib/types";
import { IconClose, IconStar, IconTrash, IconUpload } from "../icons";

type Props = {
  slug: string;
  photos: Photo[];
  coverId: string | null;
  blob: boolean;
  search: "bib" | "tags";
};

type Job = { name: string; status: "waiting" | "uploading" | "processing" | "done" | "error"; error?: string };

const CONCURRENCY = 3;
const COMMIT_EVERY = 20;
const ACCEPT = /\.(jpe?g|png|webp|tiff?)$/i;

function randomId() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function json<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);
  return data;
}

export function PhotoManager({ slug, photos, coverId, blob, search }: Props) {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lastClicked, setLastClicked] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [tagInput, setTagInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [bibMode, setBibMode] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const tags = useMemo(() => [...new Set(photos.flatMap((p) => p.tags))], [photos]);
  const visible = useMemo(() => {
    if (filter === "nobib") return photos.filter((p) => !p.bibs.length);
    if (filter === "notag") return photos.filter((p) => !p.tags.length);
    if (filter.startsWith("tag:")) return photos.filter((p) => p.tags.includes(filter.slice(4)));
    return photos;
  }, [photos, filter]);

  // ------------------------------------------------------------ import

  const processFile = useCallback(
    async (file: File): Promise<Photo> => {
      if (!blob) {
        const form = new FormData();
        form.append("file", file);
        return (await json<{ photo: Photo }>(await fetch(`/api/admin/events/${slug}/photos/process`, { method: "POST", body: form }))).photo;
      }
      const id = randomId();
      const ext = (file.name.match(ACCEPT)?.[1] ?? "jpg").toLowerCase();
      const pathname = `photos/${slug}/${id}/original.${ext}`;
      await upload(pathname, file, {
        access: "private",
        handleUploadUrl: "/api/admin/upload",
        multipart: file.size > 15 * 1024 * 1024,
        contentType: file.type || "image/jpeg",
      });
      const res = await fetch(`/api/admin/events/${slug}/photos/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pathname, filename: file.name }),
      });
      return (await json<{ photo: Photo }>(res)).photo;
    },
    [blob, slug],
  );

  async function commit(batch: Photo[]) {
    if (!batch.length) return;
    await json(await fetch(`/api/admin/events/${slug}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photos: batch }),
    }));
  }

  async function importFiles(list: FileList | File[]) {
    const files = [...list].filter((f) => ACCEPT.test(f.name));
    if (!files.length) return;
    const offset = jobs.length;
    setJobs((j) => [...j, ...files.map((f) => ({ name: f.name, status: "waiting" as const }))]);
    const update = (i: number, patch: Partial<Job>) => setJobs((j) => j.map((job, k) => (k === offset + i ? { ...job, ...patch } : job)));

    let pendingCommit: Photo[] = [];
    let commitChain = Promise.resolve();
    const flush = () => {
      const batch = pendingCommit;
      pendingCommit = [];
      commitChain = commitChain.then(() => commit(batch));
      return commitChain;
    };

    let cursor = 0;
    async function worker() {
      while (cursor < files.length) {
        const i = cursor++;
        update(i, { status: blob ? "uploading" : "processing" });
        try {
          const photo = await processFile(files[i]);
          pendingCommit.push(photo);
          update(i, { status: "done" });
          if (pendingCommit.length >= COMMIT_EVERY) await flush();
        } catch (err) {
          update(i, { status: "error", error: err instanceof Error ? err.message : "Erreur" });
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, files.length) }, worker));
    try {
      await flush();
    } catch (err) {
      alert(`Enregistrement interrompu : ${err instanceof Error ? err.message : err}`);
    }
    router.refresh();
  }

  // ------------------------------------------------------------ actions

  async function patch(body: object) {
    setBusy(true);
    try {
      await json(await fetch(`/api/admin/events/${slug}/photos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }));
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function removeSelected() {
    if (!confirm(`Supprimer ${selected.size} photo(s) ? Cette action est définitive.`)) return;
    setBusy(true);
    try {
      await json(await fetch(`/api/admin/events/${slug}/photos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selected] }),
      }));
      setSelected(new Set());
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  function clickPhoto(index: number, e: React.MouseEvent) {
    const id = visible[index].id;
    setSelected((cur) => {
      const next = new Set(cur);
      if (e.shiftKey && lastClicked !== null) {
        const [a, b] = [Math.min(lastClicked, index), Math.max(lastClicked, index)];
        for (let k = a; k <= b; k++) next.add(visible[k].id);
      } else if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setLastClicked(index);
  }

  const done = jobs.filter((j) => j.status === "done").length;
  const failed = jobs.filter((j) => j.status === "error");
  const running = jobs.some((j) => j.status === "waiting" || j.status === "uploading" || j.status === "processing");

  return (
    <div>
      {/* Dépôt */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void importFiles(e.dataTransfer.files);
        }}
        className={`card flex flex-col items-center justify-center gap-3 border-dashed p-10 text-center transition-colors ${dragging ? "border-accent bg-accent/5" : ""}`}
      >
        <IconUpload size={28} className="text-muted" />
        <p className="font-medium">Glissez vos photos ici</p>
        <p className="max-w-md text-xs leading-relaxed text-faint">
          JPEG, PNG, WebP ou TIFF, en pleine résolution. Les aperçus filigranés sont générés automatiquement. Astuce trail :
          un nom de fichier contenant « D248 » ou « #248 » renseigne le dossard 248.
        </p>
        <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={() => fileInput.current?.click()}>
          Choisir des fichiers
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/tiff"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void importFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {jobs.length > 0 && (
        <div className="mt-4 rounded-xl border border-line p-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <p>
              {running ? "Import en cours…" : "Import terminé"} — {done}/{jobs.length}
              {failed.length > 0 && <span className="text-danger"> · {failed.length} erreur(s)</span>}
            </p>
            {!running && (
              <button type="button" className="text-xs text-faint hover:text-fg" onClick={() => setJobs([])}>
                Masquer
              </button>
            )}
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-soft">
            <div className="h-full bg-accent transition-all" style={{ width: `${(done / jobs.length) * 100}%` }} />
          </div>
          {failed.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-danger">
              {failed.slice(0, 10).map((j, i) => (
                <li key={i}>{j.name} : {j.error}</li>
              ))}
            </ul>
          )}
          {running && <p className="mt-2 text-xs text-faint">Gardez cet onglet ouvert pendant l&apos;import.</p>}
        </div>
      )}

      {/* Barre d'outils */}
      <div className="sticky top-16 z-30 -mx-4 mt-8 flex flex-wrap items-center gap-2 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <select className="input w-auto py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrer">
          <option value="all">Toutes ({photos.length})</option>
          {search === "bib" && <option value="nobib">Sans dossard ({photos.filter((p) => !p.bibs.length).length})</option>}
          <option value="notag">Sans tag ({photos.filter((p) => !p.tags.length).length})</option>
          {tags.map((t) => (
            <option key={t} value={`tag:${t}`}>{t}</option>
          ))}
        </select>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set(visible.map((p) => p.id)))}>
          Tout sélectionner
        </button>
        {search === "bib" && visible.length > 0 && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setBibMode(0)}>
            Saisie des dossards
          </button>
        )}
        {selected.size > 0 && (
          <>
            <span className="ml-auto text-sm text-muted">{selected.size} sélectionnée(s)</span>
            <form
              className="flex items-center gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                if (!tagInput.trim()) return;
                void patch({ ids: [...selected], addTags: [tagInput.trim()] });
                setTagInput("");
              }}
            >
              <input list="tag-list" className="input w-40 py-2 text-sm" placeholder="Tag (ex. Final)" value={tagInput} onChange={(e) => setTagInput(e.target.value)} />
              <datalist id="tag-list">{tags.map((t) => <option key={t} value={t} />)}</datalist>
              <button className="btn btn-ghost btn-sm" disabled={busy}>Ajouter</button>
            </form>
            {tags.length > 0 && (
              <select
                className="input w-auto py-2 text-sm"
                value=""
                onChange={(e) => e.target.value && void patch({ ids: [...selected], removeTags: [e.target.value] })}
                aria-label="Retirer un tag"
              >
                <option value="">Retirer un tag…</option>
                {tags.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
            {selected.size === 1 && (
              <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => void patch({ coverId: [...selected][0] })}>
                <IconStar size={14} /> Couverture
              </button>
            )}
            <button type="button" className="btn btn-ghost btn-sm text-danger" disabled={busy} onClick={removeSelected}>
              <IconTrash size={14} /> Supprimer
            </button>
            <button type="button" className="p-2 text-muted hover:text-fg" onClick={() => setSelected(new Set())} aria-label="Désélectionner">
              <IconClose size={16} />
            </button>
          </>
        )}
      </div>

      {/* Grille */}
      <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {visible.map((p, i) => {
          const isSel = selected.has(p.id);
          return (
            <li key={p.id} className="group relative">
              <button
                type="button"
                onClick={(e) => clickPhoto(i, e)}
                onDoubleClick={() => search === "bib" && setBibMode(i)}
                className={`relative block aspect-[3/2] w-full overflow-hidden rounded-lg bg-soft ${isSel ? "ring-2 ring-accent" : ""}`}
                aria-pressed={isSel}
                title={p.filename}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/photos/${slug}/${p.id}/thumb`} alt={p.filename} loading="lazy" className={`h-full w-full object-cover ${isSel ? "opacity-70" : ""}`} />
                {p.id === coverId && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-ink">couverture</span>
                )}
              </button>
              <p className="mt-1 flex flex-wrap gap-1 text-[11px] leading-tight text-faint">
                {p.bibs.map((b) => (
                  <span key={b} className="rounded bg-soft px-1 font-mono text-fg">#{b}</span>
                ))}
                {p.tags.map((t) => (
                  <span key={t} className="truncate">{t}</span>
                ))}
              </p>
            </li>
          );
        })}
      </ul>
      {!photos.length && <p className="mt-10 text-center text-muted">Aucune photo pour l&apos;instant.</p>}

      {bibMode !== null && visible[bibMode] && (
        <BibEditor
          slug={slug}
          photos={visible}
          index={bibMode}
          onIndex={setBibMode}
          onClose={() => {
            setBibMode(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/** Saisie rapide : photo en grand, numéros séparés par des espaces, Entrée = suivante. */
function BibEditor({ slug, photos, index, onIndex, onClose }: { slug: string; photos: Photo[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const photo = photos[index];
  const [value, setValue] = useState(photo.bibs.join(" "));
  const [saving, setSaving] = useState(false);
  const saved = useRef(new Map<string, string>());
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(saved.current.get(photo.id) ?? photo.bibs.join(" "));
    input.current?.focus();
  }, [photo]);

  async function save(next: number) {
    const bibs = value.split(/[\s,;]+/).filter(Boolean);
    if (bibs.join(" ") !== (saved.current.get(photo.id) ?? photo.bibs.join(" "))) {
      setSaving(true);
      await fetch(`/api/admin/events/${slug}/photos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: { [photo.id]: { bibs } } }),
      });
      saved.current.set(photo.id, bibs.join(" "));
      setSaving(false);
    }
    if (next >= photos.length) onClose();
    else onIndex(Math.max(0, next));
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95" role="dialog" aria-modal="true" aria-label="Saisie des dossards">
      <div className="flex items-center justify-between px-6 py-3 text-sm text-white/70">
        <span>{index + 1} / {photos.length} · {photo.filename}</span>
        <button type="button" onClick={onClose} className="p-2 text-white" aria-label="Fermer"><IconClose size={24} /></button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/photos/${slug}/${photo.id}/large`} alt="" className="max-h-full max-w-full object-contain" />
      </div>
      <form
        className="mx-auto flex w-full max-w-xl items-center gap-3 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          void save(index + 1);
        }}
      >
        <input
          ref={input}
          className="input text-center font-mono text-2xl tracking-widest"
          inputMode="numeric"
          placeholder="248 115"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^\d\s,;]/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" && !value) void save(index - 1);
            if (e.key === "Escape") onClose();
          }}
          aria-label="Dossards visibles sur la photo"
        />
        <button className="btn btn-primary" disabled={saving}>{saving ? "…" : "Suivante ↵"}</button>
      </form>
      <p className="pb-4 text-center text-xs text-white/40">Entrée : enregistrer et passer à la suivante · ← (champ vide) : précédente · Échap : fermer</p>
    </div>
  );
}
