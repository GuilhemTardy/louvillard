"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORY_LABELS, type EventCategory, type EventRecord } from "@/lib/types";
import { IconPlus, IconTrash } from "../icons";

type Editable = Pick<
  EventRecord,
  "title" | "category" | "date" | "location" | "description" | "accessCodes" | "listed" | "search" | "pricing"
> & { slug?: string; demo?: boolean };

const toEuros = (cents: number | null | undefined) => (cents ? String(cents / 100).replace(".", ",") : "");
const toCents = (value: string) => {
  const n = Number(value.replace(",", ".").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0;
};

function randomCode(title: string) {
  const base = title
    .normalize("NFKD")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 6);
  const alphabet = "23456789";
  const suffix = Array.from({ length: 3 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `${base || "LOU"}${suffix}`;
}

const DEFAULTS: Editable = {
  title: "",
  category: "spectacle",
  date: new Date().toISOString().slice(0, 10),
  location: "",
  description: "",
  accessCodes: [],
  listed: true,
  search: "tags",
  pricing: { unit: 500, bundles: [{ quantity: 5, price: 2000 }], all: null },
};

export function EventForm({ initial }: { initial?: Editable }) {
  const router = useRouter();
  const editing = Boolean(initial?.slug);
  const start = initial ?? DEFAULTS;

  const [title, setTitle] = useState(start.title);
  const [category, setCategory] = useState<EventCategory>(start.category);
  const [date, setDate] = useState(start.date);
  const [location, setLocation] = useState(start.location);
  const [description, setDescription] = useState(start.description);
  const [codes, setCodes] = useState(start.accessCodes.join("\n"));
  const [listed, setListed] = useState(start.listed);
  const [search, setSearch] = useState(start.search);
  const [unit, setUnit] = useState(toEuros(start.pricing.unit));
  const [bundles, setBundles] = useState(start.pricing.bundles.map((b) => ({ quantity: String(b.quantity), price: toEuros(b.price) })));
  const [all, setAll] = useState(toEuros(start.pricing.all));
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const body = {
      title,
      category,
      date,
      location,
      description,
      accessCodes: codes,
      listed,
      search,
      pricing: {
        unit: toCents(unit),
        bundles: bundles.map((b) => ({ quantity: Number(b.quantity), price: toCents(b.price) })),
        all: toCents(all) || null,
      },
    };
    const res = await fetch(editing ? `/api/admin/events/${initial!.slug}` : "/api/admin/events", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { slug?: string; error?: string };
    setPending(false);
    if (!res.ok) {
      setMessage({ ok: false, text: data.error ?? "Erreur." });
      return;
    }
    if (!editing && data.slug) {
      router.push(`/admin/evenements/${data.slug}`);
      return;
    }
    setMessage({ ok: true, text: "Enregistré." });
    router.refresh();
  }

  async function remove() {
    if (!initial?.slug || !confirm(`Supprimer définitivement « ${initial.title} » et toutes ses photos ?`)) return;
    const res = await fetch(`/api/admin/events/${initial.slug}`, { method: "DELETE" });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage({ ok: false, text: data.error ?? "Erreur." });
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <section className="card grid gap-5 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="title">Titre</label>
          <input id="title" className="input" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Gala de danse 2026 — École Étoile" />
        </div>
        <div>
          <label className="label" htmlFor="category">Catégorie</label>
          <select
            id="category"
            className="input"
            value={category}
            onChange={(e) => {
              const c = e.target.value as EventCategory;
              setCategory(c);
              if (!editing) setSearch(c === "trail" ? "bib" : "tags");
            }}
          >
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="date">Date</label>
          <input id="date" type="date" className="input" required value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="location">Lieu</label>
          <input id="location" className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Théâtre municipal, Grenoble" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="description">Description (visible dans la galerie)</label>
          <textarea id="description" rows={3} className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </section>

      <section className="card grid gap-5 p-6 sm:grid-cols-2">
        <div>
          <div className="flex items-end justify-between">
            <label className="label" htmlFor="codes">Code(s) d&apos;accès — un par ligne</label>
            <button type="button" className="mb-1.5 text-xs text-accent hover:underline" onClick={() => setCodes((c) => (c ? `${c}\n` : "") + randomCode(title))}>
              Générer
            </button>
          </div>
          <textarea id="codes" rows={3} className="input font-mono uppercase tracking-widest" value={codes} onChange={(e) => setCodes(e.target.value.toUpperCase())} placeholder="ETOILE26" />
          <p className="mt-2 text-xs text-faint">Lettres et chiffres, 4 caractères minimum. Accents, espaces et tirets sont ignorés à la saisie.</p>
        </div>
        <div className="space-y-5">
          <div>
            <span className="label">Recherche proposée aux visiteurs</span>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="chip" aria-pressed={search === "bib"} onClick={() => setSearch("bib")}>Par dossard</button>
              <button type="button" className="chip" aria-pressed={search === "tags"} onClick={() => setSearch("tags")}>Par moment / tableau</button>
            </div>
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={listed} onChange={(e) => setListed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
            <span>
              Afficher dans la liste publique des événements
              <span className="block text-xs text-faint">Décochez pour un événement privé, accessible uniquement par lien + code.</span>
            </span>
          </label>
        </div>
      </section>

      <section className="card p-6">
        <p className="text-sm font-medium">Tarifs (€ TTC)</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="unit">Prix à l&apos;unité</label>
            <input id="unit" className="input" inputMode="decimal" required value={unit} onChange={(e) => setUnit(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="all">Galerie complète (optionnel)</label>
            <input id="all" className="input" inputMode="decimal" value={all} onChange={(e) => setAll(e.target.value)} placeholder="—" />
          </div>
        </div>
        <p className="label mt-6">Lots dégressifs</p>
        <ul className="space-y-2">
          {bundles.map((b, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <input className="input w-20" inputMode="numeric" value={b.quantity} onChange={(e) => setBundles((list) => list.map((x, j) => (j === i ? { ...x, quantity: e.target.value } : x)))} aria-label="Nombre de photos" />
              <span className="text-muted">photos pour</span>
              <input className="input w-28" inputMode="decimal" value={b.price} onChange={(e) => setBundles((list) => list.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} aria-label="Prix du lot" />
              <span className="text-muted">€</span>
              <button type="button" className="p-2 text-faint hover:text-danger" onClick={() => setBundles((list) => list.filter((_, j) => j !== i))} aria-label="Supprimer le lot">
                <IconTrash size={16} />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn-ghost btn-sm mt-3" onClick={() => setBundles((list) => [...list, { quantity: "", price: "" }])}>
          <IconPlus size={14} /> Ajouter un lot
        </button>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Enregistrement…" : editing ? "Enregistrer" : "Créer l'événement"}
        </button>
        {message && <p role="status" className={`text-sm ${message.ok ? "text-success" : "text-danger"}`}>{message.text}</p>}
        {editing && !initial?.demo && (
          <button type="button" onClick={remove} className="ml-auto text-sm text-faint hover:text-danger">
            Supprimer l&apos;événement
          </button>
        )}
      </div>
    </form>
  );
}
