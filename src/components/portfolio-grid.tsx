"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { srcOf } from "@/content/images";
import type { Series } from "@/content/portfolio";
import { CATEGORY_LABELS } from "@/lib/types";
import { Lightbox } from "./lightbox";
import { Photo } from "./photo";
import { FadeUp } from "./reveal";

export function PortfolioGrid({ series }: { series: Series[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("categorie");
  const [open, setOpen] = useState<{ s: number; i: number } | null>(null);

  const categories = useMemo(() => [...new Set(series.map((s) => s.category))], [series]);
  const visible = active ? series.filter((s) => s.category === active) : series;
  const current = open ? visible[open.s] : null;

  return (
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
        <button type="button" className="chip" aria-pressed={!active} onClick={() => router.replace("/portfolio", { scroll: false })}>
          Tout
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className="chip"
            aria-pressed={active === cat}
            onClick={() => router.replace(`/portfolio?categorie=${cat}`, { scroll: false })}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="mt-16 space-y-28">
        {visible.map((s, si) => (
          <article key={s.slug} className="protect" onContextMenu={(e) => e.preventDefault()}>
            <FadeUp className="grid gap-6 border-t border-fg/15 pt-6 md:grid-cols-12">
              <p className="mono text-muted md:col-span-3">
                {String(si + 1).padStart(2, "0")} — {CATEGORY_LABELS[s.category]}
              </p>
              <h2 className="display text-[clamp(2.6rem,6vw,5.5rem)] md:col-span-6">{s.title}</h2>
              <div className="md:col-span-3">
                <p className="mono text-muted">
                  {s.place} · {s.year}
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{s.text}</p>
              </div>
            </FadeUp>
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-4">
              {s.images.map((img, i) => {
                const span =
                  i % 4 === 0 ? "col-span-2 md:col-span-7 aspect-[4/3]" : i % 4 === 1 ? "md:col-span-5 aspect-[4/5]" : i % 4 === 2 ? "md:col-span-5 aspect-[4/5]" : "col-span-2 md:col-span-7 aspect-[4/3]";
                return (
                  <FadeUp key={`${img.id}-${i}`} delay={(i % 2) * 0.08} className={span}>
                    <button
                      type="button"
                      onClick={() => setOpen({ s: si, i })}
                      className="group block h-full w-full overflow-hidden rounded-[2px]"
                      aria-label={`Agrandir : ${img.alt}`}
                    >
                      <Photo
                        image={img}
                        className="h-full w-full"
                        imgClassName="transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
                        sizes="(min-width: 768px) 60vw, 100vw"
                        w={1400}
                      />
                    </button>
                  </FadeUp>
                );
              })}
            </div>
          </article>
        ))}
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
