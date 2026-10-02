import "server-only";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { isAdmin } from "./access";
import { listEvents, normalizeCode, SLUG_RE } from "./events";
import type { EventCategory, EventRecord, Pricing } from "./types";

export async function requireAdmin() {
  return (await isAdmin()) ? null : NextResponse.json({ error: "Session admin expirée." }, { status: 401 });
}

export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const CATEGORIES: EventCategory[] = ["spectacle", "concert", "trail", "evenement"];

type Input = Record<string, unknown>;

function str(v: unknown, max = 500) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function cents(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
}

function parsePricing(v: unknown): Pricing | string {
  const p = (v ?? {}) as Input;
  const unit = cents(p.unit);
  if (!unit || unit < 50) return "Le prix unitaire doit être d'au moins 0,50 €.";
  const bundles = Array.isArray(p.bundles)
    ? (p.bundles as Input[])
        .map((b) => ({ quantity: Math.round(Number(b.quantity)), price: cents(b.price) ?? 0 }))
        .filter((b) => b.quantity > 1 && b.price > 0)
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 6)
    : [];
  const all = cents(p.all);
  return { unit, bundles, all: all && all > 0 ? all : null };
}

/** Valide les champs éditables d'un événement. Renvoie un message d'erreur ou les champs. */
export async function parseEventInput(body: Input, currentSlug: string | null) {
  const title = str(body.title, 140);
  if (!title) return "Le titre est obligatoire.";
  const category = CATEGORIES.includes(body.category as EventCategory) ? (body.category as EventCategory) : null;
  if (!category) return "Catégorie invalide.";
  const date = str(body.date, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Date invalide.";
  const rawCodes = Array.isArray(body.accessCodes) ? body.accessCodes : str(body.accessCodes, 1000).split(/[\n,;]+/);
  const accessCodes = [...new Set(rawCodes.map((c) => normalizeCode(String(c))).filter(Boolean))];
  if (!accessCodes.length) return "Indiquez au moins un code d'accès.";
  if (accessCodes.some((c) => c.length < 4)) return "Chaque code doit faire au moins 4 caractères.";
  const others = (await listEvents({ fresh: true })).filter((e) => e.slug !== currentSlug);
  const clash = others.find((e) => e.accessCodes.some((c) => accessCodes.includes(normalizeCode(c))));
  if (clash) return `Le code est déjà utilisé par « ${clash.title} ».`;
  const pricing = parsePricing(body.pricing);
  if (typeof pricing === "string") return pricing;

  let slug = currentSlug;
  if (!slug) {
    slug = slugify(str(body.slug, 80) || `${title}-${date.slice(0, 4)}`);
    if (!SLUG_RE.test(slug)) return "Adresse (slug) invalide.";
    if (others.some((e) => e.slug === slug)) return "Un événement utilise déjà cette adresse.";
  }

  return {
    slug,
    title,
    category,
    date,
    location: str(body.location, 140),
    description: str(body.description, 2000),
    accessCodes,
    listed: body.listed !== false,
    search: body.search === "bib" ? ("bib" as const) : ("tags" as const),
    pricing,
  } satisfies Partial<EventRecord>;
}

/** Garde-fou côté page (le layout seul ne suffit pas à protéger les données). */
export async function assertAdminPage() {
  if (!(await isAdmin())) notFound();
}
