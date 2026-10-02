"use client";

import { useState } from "react";
import { IconArrowRight, IconCheck } from "./icons";

const SUBJECTS = ["Devis spectacle / gala", "Devis trail / course", "Concert / festival", "Code d'accès perdu", "Autre"];

export function ContactForm({ defaultSubject, email }: { defaultSubject?: string; email: string }) {
  const [state, setState] = useState<"idle" | "pending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("pending");
    setError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Envoi impossible.");
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div className="card p-8">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success"><IconCheck size={24} /></span>
        <p className="mt-6 font-display text-3xl">Message envoyé</p>
        <p className="mt-2 text-muted">Merci ! Je vous réponds sous 48 h.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">Nom</label>
          <input id="name" name="name" required className="input" autoComplete="name" />
        </div>
        <div>
          <label htmlFor="email" className="label">E-mail</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" />
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="label">Sujet</label>
        <select id="subject" name="subject" className="input" defaultValue={defaultSubject ?? SUBJECTS[0]}>
          {[...new Set([...(defaultSubject ? [defaultSubject] : []), ...SUBJECTS])].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="message" className="label">Message</label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          rows={6}
          className="input resize-y"
          placeholder="Date, lieu, type d'événement, nombre de participants…"
        />
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error} <a href={`mailto:${email}`} className="underline">{email}</a>
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={state === "pending"}>
        {state === "pending" ? "Envoi…" : "Envoyer"} <IconArrowRight size={16} />
      </button>
    </form>
  );
}
