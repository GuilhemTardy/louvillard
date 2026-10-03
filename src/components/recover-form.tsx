"use client";

import { useState } from "react";
import { IconArrowRight, IconCheck } from "./icons";

export function RecoverForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "pending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("pending");
    setError(null);
    try {
      const res = await fetch("/api/orders/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Demande impossible.");
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demande impossible.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div className="flex gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-success/15 text-success"><IconCheck size={20} /></span>
        <p className="leading-relaxed text-muted">
          Si une commande active est associée à <span className="text-fg">{email}</span>, vous allez recevoir vos liens dans
          quelques minutes. Pensez à vérifier vos spams.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="recover-email" className="label">E-mail utilisé lors de l&apos;achat</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input id="recover-email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="vous@exemple.fr" />
        <button className="btn btn-primary" disabled={state === "pending"}>
          {state === "pending" ? "Envoi…" : "Recevoir mes liens"} <IconArrowRight size={16} />
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    </form>
  );
}
