"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-page flex min-h-[70svh] items-center pb-20 pt-32">
      <div>
        <p className="eyebrow">Erreur</p>
        <h1 className="mt-4 font-display text-6xl">Sous-exposé</h1>
        <p className="mt-4 max-w-md text-muted">Un problème est survenu. Réessayez dans un instant ; si cela persiste, écrivez-moi.</p>
        <div className="mt-8 flex gap-3">
          <button type="button" onClick={reset} className="btn btn-primary">Réessayer</button>
          <Link href="/" className="btn btn-ghost">Accueil</Link>
        </div>
      </div>
    </section>
  );
}
