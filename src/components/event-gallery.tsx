"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatPrice, quote } from "@/lib/pricing";
import type { GalleryEvent, PublicPhoto } from "@/lib/types";
import { IconBag, IconCheck, IconClose, IconPlus, IconSearch, IconTrash } from "./icons";
import { Lightbox } from "./lightbox";
import { SafeImg } from "./safe-img";

const PAGE = 60;
const ROW_HEIGHT = 220;

function thumb(slug: string, id: string) {
  return `/api/photos/${slug}/${id}/thumb`;
}
function large(slug: string, id: string) {
  return `/api/photos/${slug}/${id}/large`;
}

function timeOf(p: PublicPhoto) {
  return p.takenAt
    ? new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" }).format(new Date(p.takenAt))
    : null;
}

function useCart(slug: string) {
  const key = `lv_cart_${slug}`;
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydratation depuis le stockage local
      if (raw) setIds(JSON.parse(raw));
    } catch {
      // stockage indisponible : panier en mémoire seulement
    }
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(key, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }, [ids, key, ready]);

  const toggle = useCallback((id: string) => setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id])), []);
  const clear = useCallback(() => setIds([]), []);
  const addMany = useCallback((list: string[]) => setIds((cur) => [...new Set([...cur, ...list])]), []);
  return { ids, toggle, clear, addMany };
}

export function EventGallery({ event, paymentReady }: { event: GalleryEvent; paymentReady: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const { ids: cart, toggle, clear, addMany } = useCart(event.slug);
  const cartSet = useMemo(() => new Set(cart), [cart]);

  const [bib, setBib] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [onlySelection, setOnlySelection] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [drawer, setDrawer] = useState(params.get("panier") === "1");

  const tags = useMemo(() => {
    const seen = new Map<string, number>();
    for (const p of event.photos) for (const t of p.tags) seen.set(t, (seen.get(t) ?? 0) + 1);
    return [...seen.entries()];
  }, [event.photos]);

  const bibQuery = bib.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  const filtered = useMemo(() => {
    let list = event.photos;
    if (onlySelection) list = list.filter((p) => cartSet.has(p.id));
    if (event.search === "bib" && bibQuery) list = list.filter((p) => p.bibs.includes(bibQuery));
    if (tag) list = list.filter((p) => p.tags.includes(tag));
    return list;
  }, [event.photos, event.search, bibQuery, tag, onlySelection, cartSet]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- on revient en haut de liste à chaque filtre
  useEffect(() => setLimit(PAGE), [bibQuery, tag, onlySelection]);

  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setLimit((l) => l + PAGE);
    }, { rootMargin: "800px" });
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length]);

  const visible = filtered.slice(0, limit);
  const q = quote(event.pricing, cart.length, event.photos.length);
  const nextBundle = event.pricing.bundles.find((b) => b.quantity > cart.length);

  const lightboxItems = useMemo(
    () => filtered.map((p) => ({ src: large(event.slug, p.id), alt: `Photo ${p.id}`, width: p.width, height: p.height })),
    [filtered, event.slug],
  );

  async function lock() {
    await fetch(`/api/access?slug=${event.slug}`, { method: "DELETE" });
    router.refresh();
  }

  const priceLine = [
    `${formatPrice(event.pricing.unit)} la photo`,
    ...event.pricing.bundles.map((b) => `${b.quantity} pour ${formatPrice(b.price)}`),
    ...(event.pricing.all ? [`galerie complète ${formatPrice(event.pricing.all)}`] : []),
  ].join(" · ");

  return (
    <div className="pb-32">
      {/* Barre de recherche */}
      <div className="sticky top-16 z-30 -mx-4 border-b border-line bg-bg/90 px-4 py-4 backdrop-blur-md sm:top-20 sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {event.search === "bib" ? (
            <div className="relative w-full max-w-md">
              <IconSearch size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
              <input
                className="input pl-11 text-lg tabular-nums"
                inputMode="numeric"
                placeholder="Votre numéro de dossard"
                aria-label="Numéro de dossard"
                value={bib}
                onChange={(e) => setBib(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
              {bib && (
                <button
                  type="button"
                  onClick={() => setBib("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-fg"
                  aria-label="Effacer"
                >
                  <IconClose size={18} />
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted">Filtrez par moment pour vous retrouver plus vite.</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden text-xs text-faint sm:inline">{priceLine}</span>
            <button type="button" onClick={lock} className="text-xs text-faint underline-offset-4 hover:text-fg hover:underline">
              Fermer la galerie
            </button>
          </div>
        </div>
        {(tags.length > 0 || cart.length > 0) && (
          <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtres">
            <button type="button" className="chip" aria-pressed={!tag && !onlySelection} onClick={() => { setTag(null); setOnlySelection(false); }}>
              Toutes <span className="opacity-60">{event.photos.length}</span>
            </button>
            {tags.map(([t, n]) => (
              <button key={t} type="button" className="chip" aria-pressed={tag === t} onClick={() => setTag(tag === t ? null : t)}>
                {t} <span className="opacity-60">{n}</span>
              </button>
            ))}
            {cart.length > 0 && (
              <button type="button" className="chip" aria-pressed={onlySelection} onClick={() => setOnlySelection((v) => !v)}>
                <IconBag size={14} /> Ma sélection <span className="opacity-60">{cart.length}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Résultats */}
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {event.search === "bib" && bibQuery ? (
            filtered.length ? (
              <><strong className="text-fg">{filtered.length} photo{filtered.length > 1 ? "s" : ""}</strong> avec le dossard {bibQuery}</>
            ) : null
          ) : (
            <>{filtered.length} photo{filtered.length > 1 ? "s" : ""}</>
          )}
        </p>
        {filtered.length > 1 && (
          <button type="button" className="text-sm text-accent hover:underline" onClick={() => addMany(filtered.map((p) => p.id))}>
            Tout ajouter à ma sélection
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="font-display text-3xl">Aucune photo trouvée</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            {event.search === "bib" && bibQuery
              ? "Votre dossard n'a peut-être pas été lisible sur toutes les photos. Parcourez les points de passage ci-dessus ou effacez la recherche."
              : "Essayez un autre filtre."}
          </p>
          <button type="button" className="btn btn-ghost mt-6" onClick={() => { setBib(""); setTag(null); setOnlySelection(false); }}>
            Voir toutes les photos
          </button>
        </div>
      ) : (
        <div className="protect mt-4 flex flex-wrap gap-2" onContextMenu={(e) => e.preventDefault()}>
          {visible.map((photo, i) => {
            const ratio = photo.width / photo.height || 1.5;
            const selected = cartSet.has(photo.id);
            const time = timeOf(photo);
            return (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-lg bg-soft"
                style={{ flexGrow: ratio, flexBasis: `${ratio * ROW_HEIGHT * 0.75}px` }}
              >
                <div style={{ paddingBottom: `${100 / ratio}%` }} />
                <button type="button" className="absolute inset-0" onClick={() => setLightbox(i)} aria-label={`Agrandir la photo ${photo.id}`}>
                  <SafeImg
                    src={thumb(event.slug, photo.id)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] ${selected ? "opacity-80" : ""}`}
                  />
                </button>
                <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/55 px-1.5 py-0.5 text-[11px] text-white/85 opacity-0 transition-opacity group-hover:opacity-100">
                  {photo.id}{time ? ` · ${time}` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => toggle(photo.id)}
                  className={`absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full border transition ${
                    selected
                      ? "border-accent bg-accent text-accent-ink"
                      : "border-white/40 bg-black/45 text-white opacity-100 backdrop-blur sm:opacity-0 sm:group-hover:opacity-100"
                  }`}
                  aria-pressed={selected}
                  aria-label={selected ? "Retirer de ma sélection" : "Ajouter à ma sélection"}
                >
                  {selected ? <IconCheck size={18} /> : <IconPlus size={18} />}
                </button>
                {selected && <span className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-inset ring-accent" />}
              </div>
            );
          })}
          <div style={{ flexGrow: 999 }} aria-hidden="true" />
        </div>
      )}
      <div ref={sentinel} className="h-px" />

      <Lightbox
        items={lightboxItems}
        index={lightbox}
        onIndexChange={setLightbox}
        caption={(i) => {
          const p = filtered[i];
          if (!p) return null;
          const time = timeOf(p);
          return [p.id, time, ...p.tags].filter(Boolean).join(" · ");
        }}
        actions={(i) => {
          const p = filtered[i];
          if (!p) return null;
          const selected = cartSet.has(p.id);
          return (
            <>
              <button type="button" className={`btn ${selected ? "btn-ghost text-white" : "btn-primary"}`} onClick={() => toggle(p.id)}>
                {selected ? <><IconCheck size={16} /> Dans ma sélection</> : <><IconPlus size={16} /> Ajouter · {formatPrice(event.pricing.unit)}</>}
              </button>
              {cart.length > 0 && (
                <button type="button" className="btn btn-ghost text-white" onClick={() => { setLightbox(null); setDrawer(true); }}>
                  <IconBag size={16} /> {cart.length}
                </button>
              )}
            </>
          );
        }}
      />

      {/* Barre panier */}
      {cart.length > 0 && !drawer && (
        <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-5">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-[3px] border border-line-strong bg-elevated/95 p-3 pl-5 shadow-2xl backdrop-blur-md animate-fade-up">
            <div className="min-w-0">
              <p className="font-medium">
                {cart.length} photo{cart.length > 1 ? "s" : ""} · {formatPrice(q.total)}
                {q.total < q.undiscounted && <span className="ml-2 text-sm text-faint line-through">{formatPrice(q.undiscounted)}</span>}
              </p>
              <p className="truncate text-xs text-muted">
                {q.all ? "Galerie complète offerte à ce prix" : nextBundle ? `Encore ${nextBundle.quantity - cart.length} pour le lot de ${nextBundle.quantity} à ${formatPrice(nextBundle.price)}` : q.breakdown}
              </p>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => setDrawer(true)}>
              <IconBag size={16} /> Commander
            </button>
          </div>
        </div>
      )}

      {drawer && (
        <CartDrawer
          event={event}
          cart={cart}
          paymentReady={paymentReady}
          onClose={() => setDrawer(false)}
          onRemove={toggle}
          onClear={clear}
          onSelectAll={() => addMany(event.photos.map((p) => p.id))}
        />
      )}
    </div>
  );
}

function CartDrawer({
  event,
  cart,
  paymentReady,
  onClose,
  onRemove,
  onClear,
  onSelectAll,
}: {
  event: GalleryEvent;
  cart: string[];
  paymentReady: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onSelectAll: () => void;
}) {
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const q = quote(event.pricing, cart.length, event.photos.length);
  const nextBundle = event.pricing.bundles.find((b) => b.quantity > cart.length);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  async function checkout(e: React.FormEvent) {
    e.preventDefault();
    if (!accepted) {
      setError("Merci d'accepter les conditions de vente.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: event.slug, photoIds: cart, email }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Paiement indisponible.");
      if (data.url.includes("/commande/")) onClear();
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="Fermer le panier" />
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-line bg-elevated animate-[fade-up_0.3s_ease-out]">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 id="cart-title" className="font-display text-3xl">Ma sélection</h2>
          <button type="button" onClick={onClose} className="-mr-2 p-2 text-muted hover:text-fg" aria-label="Fermer">
            <IconClose size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cart.length === 0 ? (
            <p className="text-sm text-muted">Votre sélection est vide. Ajoutez des photos avec le bouton +.</p>
          ) : (
            <>
              <ul className="grid grid-cols-4 gap-2">
                {cart.map((id) => (
                  <li key={id} className="group relative aspect-square overflow-hidden rounded-md bg-soft">
                    <SafeImg src={thumb(event.slug, id)} alt={`Photo ${id}`} className="h-full w-full object-cover" draggable={false} />
                    <button
                      type="button"
                      onClick={() => onRemove(id)}
                      className="absolute inset-0 grid place-items-center bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                      aria-label={`Retirer la photo ${id}`}
                    >
                      <IconTrash size={18} />
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" className="mt-3 text-xs text-faint hover:text-fg" onClick={onClear}>
                Vider la sélection
              </button>
            </>
          )}

          <div className="mt-8 space-y-3 rounded-[3px] border border-line p-4 text-sm">
            <p className="eyebrow">Tarifs</p>
            <p className="flex justify-between"><span className="text-muted">À l&apos;unité</span><span>{formatPrice(event.pricing.unit)}</span></p>
            {event.pricing.bundles.map((b) => (
              <p key={b.quantity} className="flex justify-between">
                <span className="text-muted">Lot de {b.quantity} photos</span>
                <span>{formatPrice(b.price)}</span>
              </p>
            ))}
            {event.pricing.all ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Galerie complète ({event.photoCount})</span>
                <span className="flex items-center gap-3">
                  <button type="button" onClick={onSelectAll} className="text-xs text-accent hover:underline">Choisir</button>
                  {formatPrice(event.pricing.all)}
                </span>
              </div>
            ) : null}
            <p className="pt-1 text-xs leading-relaxed text-faint">Le meilleur tarif est appliqué automatiquement.</p>
          </div>
        </div>

        {cart.length > 0 && (
          <form onSubmit={checkout} className="space-y-4 border-t border-line px-6 py-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-muted">
                  {q.all ? `Galerie complète · ${event.photoCount} photos` : `${cart.length} photo${cart.length > 1 ? "s" : ""}`}
                  {!q.all && q.breakdown.includes("lot") && ` · ${q.breakdown}`}
                </p>
                {nextBundle && !q.all && (
                  <p className="mt-1 text-xs text-accent">
                    +{nextBundle.quantity - cart.length} photo{nextBundle.quantity - cart.length > 1 ? "s" : ""} = lot de {nextBundle.quantity} à {formatPrice(nextBundle.price)}
                  </p>
                )}
              </div>
              <p className="text-right">
                {q.total < q.undiscounted && <span className="block text-sm text-faint line-through">{formatPrice(q.undiscounted)}</span>}
                <span className="font-display text-4xl">{formatPrice(q.total)}</span>
              </p>
            </div>
            <div>
              <label htmlFor="cart-email" className="label">E-mail (pour recevoir le lien de téléchargement)</label>
              <input id="cart-email" type="email" className="input" placeholder="vous@exemple.fr" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <label className="flex gap-3 text-xs leading-relaxed text-muted">
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]" />
              <span>
                J&apos;accepte les <Link href="/cgv" target="_blank" className="underline hover:text-fg">conditions de vente</Link> et
                demande la livraison immédiate des fichiers, en renonçant à mon droit de rétractation pour ce contenu numérique.
              </span>
            </label>
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <button type="submit" className="btn btn-primary w-full py-4" disabled={pending}>
              {pending ? "Redirection…" : event.demo ? "Simuler le paiement (démo)" : `Payer ${formatPrice(q.total)}`}
            </button>
            <p className="text-center text-xs text-faint">
              {event.demo
                ? "Galerie de démonstration : aucun paiement réel."
                : paymentReady
                  ? "Paiement sécurisé par Stripe · CB, Apple Pay, Google Pay"
                  : "Paiement en ligne bientôt disponible."}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
