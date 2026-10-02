import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "@/components/icons";
import { portfolio } from "@/content/portfolio";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "À propos & prestations",
  description: `${site.name}, photographe de spectacles, concerts et trails. Prestations, déroulé et questions fréquentes.`,
};

export default function AboutPage() {
  const portrait = portfolio.find((p) => p.height > p.width) ?? portfolio[0];
  return (
    <>
      <section className="container-page pb-20 pt-32 sm:pt-40">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-soft lg:sticky lg:top-28 lg:self-start">
            <Image src={portrait.src} alt={`Portrait de ${site.name}`} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow">À propos</p>
            <h1 className="mt-3 font-display text-5xl leading-[0.95] sm:text-7xl">
              Bonjour, je suis <span className="italic text-accent">Lou</span>.
            </h1>
            <div className="prose-lv mt-10 text-lg">
              {site.about.map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-primary">Me contacter <IconArrowRight size={16} /></Link>
              <Link href="/portfolio" className="btn btn-ghost">Portfolio</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="prestations" className="scroll-mt-24 border-y border-line bg-elevated py-24">
        <div className="container-page">
          <p className="eyebrow">Prestations</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Couverture photo, galerie privée, vente en ligne : tout est inclus
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {site.services.map((s) => (
              <div key={s.title} className="bg-elevated p-8">
                <p className="font-display text-3xl">{s.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              ["Avant", "Un échange pour comprendre l'événement, le lieu, les moments clés, et fixer le code d'accès."],
              ["Pendant", "Une présence discrète, sans flash en salle, plusieurs postes sur les parcours de trail."],
              ["Après", "Tri, retouche, mise en ligne sous quelques jours. Vos participants achètent en autonomie."],
            ].map(([t, d]) => (
              <div key={t}>
                <p className="font-display text-2xl italic text-accent">{t}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="container-page scroll-mt-24 py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow">Questions fréquentes</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">Bon à savoir</h2>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {site.faq.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg">
                  {item.q}
                  <span className="text-2xl text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
