"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconArrowRight, IconLock } from "./icons";

type Props = {
  slug?: string;
  autoFocus?: boolean;
  size?: "md" | "lg";
  label?: string;
};

export function CodeForm({ slug, autoFocus, size = "md", label = "Code d'accès" }: Props) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length < 3) {
      setError("Saisissez votre code d'accès.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, slug }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Code incorrect.");
      router.push(data.url);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setPending(false);
    }
  }

  const lg = size === "lg";
  return (
    <form onSubmit={submit} noValidate className="w-full">
      <label htmlFor={`code-${slug ?? "global"}`} className="label">
        {label}
      </label>
      <div className={`flex gap-2 ${lg ? "flex-col sm:flex-row" : ""}`}>
        <div className="relative flex-1">
          <IconLock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
          <input
            id={`code-${slug ?? "global"}`}
            className={`input pl-11 font-mono uppercase tracking-[0.18em] ${lg ? "py-4 text-lg" : ""}`}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="VOTRE CODE"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            autoFocus={autoFocus}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `code-error-${slug ?? "global"}` : undefined}
            maxLength={40}
          />
        </div>
        <button type="submit" className={`btn btn-primary ${lg ? "py-4" : ""}`} disabled={pending}>
          {pending ? "Vérification…" : "Accéder"} {!pending && <IconArrowRight size={16} />}
        </button>
      </div>
      <p id={`code-error-${slug ?? "global"}`} role="alert" className="mt-2 min-h-5 text-sm text-danger">
        {error}
      </p>
    </form>
  );
}
