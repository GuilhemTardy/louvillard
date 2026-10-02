import type { Metadata } from "next";
import Link from "next/link";
import { CodeForm } from "@/components/code-form";
import { EventCard } from "@/components/event-card";
import { unlockedSlugs } from "@/lib/access";
import { listEvents, toPublicEvent } from "@/lib/events";
import { CATEGORY_LABELS, type EventCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Événements",
  description: "Galeries privées des spectacles, concerts et trails photographiés par Lou Villard.",
};

export default async function EventsPage({ searchParams }: PageProps<"/evenements">) {
  const { categorie } = await searchParams;
  const [all, unlocked] = await Promise.all([listEvents(), unlockedSlugs()]);
  const listed = all.filter((e) => e.listed).map(toPublicEvent);
  const categories = [...new Set(listed.map((e) => e.category))];
  const active = typeof categorie === "string" && categories.includes(categorie as EventCategory) ? categorie : null;
  const events = active ? listed.filter((e) => e.category === active) : listed;

  return (
    <div className="container-page pb-24 pt-32 sm:pt-40">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <p className="eyebrow">Galeries privées</p>
          <h1 className="mt-3 font-display text-5xl leading-none sm:text-7xl">Événements</h1>
          <p className="mt-6 max-w-xl leading-relaxed text-muted">
            Chaque galerie est protégée par un code transmis aux participants. Retrouvez-vous, choisissez vos photos
            préférées et téléchargez-les en haute définition.
          </p>
        </div>
        <div className="card p-6">
          <CodeForm label="Vous avez un code ? Accédez directement à votre galerie" />
        </div>
      </div>

      {categories.length > 1 && (
        <nav className="mt-14 flex flex-wrap gap-2" aria-label="Filtrer les événements">
          <Link href="/evenements" className="chip" aria-pressed={!active} scroll={false}>
            Tous
          </Link>
          {categories.map((c) => (
            <Link key={c} href={`/evenements?categorie=${c}`} className="chip" aria-pressed={active === c} scroll={false}>
              {CATEGORY_LABELS[c]}
            </Link>
          ))}
        </nav>
      )}

      {events.length ? (
        <div className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.slug} event={event} unlocked={unlocked.includes(event.slug)} />
          ))}
        </div>
      ) : (
        <p className="mt-14 text-muted">Les prochaines galeries arrivent bientôt.</p>
      )}
    </div>
  );
}
