import Link from "next/link";
import { EventsBlock } from "@/components/events-block";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { Photo } from "@/components/photo";
import { ClipReveal, FadeUp, Line } from "@/components/reveal";
import { SeriesRail } from "@/components/series-rail";
import { heroSlides, portrait, series } from "@/content/portfolio";
import { site } from "@/content/site";
import { listEvents, toPublicEvent } from "@/lib/events";

export default async function HomePage() {
  const events = (await listEvents()).filter((e) => e.listed).slice(0, 4).map(toPublicEvent);

  return (
    <>
      <Hero name={site.name} kicker={site.kicker} disciplines={site.disciplines} slides={heroSlides} />
      <Marquee items={site.marquee} />

      {/* Séries */}
      <section id="series" className="px-5 pt-28 md:px-10 md:pt-40">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="mono text-muted">Séries</p>
            <h2 className="display mt-5 text-[clamp(3.4rem,8vw,7.5rem)]">
              <Line inView>Ce qui ne</Line>
              <Line inView delay={0.1}>se rejoue pas.</Line>
            </h2>
          </div>
          <FadeUp className="flex flex-col justify-end md:col-span-4 md:col-start-9">
            <p className="text-[17px] leading-[1.7] text-muted">{site.intro}</p>
            <Link href="/portfolio" className="mono link-u mt-6 self-start pb-0.5 text-fg">
              Tout le portfolio →
            </Link>
          </FadeUp>
        </div>
        <div className="mt-14">
          <SeriesRail series={series} />
        </div>
      </section>

      {events.length > 0 && <EventsBlock events={events} />}

      {/* Étapes */}
      <section className="border-y border-fg/10 px-5 md:px-10">
        <ol className="grid md:grid-cols-3">
          {site.steps.map((step, i) => (
            <li key={step.title} className={`py-12 md:py-16 ${i ? "border-t border-fg/10 md:border-l md:border-t-0 md:pl-8" : "md:pr-8"}`}>
              <FadeUp delay={i * 0.1}>
                <p className="display text-[clamp(3.5rem,7vw,6rem)]">{String(i + 1).padStart(2, "0")}</p>
                <p className="mono mt-4 text-fg">{step.title}</p>
                <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-muted">{step.text}</p>
              </FadeUp>
            </li>
          ))}
        </ol>
      </section>

      {/* À propos */}
      <section id="apropos" className="px-5 py-28 md:px-10 md:py-40">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <ClipReveal className="md:col-span-5">
            <Photo image={portrait} className="aspect-[4/5] w-full" sizes="(min-width:768px) 40vw, 100vw" w={1400} />
          </ClipReveal>
          <div className="flex flex-col justify-between md:col-span-6 md:col-start-7">
            <div>
              <p className="mono text-muted">À propos</p>
              <h2 className="display mt-5 text-[clamp(3rem,6vw,5.8rem)]">
                <Line inView>Discrète en salle,</Line>
                <Line inView delay={0.1}>au plus près</Line>
                <Line inView delay={0.2}>sur les sentiers.</Line>
              </h2>
              {site.about.slice(0, 2).map((p) => (
                <FadeUp key={p.slice(0, 24)}>
                  <p className="mt-6 max-w-xl text-[17px] leading-[1.7] text-muted">{p}</p>
                </FadeUp>
              ))}
            </div>
            <div className="mt-14">
              <p className="mono mb-4 text-muted">Prestations</p>
              <ul className="flex flex-wrap gap-2">
                {site.services.map((s) => (
                  <li key={s.title} className="rounded-full border border-fg/15 px-4 py-2 text-[13px]">
                    {s.title}
                  </li>
                ))}
              </ul>
              <Link href="/a-propos" className="mono link-u mt-8 inline-block pb-0.5">
                En savoir plus →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Organisateurs */}
      <section className="px-5 pb-28 md:px-10 md:pb-40">
        <div className="border-t border-fg/10 pt-12">
          <div className="grid gap-10 md:grid-cols-12">
            <h2 className="display text-[clamp(2.6rem,5.5vw,5rem)] md:col-span-7">
              <Line inView>Vous organisez</Line>
              <Line inView delay={0.1}>un gala, un concert</Line>
              <Line inView delay={0.2}>ou une course ?</Line>
            </h2>
            <FadeUp className="flex flex-col justify-end md:col-span-4 md:col-start-9">
              <p className="text-[16px] leading-[1.7] text-muted">
                Je couvre l&apos;événement et je mets en ligne une galerie privée : vos participants retrouvent et achètent
                leurs photos eux-mêmes. Aucune gestion de votre côté.
              </p>
              <Link href="/contact" className="mt-8 self-start rounded-full bg-fg px-6 py-3 text-[14px] font-medium text-bg transition-colors hover:bg-black">
                Parlons de votre événement →
              </Link>
            </FadeUp>
          </div>
        </div>
      </section>
    </>
  );
}
