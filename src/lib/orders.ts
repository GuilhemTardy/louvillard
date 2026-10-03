import "server-only";
import Stripe from "stripe";
import { getEvent } from "./events";
import { quote } from "./pricing";
import { sign, verify } from "./signing";
import type { EventRecord } from "./types";

/** Durée de validité des liens de téléchargement. */
export const DOWNLOAD_DAYS = 60;

export const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);

let stripeClient: Stripe | null = null;
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY manquant");
  stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripeClient;
}

export type Order = {
  ref: string;
  slug: string;
  photoIds: string[];
  all: boolean;
  amount: number;
  email: string | null;
  createdAt: number;
  demo: boolean;
  paid: boolean;
  expiresAt: number;
};

type DemoPayload = { s: string; p: string[]; a: boolean; m: number; e: string | null; t: number };

const METADATA_CHUNK = 480;

function chunkIds(ids: string[]) {
  const chunks: string[] = [];
  let current = "";
  for (const id of ids) {
    if (current.length + id.length + 1 > METADATA_CHUNK) {
      chunks.push(current);
      current = "";
    }
    current = current ? `${current},${id}` : id;
  }
  if (current) chunks.push(current);
  return chunks;
}

export type CheckoutInput = { event: EventRecord; photoIds: string[]; email: string | null; origin: string };

export async function createCheckout({ event, photoIds, email, origin }: CheckoutInput): Promise<string> {
  const known = new Set(event.photos.map((p) => p.id));
  const ids = [...new Set(photoIds)].filter((id) => known.has(id));
  if (!ids.length) throw new Error("Aucune photo sélectionnée.");
  const q = quote(event.pricing, ids.length, event.photos.length);
  const finalIds = q.all ? [] : ids;

  if (event.demo) {
    const token = sign<DemoPayload>(
      { s: event.slug, p: finalIds, a: q.all, m: q.total, e: email, t: Date.now() },
      "demo-order",
    );
    return `${origin}/commande/demo_${token}`;
  }

  if (!stripeEnabled) throw new Error("Le paiement en ligne n'est pas encore configuré.");

  const chunks = chunkIds(finalIds);
  if (chunks.length > 45) throw new Error("Sélection trop grande : choisissez la galerie complète.");
  const metadata: Record<string, string> = {
    app: "louvillard",
    slug: event.slug,
    all: q.all ? "1" : "0",
    count: String(q.count),
    chunks: String(chunks.length),
  };
  chunks.forEach((c, i) => (metadata[`p${i}`] = c));

  const label = q.all ? "Galerie complète" : `${q.count} photo${q.count > 1 ? "s" : ""} HD`;
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    locale: "fr",
    customer_email: email ?? undefined,
    allow_promotion_codes: true,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: q.total,
          product_data: {
            name: `${label} — ${event.title}`,
            description: `Fichiers haute définition sans filigrane, téléchargeables pendant ${DOWNLOAD_DAYS} jours.`,
          },
        },
      },
    ],
    metadata,
    payment_intent_data: { metadata },
    success_url: `${origin}/commande/{CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/evenements/${event.slug}?panier=1`,
  });
  if (!session.url) throw new Error("Stripe n'a pas renvoyé d'URL de paiement.");
  return session.url;
}

function fromSession(session: Stripe.Checkout.Session): Order | null {
  const m = session.metadata ?? {};
  if (m.app !== "louvillard" || !m.slug) return null;
  const chunks = Number(m.chunks ?? 0);
  const photoIds = Array.from({ length: chunks }, (_, i) => (m[`p${i}`] ?? "").split(",")).flat().filter(Boolean);
  const createdAt = session.created * 1000;
  return {
    ref: session.id,
    slug: m.slug,
    photoIds,
    all: m.all === "1",
    amount: session.amount_total ?? 0,
    email: session.customer_details?.email ?? session.customer_email ?? null,
    createdAt,
    demo: false,
    paid: session.payment_status === "paid" || session.payment_status === "no_payment_required",
    expiresAt: createdAt + DOWNLOAD_DAYS * 86_400_000,
  };
}

export async function getOrder(ref: string): Promise<Order | null> {
  if (ref.startsWith("demo_")) {
    const data = verify<DemoPayload>(ref.slice(5), "demo-order");
    if (!data) return null;
    return {
      ref,
      slug: data.s,
      photoIds: data.p,
      all: data.a,
      amount: data.m,
      email: data.e,
      createdAt: data.t,
      demo: true,
      paid: true,
      expiresAt: data.t + DOWNLOAD_DAYS * 86_400_000,
    };
  }
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(ref) || !stripeEnabled) return null;
  try {
    return fromSession(await stripe().checkout.sessions.retrieve(ref));
  } catch {
    return null;
  }
}

/** Commande valide + photos achetées, ou null. */
export async function resolveOrder(ref: string) {
  const order = await getOrder(ref);
  const expired = Boolean(order && order.expiresAt < Date.now());
  if (!order || !order.paid || expired) return { order, expired, event: null, photos: [] };
  const event = await getEvent(order.slug);
  if (!event) return { order, expired, event: null, photos: [] };
  const wanted = new Set(order.photoIds);
  const photos = order.all ? event.photos : event.photos.filter((p) => wanted.has(p.id));
  return { order, expired, event, photos };
}

/** Commandes payées et encore valides pour une adresse e-mail. */
export async function findOrdersByEmail(email: string): Promise<Order[]> {
  if (!stripeEnabled) return [];
  const sessions = await stripe().checkout.sessions.list({ limit: 50, status: "complete", customer_details: { email } });
  return sessions.data
    .map(fromSession)
    .filter((o): o is Order => Boolean(o?.paid && o.expiresAt > Date.now()));
}

export async function listPaidOrders(limit = 100): Promise<Order[]> {
  if (!stripeEnabled) return [];
  const sessions = await stripe().checkout.sessions.list({ limit: Math.min(limit, 100), status: "complete" });
  return sessions.data.map(fromSession).filter((o): o is Order => Boolean(o));
}

export async function constructWebhookEvent(body: string, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET manquant");
  return stripe().webhooks.constructEvent(body, signature, secret);
}

export function orderFromSession(session: Stripe.Checkout.Session) {
  return fromSession(session);
}
