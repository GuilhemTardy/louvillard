import type { Metadata } from "next";
import { Suspense } from "react";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { Line } from "@/components/reveal";
import { series } from "@/content/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Spectacles, concerts et trails : une sélection de séries de Lou Villard.",
};

export default function PortfolioPage() {
  return (
    <div className="px-5 pb-28 pt-36 md:px-10 md:pt-44">
      <p className="mono text-muted">Portfolio</p>
      <h1 className="display mt-5 text-[clamp(4rem,13vw,12rem)]">
        <Line>Instants</Line>
        <Line delay={0.1}>choisis</Line>
      </h1>
      <p className="mt-8 max-w-xl text-[17px] leading-[1.7] text-muted">
        Scènes de danse et de théâtre, concerts, sentiers au lever du jour. Une sélection personnelle, mise à jour au fil
        de la saison.
      </p>
      <div className="mt-14">
        <Suspense>
          <PortfolioGrid series={series} />
        </Suspense>
      </div>
    </div>
  );
}
