import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { EventForm } from "@/components/admin/event-form";
import { PhotoManager } from "@/components/admin/photo-manager";
import { SharePanel } from "@/components/admin/share-panel";
import { IconArrowLeft } from "@/components/icons";
import { site } from "@/content/site";
import { assertAdminPage } from "@/lib/admin";
import { getEvent } from "@/lib/events";
import { usingBlob } from "@/lib/storage";

export default async function AdminEventPage({ params }: PageProps<"/admin/evenements/[slug]">) {
  await assertAdminPage();
  const { slug } = await params;
  const event = await getEvent(slug, { fresh: true });
  if (!event) notFound();
  const url = `${site.url}/evenements/${event.slug}`;
  const qrSvg = await QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#111111", light: "#ffffff" } });

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
          <IconArrowLeft size={16} /> Galeries
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-5xl">{event.title}</h1>
          <Link href={`/evenements/${event.slug}`} target="_blank" className="btn btn-ghost btn-sm">Voir la galerie ↗</Link>
        </div>
        {event.demo && (
          <p className="mt-4 rounded-[3px] border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
            Événement de démonstration (paiement simulé). Masquez les démos avec SHOW_DEMO_EVENTS=false.
          </p>
        )}
      </div>

      <SharePanel url={url} codes={event.accessCodes} title={event.title} qrSvg={qrSvg} />

      <section>
        <h2 className="mb-4 font-display text-3xl">Photos <span className="text-muted">({event.photos.length})</span></h2>
        <PhotoManager slug={event.slug} photos={event.photos} coverId={event.coverId ?? null} blob={usingBlob} search={event.search} />
      </section>

      <section>
        <h2 className="mb-4 font-display text-3xl">Réglages</h2>
        <EventForm
          initial={{
            slug: event.slug,
            demo: event.demo,
            title: event.title,
            category: event.category,
            date: event.date,
            location: event.location,
            description: event.description,
            accessCodes: event.accessCodes,
            listed: event.listed,
            search: event.search,
            pricing: event.pricing,
          }}
        />
      </section>
    </div>
  );
}
