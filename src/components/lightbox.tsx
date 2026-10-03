"use client";

import { useCallback, useEffect, useRef } from "react";
import { IconChevronLeft, IconChevronRight, IconClose } from "./icons";

export type LightboxItem = { src: string; alt: string; width: number; height: number };

type Props = {
  items: LightboxItem[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
  caption?: (index: number) => React.ReactNode;
  actions?: (index: number) => React.ReactNode;
};

export function Lightbox({ items, index, onIndexChange, caption, actions }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const open = index !== null && index >= 0 && index < items.length;

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      onIndexChange((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onIndexChange(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [open, go, onIndexChange]);

  if (!open) return null;
  const item = items[index];
  const neighbours = [items[(index + 1) % items.length], items[(index - 1 + items.length) % items.length]];

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      tabIndex={-1}
      className="protect fixed inset-0 z-50 flex flex-col bg-[#050505] outline-none"
      onContextMenu={(e) => e.preventDefault()}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm text-white/70 sm:px-6">
        <span className="tabular-nums">
          {index + 1} / {items.length}
        </span>
        <div className="min-w-0 flex-1 truncate text-center">{caption?.(index)}</div>
        <button type="button" onClick={() => onIndexChange(null)} className="-mr-2 p-2 text-white hover:text-accent" aria-label="Fermer">
          <IconClose size={26} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={item.src}
          src={item.src}
          alt={item.alt}
          className="max-h-full max-w-full object-contain animate-[fade-up_0.35s_ease-out]"
          draggable={false}
        />
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:block"
              aria-label="Photo précédente"
            >
              <IconChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:block"
              aria-label="Photo suivante"
            >
              <IconChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {actions && <div className="flex justify-center gap-3 px-4 py-4">{actions(index)}</div>}

      {/* Préchargement des voisines */}
      <div className="hidden" aria-hidden="true">
        {neighbours.map((n) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={n.src} src={n.src} alt="" />
        ))}
      </div>
    </div>
  );
}
