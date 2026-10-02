import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CodeForm } from "@/components/code-form";
import { coverUrl, formatDate } from "@/components/event-card";
import { EventGallery } from "@/components/event-gallery";
import { IconArrowLeft, IconCalendar, IconImage, IconPin } from "@/components/icons";
import { site } from "@/content/site";
import { hasAccess } from "@/lib/access";
import { getEvent, toGalleryEvent, toPublicEvent } from "@/lib/events";
import { stripeEnabled } from "@/lib/orders";
import { formatPrice } from "@/lib/pricing";
import { CATEGORY_LABELS } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/evenements/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return {};
  const cover = coverUrl(event, "large");
  return {
    title: event.title,
    description: event.description || `Photos de ${event.title} par ${site.name}.`,
    robots: event.listed ? undefined : { index: false },
    openGraph: cover ? { images: [{ url: cover }] } : undefined,
  };
}

export default async function EventPage({ params }: PageProps<"/evenements/[slug]">) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();
  const unlocked = await hasAccess(slug);
  const pub = toPublicEvent(event);
  const cover = coverUrl(pub, "large");

  const meta = (
    <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
      <span className="inline-flex items-center gap-1.5"><IconCalendar size={15} /> {formatDate(event.date)}</span>
      {event.location && <span className="inline-flex items-center gap-1.5"><IconPin size={15} /> {event.location}</span>}
      <span className="inline-flex items-center gap-1.5"><IconImage size={15} /> {event.photos.length} photos</span>
    </p>
  );

  if (!unlocked) {
    return (
      <section className="relative flex min-h-[100svh] items-center overflow-hidden">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-xl" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/80 to-bg" />
        <div className="container-page relative py-32">
          <div className="mx-auto max-w-xl text-center">
            <Link href="/evenements" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
              <IconArrowLeft size={16} /> Tous les événements
            </Link>
            <p className="eyebrow mt-10">{CATEGORY_LABELS[event.category]} · Galerie privée</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] sm:text-6xl">{event.title}</h1>
            <div className="flex justify-center">{meta}</div>
            <div className="card mt-10 p-6 text-left sm:p-8">
              <CodeForm slug={event.slug} autoFocus size="lg" label="Entrez le code d'accès de la galerie" />
              <p className="mt-2 text-xs leading-relaxed text-faint">
                Le code vous a été transmis par l&apos;organisateur. Pas de code ?{" "}
                <Link href={`/contact?evenement=${event.slug}`} className="underline hover:text-fg">Écrivez-moi</Link>.
              </p>
            </div>
            <p className="mt-6 text-sm text-muted">
              À partir de {formatPrice(event.pricing.unit)} la photo · fichiers HD sans filigrane
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="container-page pt-28 sm:pt-36">
      <Link href="/evenements" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
        <IconArrowLeft size={16} /> Tous les événements
      </Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-end">
        <div>
          <p className="eyebrow">{CATEGORY_LABELS[event.category]}</p>
          <h1 className="mt-3 font-display text-5xl leading-[0.95] sm:text-6xl">{event.title}</h1>
          {meta}
        </div>
        {event.description && <p className="text-sm leading-relaxed text-muted lg:text-right">{event.description}</p>}
      </div>
      {event.demo && (
        <p className="mt-6 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
          Galerie de démonstration — les paiements sont simulés. {event.search === "bib" ? "Essayez les dossards 27, 115 ou 202." : ""}
        </p>
      )}
      <div className="mt-8">
        <Suspense>
          <EventGallery event={toGalleryEvent(event)} paymentReady={stripeEnabled} />
        </Suspense>
      </div>
    </div>
  );
}
