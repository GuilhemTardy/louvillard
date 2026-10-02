import data from "./portfolio.json";

export type PortfolioItem = {
  src: string;
  alt: string;
  category: "spectacle" | "concert" | "trail" | "evenement";
  width: number;
  height: number;
};

/**
 * Images du portfolio public : fichiers dans `public/portfolio/`,
 * légendes et catégories dans `portfolio.json`.
 */
export const portfolio = data as PortfolioItem[];
