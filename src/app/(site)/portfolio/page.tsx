import type { Metadata } from "next";
import { Suspense } from "react";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { portfolio } from "@/content/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Spectacles, concerts et trails : une sélection d'images de Lou Villard.",
};

export default function PortfolioPage() {
  return (
    <div className="container-page pb-24 pt-32 sm:pt-40">
      <p className="eyebrow">Portfolio</p>
      <h1 className="mt-3 font-display text-5xl leading-none sm:text-7xl">Instants choisis</h1>
      <p className="mt-6 max-w-2xl leading-relaxed text-muted">
        Scènes de danse et de théâtre, concerts, sentiers au lever du jour. Une sélection personnelle, mise à jour au fil
        de la saison.
      </p>
      <div className="mt-12">
        <Suspense>
          <PortfolioGrid items={portfolio} />
        </Suspense>
      </div>
    </div>
  );
}
