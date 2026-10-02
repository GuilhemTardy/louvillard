"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { PortfolioItem } from "@/content/portfolio";
import { CATEGORY_LABELS } from "@/lib/types";
import { Lightbox } from "./lightbox";

export function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("categorie");
  const [open, setOpen] = useState<number | null>(null);

  const categories = useMemo(() => [...new Set(items.map((i) => i.category))], [items]);
  const visible = active ? items.filter((i) => i.category === active) : items;

  function select(cat: string | null) {
    const url = cat ? `/portfolio?categorie=${cat}` : "/portfolio";
    router.replace(url, { scroll: false });
  }

  return (
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
        <button type="button" className="chip" aria-pressed={!active} onClick={() => select(null)}>
          Tout
        </button>
        {categories.map((cat) => (
          <button key={cat} type="button" className="chip" aria-pressed={active === cat} onClick={() => select(cat)}>
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="protect mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {visible.map((item, i) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setOpen(i)}
            onContextMenu={(e) => e.preventDefault()}
            className="group relative block w-full break-inside-avoid overflow-hidden rounded-xl bg-soft"
            aria-label={`Agrandir : ${item.alt}`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              draggable={false}
            />
            <span className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/75 to-transparent p-4 text-left text-sm opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              {item.alt}
            </span>
          </button>
        ))}
      </div>

      <Lightbox
        items={visible.map((v) => ({ src: v.src, alt: v.alt, width: v.width, height: v.height }))}
        index={open}
        onIndexChange={setOpen}
        caption={(i) => visible[i]?.alt}
      />
    </>
  );
}
