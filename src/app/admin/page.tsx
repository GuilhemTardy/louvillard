import Link from "next/link";
import { coverUrl, formatDate } from "@/components/event-card";
import { IconImage, IconPlus } from "@/components/icons";
import { assertAdminPage } from "@/lib/admin";
import { adminConfigured } from "@/lib/access";
import { listEvents, toPublicEvent } from "@/lib/events";
import { mailEnabled } from "@/lib/mail";
import { stripeEnabled } from "@/lib/orders";
import { usingBlob, storageWritable } from "@/lib/storage";
import { CATEGORY_LABELS } from "@/lib/types";

export default async function AdminHome() {
  await assertAdminPage();
  const events = await listEvents({ fresh: true });
  const checks = [
    { ok: adminConfigured, label: "Mot de passe admin", hint: "ADMIN_PASSWORD" },
    { ok: Boolean(process.env.APP_SECRET && process.env.APP_SECRET.length >= 32), label: "Clé de signature", hint: "APP_SECRET (32+ caractères)" },
    { ok: usingBlob || !process.env.VERCEL, label: usingBlob ? "Stockage Vercel Blob" : "Stockage local (.data/)", hint: "Connecter un store Vercel Blob (privé)" },
    { ok: stripeEnabled, label: "Paiement Stripe", hint: "STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET" },
    { ok: mailEnabled, label: "E-mails (Resend)", hint: "RESEND_API_KEY + MAIL_FROM" },
  ];
  const missing = checks.filter((c) => !c.ok);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl">Galeries</h1>
          <p className="mt-2 text-sm text-muted">{events.length} événement{events.length > 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/evenements/nouveau" className="btn btn-primary">
          <IconPlus size={16} /> Nouvel événement
        </Link>
      </div>

      {(missing.length > 0 || !storageWritable) && (
        <div className="card mt-8 p-5">
          <p className="text-sm font-medium">Configuration</p>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-2">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${c.ok ? "bg-success" : "bg-danger"}`} />
                <span>
                  {c.label}
                  {!c.ok && <span className="block text-xs text-faint">{c.hint}</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-faint">Le détail de chaque variable est dans le README du projet.</p>
        </div>
      )}

      <ul className="mt-8 divide-y divide-line overflow-hidden rounded-[3px] border border-line">
        {events.map((e) => {
          const pub = toPublicEvent(e);
          const cover = coverUrl(pub);
          const missingBibs = e.search === "bib" ? e.photos.filter((p) => !p.bibs.length).length : 0;
          return (
            <li key={e.slug}>
              <Link href={`/admin/evenements/${e.slug}`} className="flex items-center gap-4 bg-elevated p-4 transition-colors hover:bg-soft">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{e.title}</p>
                  <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted">
                    <span>{CATEGORY_LABELS[e.category]}</span>
                    <span>{formatDate(e.date)}</span>
                    <span className="inline-flex items-center gap-1"><IconImage size={12} /> {e.photos.length}</span>
                    <span className="font-mono">{e.accessCodes.join(", ")}</span>
                  </p>
                </div>
                <div className="hidden flex-col items-end gap-1 text-xs sm:flex">
                  {e.demo && <span className="rounded-full bg-accent/15 px-2 py-0.5 text-accent">démo</span>}
                  {!e.listed && <span className="rounded-full bg-soft px-2 py-0.5 text-muted">non listé</span>}
                  {missingBibs > 0 && <span className="text-faint">{missingBibs} sans dossard</span>}
                </div>
              </Link>
            </li>
          );
        })}
        {!events.length && <li className="p-10 text-center text-muted">Aucun événement pour l&apos;instant.</li>}
      </ul>
    </div>
  );
}
