"use client";

import { motion } from "motion/react";
import { useState } from "react";
import type { Series } from "@/content/portfolio";
import { srcOf } from "@/content/images";
import { CATEGORY_LABELS } from "@/lib/types";
import { Lightbox } from "./lightbox";
import { Photo } from "./photo";
import { EASE } from "./reveal";

const pad = (n: number) => String(n).padStart(2, "0");

/** Séries en défilement horizontal, ouvertes en plein écran au clic. */
export function SeriesRail({ series }: { series: Series[] }) {
  const [open, setOpen] = useState<{ s: number; i: number } | null>(null);
  const current = open ? series[open.s] : null;

  return (
    <>
      <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 md:-mx-10 md:gap-6 md:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {series.map((s, i) => {
          const portrait = i % 2 === 0;
          return (
            <motion.button
              key={s.slug}
              type="button"
              onClick={() => setOpen({ s: i, i: 0 })}
              className={`group relative h-[58vh] max-w-[88vw] shrink-0 snap-start text-left md:h-[64vh] ${portrait ? "aspect-[4/5]" : "aspect-[4/3]"}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px -10% 0px 0px" }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              <div className="relative h-full overflow-hidden rounded-[2px]">
                <Photo
                  image={s.images[0]}
                  className="h-full w-full"
                  imgClassName="transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
                  sizes="(min-width: 900px) 50vw, 88vw"
                  w={1400}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/20" />
                <p className="mono absolute left-4 top-4 text-white/85">
                  {pad(i + 1)} / {pad(series.length)}
                </p>
                <p className="mono absolute right-4 top-4 text-white/85">{s.images.length} photos</p>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-6">
                  <p className="mono text-white/70">
                    {CATEGORY_LABELS[s.category]} · {s.place} · {s.year}
                  </p>
                  <p className="display mt-2 text-[clamp(2.2rem,4.4vw,4rem)]">{s.title}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {current && open && (
        <Lightbox
          items={current.images.map((img) => ({ src: srcOf(img, 2000), alt: img.alt, width: 3, height: 2 }))}
          index={open.i}
          onIndexChange={(i) => setOpen(i === null ? null : { s: open.s, i })}
          caption={(i) => `${current.title} — ${current.images[i]?.alt ?? ""}`}
        />
      )}
    </>
  );
}
