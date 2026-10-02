"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = (await res.json()) as { error?: string };
    if (res.ok) router.refresh();
    else {
      setError(data.error ?? "Erreur.");
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-[100svh] items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm p-8">
        <p className="font-display text-3xl">Espace photographe</p>
        <p className="mt-2 text-sm text-muted">Connectez-vous pour gérer vos galeries.</p>
        {!configured && (
          <p className="mt-4 rounded-lg bg-danger/10 p-3 text-xs text-danger">
            Variable ADMIN_PASSWORD non définie : ajoutez-la dans Vercel (ou .env.local) puis redéployez.
          </p>
        )}
        <label htmlFor="pw" className="label mt-6">Mot de passe</label>
        <input id="pw" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus autoComplete="current-password" />
        {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
        <button className="btn btn-primary mt-6 w-full" disabled={pending || !password}>
          {pending ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
