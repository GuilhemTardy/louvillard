import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/components/event-card";
import { IconCheck, IconDownload } from "@/components/icons";
import { site } from "@/content/site";
import { resolveOrder } from "@/lib/orders";
import { formatPrice } from "@/lib/pricing";

export const metadata: Metadata = { title: "Votre commande", robots: { index: false } };

export default async function OrderPage({ params }: PageProps<"/commande/[ref]">) {
  const { ref } = await params;
  const { order, expired, event, photos } = await resolveOrder(decodeURIComponent(ref));

  if (!order || (order.paid && !expired && !event)) {
    return (
      <Message title="Commande introuvable">
        Ce lien n&apos;est pas valide. Si vous avez payé, <Link className="text-fg underline" href="/commande">recevez à nouveau vos liens</Link> ou écrivez à{" "}
        <a className="text-fg underline" href={`mailto:${site.email}`}>{site.email}</a>.
      </Message>
    );
  }
  if (!order.paid) {
    return (
      <Message title="Paiement en cours de validation">
        Votre paiement n&apos;est pas encore confirmé. Actualisez cette page dans quelques instants ; vous recevrez aussi le
        lien par e-mail.
      </Message>
    );
  }
  if (expired || !event) {
    return (
      <Message title="Lien expiré">
        Ce lien de téléchargement a expiré. Écrivez à <a className="text-fg underline" href={`mailto:${site.email}`}>{site.email}</a>{" "}
        avec la date de votre commande : je vous renvoie vos photos.
      </Message>
    );
  }

  const base = `/api/orders/${encodeURIComponent(order.ref)}`;
  return (
    <div className="container-page pb-24 pt-32 sm:pt-40">
      {order.demo && (
        <p className="mb-8 rounded-[3px] border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
          Commande de démonstration : aucun paiement n&apos;a été effectué.
        </p>
      )}
      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-end">
        <div>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
            <IconCheck size={24} />
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[0.95] sm:text-6xl">Merci, vos photos sont prêtes</h1>
          <p className="mt-5 max-w-xl leading-relaxed text-muted">
            {photos.length} photo{photos.length > 1 ? "s" : ""} HD de <span className="text-fg">{event.title}</span>{" "}
            ({formatDate(event.date)}). Téléchargez-les maintenant : ce lien reste actif jusqu&apos;au{" "}
            {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(order.expiresAt)}.
          </p>
        </div>
        <div className="card p-6">
          <p className="flex justify-between text-sm"><span className="text-muted">Total payé</span><span>{formatPrice(order.amount)}</span></p>
          {order.email && <p className="mt-2 flex justify-between gap-4 text-sm"><span className="text-muted">Lien envoyé à</span><span className="truncate">{order.email}</span></p>}
          <a href={`${base}/zip`} className="btn btn-primary mt-5 w-full py-4" download>
            <IconDownload size={18} /> Tout télécharger (.zip)
          </a>
          <p className="mt-3 text-center text-xs text-faint">Ajoutez cette page à vos favoris pour y revenir.</p>
        </div>
      </div>

      <ul className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((p) => (
          <li key={p.id} className="overflow-hidden rounded-[3px] border border-line bg-elevated">
            <div className="aspect-[3/2] bg-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${base}/photos/${p.id}?preview=1`} alt={`Photo ${p.id}`} loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="flex items-center justify-between gap-2 p-3">
              <span className="text-xs text-muted">{p.id}</span>
              <a href={`${base}/photos/${p.id}`} className="btn btn-ghost btn-sm" download>
                <IconDownload size={14} /> HD
              </a>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-12 text-sm text-muted">
        Merci de mentionner « Photo : {site.name} » si vous publiez ces images.{" "}
        <Link href={`/evenements/${event.slug}`} className="text-fg underline underline-offset-4">Retour à la galerie</Link>
      </p>
    </div>
  );
}

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="container-page flex min-h-[70svh] items-center pb-20 pt-32">
      <div className="max-w-xl">
        <h1 className="font-display text-5xl leading-none">{title}</h1>
        <p className="mt-6 leading-relaxed text-muted">{children}</p>
        <Link href="/" className="btn btn-ghost mt-8">Retour à l&apos;accueil</Link>
      </div>
    </section>
  );
}
