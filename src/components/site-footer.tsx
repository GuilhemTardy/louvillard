import Link from "next/link";
import { site } from "@/content/site";
import { IconInstagram, IconMail } from "./icons";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-line">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl">{site.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{site.tagline}. {site.city}.</p>
          <div className="mt-6 flex gap-3">
            <a href={`mailto:${site.email}`} className="btn btn-ghost btn-sm" aria-label="E-mail">
              <IconMail size={16} /> {site.email}
            </a>
            <a href={site.instagram} className="btn btn-ghost btn-sm" aria-label="Instagram" target="_blank" rel="noreferrer">
              <IconInstagram size={16} />
            </a>
          </div>
        </div>
        <div>
          <p className="eyebrow mb-4">Explorer</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="text-muted hover:text-fg" href="/portfolio">Portfolio</Link></li>
            <li><Link className="text-muted hover:text-fg" href="/evenements">Événements</Link></li>
            <li><Link className="text-muted hover:text-fg" href="/a-propos">À propos & prestations</Link></li>
            <li><Link className="text-muted hover:text-fg" href="/contact">Contact & devis</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Vos photos</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="text-muted hover:text-fg" href="/acces">Accéder avec un code</Link></li>
            <li><Link className="text-muted hover:text-fg" href="/a-propos#faq">Questions fréquentes</Link></li>
            <li><Link className="text-muted hover:text-fg" href="/cgv">Conditions de vente</Link></li>
            <li><Link className="text-muted hover:text-fg" href="/mentions-legales">Mentions légales</Link></li>
          </ul>
        </div>
      </div>
      <div className="container-page flex flex-col gap-2 border-t border-line py-6 text-xs text-faint sm:flex-row sm:justify-between">
        <p>© {year} {site.name}. Toutes les photographies sont protégées par le droit d&apos;auteur.</p>
        <p>Paiement sécurisé par Stripe</p>
      </div>
    </footer>
  );
}
