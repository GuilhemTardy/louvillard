"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { EASE } from "./reveal";

const NAV = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/evenements", label: "Événements" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ name, meta }: { name: string; meta: string }) {
  const pathname = usePathname();
  const overHero = pathname === "/";
  const [scrolled, setScrolled] = useState(!overHero);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!overHero) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- en-tête plein hors accueil
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- ferme le menu à la navigation
  useEffect(() => setOpen(false), [pathname]);

  const [first, ...rest] = name.split(" ");
  const solid = scrolled || open;

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: overHero ? 1.4 : 0, duration: 0.9, ease: EASE }}
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
        className={`fixed inset-x-0 top-0 z-40 px-5 pb-4 transition-colors duration-500 md:px-10 ${
          solid ? "border-b border-line bg-bg/85 text-fg backdrop-blur-md" : "text-white"
        }`}
      >
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="display text-[22px] leading-none md:text-[26px]" aria-label={`${name}, accueil`}>
            {first} <span className={solid ? "text-muted" : "text-white/60"}>{rest.join(" ")}</span>
          </Link>
          <p className={`mono hidden lg:block ${solid ? "text-muted" : "text-white/70"}`}>{meta}</p>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Navigation principale">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`link-u pb-0.5 text-[14px] ${active ? "link-u-on" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/acces"
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                solid ? "bg-fg text-bg hover:bg-black" : "bg-white text-black hover:bg-white/85"
              }`}
            >
              Mes photos
            </Link>
          </nav>
          <button
            type="button"
            className="mono -mr-1 p-1 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? "Fermer" : "Menu"}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-30 flex flex-col justify-end bg-bg px-5 pb-10 md:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav className="flex flex-col" aria-label="Navigation mobile">
              {[...NAV, { href: "/acces", label: "Mes photos" }].map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.7, ease: EASE }}
                >
                  <Link href={item.href} className="display block border-b border-line py-3 text-[15vw] leading-[0.9]">
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <p className="mono mt-8 text-muted">{meta}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
