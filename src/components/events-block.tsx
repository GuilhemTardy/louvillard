"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useState } from "react";
import { CATEGORY_LABELS, type PublicEvent } from "@/lib/types";
import { CodeForm } from "./code-form";
import { FadeUp, Line } from "./reveal";

function formatShort(date: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${date}T12:00:00Z`),
  );
}

/** Bloc « Ton code, tes photos » + liste des derniers événements avec aperçu au survol. */
export function EventsBlock({ events }: { events: PublicEvent[] }) {
  const [hover, setHover] = useState<string | null>(null);
  const mx = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const my = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const hovered = events.find((e) => e.slug === hover);

  return (
    <section id="photos" className="px-5 py-28 md:px-10 md:py-40">
      <div className="grid gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        <div>
          <p className="mono text-muted">Photos d&apos;événements</p>
          <h2 className="display mt-5 text-[clamp(3.4rem,8vw,7.5rem)]">
            <Line inView>Ton code,</Line>
            <Line inView delay={0.1}>tes photos.</Line>
          </h2>
          <FadeUp>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-muted">
              Entre le code reçu de l&apos;organisateur, retrouve-toi par dossard ou par tableau, et télécharge tes photos en
              haute définition.
            </p>
            <div className="mt-10 max-w-lg">
              <CodeForm size="lg" />
            </div>
          </FadeUp>
        </div>

        <div
          className="relative"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            mx.set(e.clientX - r.left);
            my.set(e.clientY - r.top);
          }}
          onMouseLeave={() => setHover(null)}
        >
          <div className="mono flex justify-between border-b border-fg/15 pb-3 text-muted">
            <span>Dernières galeries</span>
            <Link href="/evenements" className="link-u text-fg">Tout voir</Link>
          </div>
          <ul>
            {events.map((e) => (
              <li key={e.slug}>
                <Link
                  href={`/evenements/${e.slug}`}
                  onMouseEnter={() => setHover(e.slug)}
                  className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 border-b border-fg/15 py-5 md:gap-8"
                >
                  <span className="mono w-20 text-muted">{formatShort(e.date)}</span>
                  <span>
                    <span className="display block text-[clamp(1.6rem,3vw,2.6rem)] transition-transform duration-500 group-hover:translate-x-2">
                      {e.title}
                    </span>
                    <span className="mono mt-1 block text-muted">
                      {CATEGORY_LABELS[e.category]} · {e.location} · {e.photoCount} photos
                    </span>
                  </span>
                  <span className="mono text-muted transition-colors group-hover:text-fg">→</span>
                </Link>
              </li>
            ))}
          </ul>

          <motion.div
            className="pointer-events-none absolute left-0 top-0 z-10 hidden h-44 w-64 overflow-hidden rounded-[2px] shadow-2xl lg:block"
            style={{ x: mx, y: my, translateX: "-50%", translateY: "-110%" }}
            animate={{ opacity: hovered?.coverId ? 1 : 0, scale: hovered?.coverId ? 1 : 0.9 }}
            transition={{ duration: 0.25 }}
            aria-hidden="true"
          >
            {hovered?.coverId && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/api/photos/${hovered.slug}/${hovered.coverId}/thumb`} alt="" className="h-full w-full object-cover" />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
