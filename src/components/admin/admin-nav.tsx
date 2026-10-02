"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Galeries", exact: true },
  { href: "/admin/evenements/nouveau", label: "Nouvel événement" },
  { href: "/admin/commandes", label: "Ventes" },
];

export function AdminNav({ name }: { name: string }) {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.refresh();
  }
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-6">
        <Link href="/admin" className="font-display text-xl">
          {name} <span className="ml-1 rounded bg-accent/15 px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-widest text-accent">admin</span>
        </Link>
        <nav className="flex flex-1 gap-1 overflow-x-auto text-sm">
          {LINKS.map((l) => {
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={`whitespace-nowrap rounded-full px-3 py-1.5 ${active ? "bg-soft text-fg" : "text-muted hover:text-fg"}`}>
                {l.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/" className="hidden text-sm text-muted hover:text-fg sm:inline" target="_blank">Voir le site ↗</Link>
        <button type="button" onClick={logout} className="text-sm text-muted hover:text-fg">Déconnexion</button>
      </div>
    </header>
  );
}
