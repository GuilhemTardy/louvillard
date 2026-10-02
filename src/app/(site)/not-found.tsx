import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[70svh] items-center pb-20 pt-32">
      <div>
        <p className="eyebrow">Erreur 404</p>
        <h1 className="mt-4 font-display text-6xl">Hors cadre</h1>
        <p className="mt-4 text-muted">Cette page n&apos;existe pas ou a été déplacée.</p>
        <div className="mt-8 flex gap-3">
          <Link href="/" className="btn btn-primary">Accueil</Link>
          <Link href="/evenements" className="btn btn-ghost">Événements</Link>
        </div>
      </div>
    </section>
  );
}
