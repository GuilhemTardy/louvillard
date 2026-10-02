import Image from "next/image";
import Link from "next/link";
import { CodeForm } from "@/components/code-form";
import { EventCard } from "@/components/event-card";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { IconArrowRight } from "@/components/icons";
import { portfolio } from "@/content/portfolio";
import { site } from "@/content/site";
import { unlockedSlugs } from "@/lib/access";
import { listEvents, toPublicEvent } from "@/lib/events";

const CATEGORIES = [
  { key: "spectacle", title: "Spectacle", text: "Danse, théâtre, galas" },
  { key: "concert", title: "Concert", text: "Scène, public, backstage" },
  { key: "trail", title: "Trail", text: "Courses nature & montagne" },
] as const;

export default async function HomePage() {
  const [events, unlocked] = await Promise.all([listEvents(), unlockedSlugs()]);
  const recent = events.filter((e) => e.listed).slice(0, 3).map(toPublicEvent);
  const slides = portfolio.filter((p) => p.width > p.height).slice(0, 5);
  const selection = portfolio.slice(0, 7);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[100svh] items-end overflow-hidden">
        <HeroSlideshow slides={slides} />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-black/30" />
        <div className="container-page relative grid gap-10 pb-12 pt-32 sm:pb-16 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div className="animate-fade-up">
            <p className="eyebrow text-fg/80">Photographe d&apos;événements</p>
            <h1 className="mt-4 font-display text-[clamp(3.5rem,11vw,9rem)] leading-[0.9] tracking-tight">{site.name}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg/85 sm:text-xl">
              Scène, spectacle <span className="font-display italic text-accent">&amp;</span> trail. Des images qui gardent
              l&apos;émotion d&apos;un instant qui ne se rejoue pas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/portfolio" className="btn btn-ghost bg-black/20 backdrop-blur">
                Voir le portfolio
              </Link>
              <Link href="/contact" className="btn btn-ghost bg-black/20 backdrop-blur">
                Demander un devis
              </Link>
            </div>
          </div>
          <div className="card animate-fade-up bg-elevated/80 p-6 backdrop-blur-md [animation-delay:150ms] sm:p-8">
            <p className="font-display text-3xl leading-tight">Retrouvez vos photos</p>
            <p className="mt-2 mb-5 text-sm leading-relaxed text-muted">
              Vous avez participé à un spectacle ou une course ? Entrez le code reçu de l&apos;organisateur.
            </p>
            <CodeForm />
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="container-page py-24 sm:py-32">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <p className="eyebrow">L&apos;approche</p>
          <p className="font-display text-3xl leading-snug sm:text-[2.6rem] sm:leading-[1.15]">{site.intro}</p>
        </div>
      </section>

      {/* Catégories */}
      <section className="container-page">
        <div className="grid gap-4 md:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const img = portfolio.find((p) => p.category === cat.key && p.width > p.height) ?? portfolio[0];
            return (
              <Link
                key={cat.key}
                href={`/portfolio?categorie=${cat.key}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl md:aspect-[3/4]"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                  <div>
                    <p className="font-display text-4xl">{cat.title}</p>
                    <p className="mt-1 text-sm text-white/75">{cat.text}</p>
                  </div>
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-white/30 transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-ink">
                    <IconArrowRight size={18} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Étapes */}
      <section className="container-page py-24 sm:py-32">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Participants</p>
            <h2 className="mt-3 max-w-xl font-display text-4xl leading-tight sm:text-5xl">
              Vos photos en trois étapes
            </h2>
          </div>
          <Link href="/acces" className="btn btn-primary self-start md:self-auto">
            J&apos;ai un code <IconArrowRight size={16} />
          </Link>
        </div>
        <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {site.steps.map((step, i) => (
            <li key={step.title} className="bg-bg p-8">
              <span className="font-display text-5xl italic text-accent">0{i + 1}</span>
              <p className="mt-6 text-lg font-medium">{step.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Derniers événements */}
      {recent.length > 0 && (
        <section className="container-page pb-24 sm:pb-32">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Galeries</p>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl">Derniers événements</h2>
            </div>
            <Link href="/evenements" className="hidden items-center gap-2 text-sm text-muted hover:text-fg sm:inline-flex">
              Tous les événements <IconArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((event) => (
              <EventCard key={event.slug} event={event} unlocked={unlocked.includes(event.slug)} />
            ))}
          </div>
          <Link href="/evenements" className="btn btn-ghost mt-10 w-full sm:hidden">
            Tous les événements
          </Link>
        </section>
      )}

      {/* Sélection */}
      <section className="border-y border-line bg-elevated py-24 sm:py-32">
        <div className="container-page">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Portfolio</p>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl">Sélection</h2>
            </div>
            <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
              Tout voir <IconArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-10 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[240px] md:grid-cols-4">
            {selection.map((img, i) => (
              <Link
                key={img.src}
                href="/portfolio"
                className={`group relative overflow-hidden rounded-xl ${
                  i === 0 ? "col-span-2 row-span-2" : i === 3 ? "row-span-2" : ""
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Organisateurs */}
      <section className="container-page py-24 sm:py-32">
        <div className="card relative overflow-hidden p-8 sm:p-14">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
          <p className="eyebrow">Organisateurs</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
            Vous organisez un spectacle, un gala ou une course ?
          </h2>
          <p className="mt-6 max-w-2xl leading-relaxed text-muted">
            Je couvre l&apos;événement, puis je mets en ligne une galerie privée : vos participants retrouvent et achètent
            leurs photos eux-mêmes. Aucune gestion de votre côté, et la possibilité de reverser une part des ventes à votre
            association.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-primary">
              Parlons de votre événement <IconArrowRight size={16} />
            </Link>
            <Link href="/a-propos#prestations" className="btn btn-ghost">
              Prestations
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
