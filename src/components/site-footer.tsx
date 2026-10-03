import Link from "next/link";
import { site } from "@/content/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer id="contact" className="relative mt-auto overflow-hidden bg-accent px-5 pb-8 pt-28 text-accent-ink md:px-10 md:pt-40">
      <p className="mono text-white/50">Contact</p>
      <a href={`mailto:${site.email}`} className="group mt-6 block">
        <span className="display block text-[clamp(3.6rem,13vw,13rem)]">
          On en parle <span className="inline-block transition-transform duration-500 group-hover:translate-x-4">→</span>
        </span>
        <span className="link-u mt-4 inline-block pb-1 text-[clamp(1.1rem,2.4vw,1.8rem)] text-white/70 group-hover:text-white">
          {site.email}
        </span>
      </a>

      <div className="mt-16 flex flex-wrap gap-3">
        <a
          href={site.instagram}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/25 px-5 py-2.5 text-[13px] transition-colors hover:bg-white hover:text-black"
        >
          Instagram
        </a>
        <Link href="/contact" className="rounded-full border border-white/25 px-5 py-2.5 text-[13px] transition-colors hover:bg-white hover:text-black">
          Demander un devis
        </Link>
        <Link href="/acces" className="rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-black transition-colors hover:bg-white/85">
          Accéder à mes photos
        </Link>
      </div>

      <div className="mono mt-24 grid gap-6 border-t border-white/15 pt-6 text-white/50 md:grid-cols-4">
        <p>© {year} {site.name}</p>
        <p>{site.city}</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Liens utiles">
          <Link className="hover:text-white" href="/commande">Retrouver ma commande</Link>
          <Link className="hover:text-white" href="/a-propos#faq">FAQ</Link>
        </nav>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end" aria-label="Informations légales">
          <Link className="hover:text-white" href="/cgv">CGV</Link>
          <Link className="hover:text-white" href="/mentions-legales">Mentions légales</Link>
        </nav>
      </div>
    </footer>
  );
}
