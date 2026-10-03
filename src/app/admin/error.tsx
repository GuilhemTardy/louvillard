"use client";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="card p-8">
      <p className="font-display text-3xl">Erreur</p>
      <p className="mt-2 text-sm text-muted">{error.message || "Un problème est survenu."}</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-6">Réessayer</button>
    </div>
  );
}
