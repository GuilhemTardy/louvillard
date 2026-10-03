import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/photo";
import { ClipReveal, FadeUp, Line } from "@/components/reveal";
import { portrait } from "@/content/portfolio";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "À propos & prestations",
  description: `${site.name}, photographe de spectacles, concerts et trails. Prestations, déroulé et questions fréquentes.`,
};

const PROCESS = [
  ["Avant", "Un échange pour comprendre l'événement, le lieu, les moments clés, et fixer le code d'accès."],
  ["Pendant", "Une présence discrète, sans flash en salle, plusieurs postes sur les parcours de trail."],
  ["Après", "Tri, retouche, mise en ligne sous quelques jours. Vos participants achètent en autonomie."],
] as const;

export default function AboutPage() {
  return (
    <>
      <section className="px-5 pb-28 pt-36 md:px-10 md:pt-44">
        <p className="mono text-muted">À propos</p>
        <h1 className="display mt-5 text-[clamp(4rem,13vw,12rem)]">
          <Line>Bonjour,</Line>
          <Line delay={0.1}>c&apos;est Lou.</Line>
        </h1>
        <div className="mt-20 grid gap-12 md:grid-cols-12 md:gap-8">
          <ClipReveal className="md:col-span-5">
            <Photo image={portrait} className="aspect-[4/5] w-full" sizes="(min-width:768px) 40vw, 100vw" w={1400} priority />
          </ClipReveal>
          <div className="md:col-span-6 md:col-start-7">
            {site.about.map((p, i) => (
              <FadeUp key={p.slice(0, 24)} delay={i * 0.05}>
                <p className={`max-w-xl leading-[1.7] ${i === 0 ? "text-[22px] text-fg" : "mt-6 text-[17px] text-muted"}`}>{p}</p>
              </FadeUp>
            ))}
            <div className="mt-12 flex flex-wrap gap-3">
              <Link href="/contact" className="rounded-full bg-fg px-6 py-3 text-[14px] font-medium text-bg hover:bg-black">
                Me contacter →
              </Link>
              <Link href="/portfolio" className="rounded-full border border-fg/20 px-6 py-3 text-[14px] hover:border-fg">
                Portfolio
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="prestations" className="scroll-mt-24 bg-accent px-5 py-28 text-accent-ink md:px-10 md:py-36">
        <p className="mono text-white/50">Prestations</p>
        <h2 className="display mt-5 max-w-5xl text-[clamp(3rem,7vw,6.5rem)]">
          <Line inView>Couverture, galerie</Line>
          <Line inView delay={0.1}>privée, vente en ligne.</Line>
        </h2>
        <div className="mt-16 grid border-t border-white/15 md:grid-cols-2">
          {site.services.map((s, i) => (
            <FadeUp
              key={s.title}
              delay={(i % 2) * 0.08}
              className={`border-b border-white/15 py-10 ${i % 2 ? "md:border-l md:pl-10" : "md:pr-10"}`}
            >
              <p className="mono text-white/50">{String(i + 1).padStart(2, "0")}</p>
              <p className="display mt-3 text-[clamp(2rem,3.4vw,3rem)]">{s.title}</p>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/65">{s.text}</p>
            </FadeUp>
          ))}
        </div>
        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {PROCESS.map(([t, d]) => (
            <FadeUp key={t}>
              <p className="mono text-white">{t}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-white/65">{d}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 px-5 py-28 md:px-10 md:py-36">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="mono text-muted">Questions fréquentes</p>
            <h2 className="display mt-5 text-[clamp(3rem,6vw,5.5rem)]">
              <Line inView>Bon à</Line>
              <Line inView delay={0.1}>savoir</Line>
            </h2>
          </div>
          <div className="divide-y divide-fg/15 border-y border-fg/15 md:col-span-7 md:col-start-6">
            {site.faq.map((item) => (
              <details key={item.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[18px]">
                  {item.q}
                  <span className="mono text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 max-w-2xl leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
