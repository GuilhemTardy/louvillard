import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { IconInstagram, IconMail, IconPin } from "@/components/icons";
import { site } from "@/content/site";
import { getEvent } from "@/lib/events";

export const metadata: Metadata = {
  title: "Contact & devis",
  description: `Contactez ${site.name} pour photographier votre spectacle, gala, concert ou trail.`,
};

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const { evenement } = await searchParams;
  const event = typeof evenement === "string" ? await getEvent(evenement) : null;
  return (
    <section className="container-page pb-24 pt-32 sm:pt-40">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-3 font-display text-5xl leading-[0.95] sm:text-7xl">Parlons de votre événement</h1>
          <p className="mt-6 max-w-md leading-relaxed text-muted">
            Spectacle de fin d&apos;année, gala, concert ou course nature : décrivez-moi votre projet, je vous réponds sous
            48 h avec une proposition.
          </p>
          <ul className="mt-10 space-y-4 text-sm">
            <li>
              <a href={`mailto:${site.email}`} className="inline-flex items-center gap-3 hover:text-accent">
                <IconMail size={18} /> {site.email}
              </a>
            </li>
            <li>
              <a href={site.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 hover:text-accent">
                <IconInstagram size={18} /> {site.instagramHandle}
              </a>
            </li>
            <li className="inline-flex items-center gap-3 text-muted">
              <IconPin size={18} /> {site.city}
            </li>
          </ul>
        </div>
        <ContactForm email={site.email} defaultSubject={event ? `Code d'accès — ${event.title}` : undefined} />
      </div>
    </section>
  );
}
