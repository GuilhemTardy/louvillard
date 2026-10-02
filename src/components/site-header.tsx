"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconClose, IconLock, IconMenu } from "./icons";

const NAV = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/evenements", label: "Événements" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ name }: { name: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const overHero = pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        overHero ? "bg-transparent" : "bg-bg/85 backdrop-blur-md border-b border-line"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6 sm:h-20">
        <Link href="/" className="font-display text-2xl tracking-wide sm:text-[1.7rem]" onClick={close}>
          {name}
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Navigation principale">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${active ? "text-fg" : "text-muted hover:text-fg"}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <Link href="/acces" className="btn btn-primary btn-sm">
            <IconLock size={15} /> Mes photos
          </Link>
        </nav>
        <button
          type="button"
          className="-mr-2 p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {open ? <IconClose size={24} /> : <IconMenu size={24} />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="fixed inset-0 top-16 z-40 bg-bg md:hidden">
          <nav className="container-page flex flex-col gap-1 pt-8" aria-label="Navigation mobile">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="animate-fade-up border-b border-line py-4 font-display text-4xl"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/acces" onClick={close} className="btn btn-primary mt-8 w-full">
              <IconLock size={16} /> Accéder à mes photos
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
