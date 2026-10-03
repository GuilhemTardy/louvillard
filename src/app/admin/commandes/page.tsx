import { assertAdminPage } from "@/lib/admin";
import { listEvents } from "@/lib/events";
import { listPaidOrders, stripeEnabled } from "@/lib/orders";
import { formatPrice } from "@/lib/pricing";

export default async function OrdersPage() {
  await assertAdminPage();
  if (!stripeEnabled) {
    return (
      <div>
        <h1 className="font-display text-5xl">Ventes</h1>
        <p className="mt-4 text-muted">Connectez Stripe (STRIPE_SECRET_KEY) pour suivre vos ventes ici.</p>
      </div>
    );
  }
  const [orders, events] = await Promise.all([listPaidOrders(100), listEvents()]);
  const titles = new Map(events.map((e) => [e.slug, e.title]));
  const total = orders.reduce((s, o) => s + o.amount, 0);
  const byEvent = new Map<string, { count: number; amount: number }>();
  for (const o of orders) {
    const cur = byEvent.get(o.slug) ?? { count: 0, amount: 0 };
    byEvent.set(o.slug, { count: cur.count + 1, amount: cur.amount + o.amount });
  }

  return (
    <div>
      <h1 className="font-display text-5xl">Ventes</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><p className="text-sm text-muted">Chiffre (100 dernières)</p><p className="mt-2 font-display text-4xl">{formatPrice(total)}</p></div>
        <div className="card p-5"><p className="text-sm text-muted">Commandes</p><p className="mt-2 font-display text-4xl">{orders.length}</p></div>
        <div className="card p-5"><p className="text-sm text-muted">Panier moyen</p><p className="mt-2 font-display text-4xl">{formatPrice(orders.length ? Math.round(total / orders.length) : 0)}</p></div>
      </div>

      <h2 className="mt-12 font-display text-3xl">Par événement</h2>
      <ul className="mt-4 divide-y divide-line rounded-[3px] border border-line">
        {[...byEvent].map(([slug, s]) => (
          <li key={slug} className="flex justify-between gap-4 p-4 text-sm">
            <span>{titles.get(slug) ?? slug}</span>
            <span className="text-muted">{s.count} commande(s) · <span className="text-fg">{formatPrice(s.amount)}</span></span>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 font-display text-3xl">Dernières commandes</h2>
      <div className="mt-4 overflow-x-auto rounded-[3px] border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-elevated text-xs uppercase tracking-wider text-faint">
            <tr><th className="p-3">Date</th><th className="p-3">Client</th><th className="p-3">Événement</th><th className="p-3">Photos</th><th className="p-3 text-right">Montant</th><th className="p-3" /></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((o) => (
              <tr key={o.ref}>
                <td className="whitespace-nowrap p-3 text-muted">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(o.createdAt)}</td>
                <td className="p-3">{o.email ?? "—"}</td>
                <td className="p-3">{titles.get(o.slug) ?? o.slug}</td>
                <td className="p-3">{o.all ? "Galerie complète" : o.photoIds.length}</td>
                <td className="p-3 text-right">{formatPrice(o.amount)}</td>
                <td className="p-3 text-right"><a className="text-accent hover:underline" href={`/commande/${o.ref}`} target="_blank">Lien client ↗</a></td>
              </tr>
            ))}
            {!orders.length && <tr><td colSpan={6} className="p-8 text-center text-muted">Aucune vente pour l&apos;instant.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
