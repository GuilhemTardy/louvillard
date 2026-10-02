import Link from "next/link";
import { CATEGORY_LABELS, type PublicEvent } from "@/lib/types";
import { IconCalendar, IconImage, IconLock, IconPin } from "./icons";

export function formatDate(date: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  return new Intl.DateTimeFormat("fr-FR", { ...opts, timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}

export function coverUrl(event: Pick<PublicEvent, "slug" | "coverId">, variant: "thumb" | "large" = "thumb") {
  return event.coverId ? `/api/photos/${event.slug}/${event.coverId}/${variant}` : null;
}

export function EventCard({ event, unlocked }: { event: PublicEvent; unlocked?: boolean }) {
  const cover = coverUrl(event);
  return (
    <Link href={`/evenements/${event.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-soft">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/10" />
        <span className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs tracking-wide backdrop-blur">
          {CATEGORY_LABELS[event.category]}
        </span>
        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-xs backdrop-blur">
          {unlocked ? <>Ouvert</> : <><IconLock size={13} /> Privé</>}
        </span>
        <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 text-xs text-white/85">
          <IconImage size={14} /> {event.photoCount} photos
        </span>
      </div>
      <div className="mt-4">
        <h3 className="font-display text-2xl leading-tight transition-colors group-hover:text-accent">{event.title}</h3>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5"><IconCalendar size={14} /> {formatDate(event.date)}</span>
          {event.location && <span className="inline-flex items-center gap-1.5"><IconPin size={14} /> {event.location}</span>}
        </p>
      </div>
    </Link>
  );
}
