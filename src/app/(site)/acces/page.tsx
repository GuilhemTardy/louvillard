import type { Metadata } from "next";
import Link from "next/link";
import { CodeForm } from "@/components/code-form";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Accéder à mes photos",
  description: "Entrez votre code d'accès pour retrouver vos photos d'événement.",
};

export default function AccessPage() {
  return (
    <section className="container-page flex min-h-[85svh] items-center pb-20 pt-32">
      <div className="mx-auto w-full max-w-xl">
        <p className="eyebrow">Espace participants</p>
        <h1 className="mt-4 font-display text-5xl leading-[0.95] sm:text-7xl">Retrouvez vos photos</h1>
        <p className="mt-6 leading-relaxed text-muted">
          Saisissez le code d&apos;accès de votre événement. Il figure sur le message de l&apos;organisateur, votre billet ou
          le mail de confirmation d&apos;inscription.
        </p>
        <div className="card mt-10 p-6 sm:p-8">
          <CodeForm autoFocus size="lg" />
        </div>
        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {site.steps.map((s, i) => (
            <li key={s.title}>
              <span className="display text-4xl">0{i + 1}</span>
              <p className="mt-2 text-sm font-medium">{s.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-sm text-muted">
          Code perdu ? <Link href="/contact" className="text-fg underline underline-offset-4">Contactez-moi</Link> en
          précisant l&apos;événement.
        </p>
      </div>
    </section>
  );
}
