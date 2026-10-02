import type { Pricing } from "./types";

export type Quote = {
  count: number;
  /** Total en centimes. */
  total: number;
  /** Prix sans lot ni forfait. */
  undiscounted: number;
  /** Détail lisible : « 1 lot de 5 + 2 photos ». */
  breakdown: string;
  all: boolean;
};

/**
 * Prix optimal pour `count` photos : combinaison la moins chère de lots et
 * de photos à l'unité, plafonnée par le prix de la galerie complète.
 */
export function quote(pricing: Pricing, count: number, totalPhotos: number): Quote {
  const undiscounted = count * pricing.unit;
  if (count <= 0) return { count: 0, total: 0, undiscounted: 0, breakdown: "", all: false };

  const bundles = pricing.bundles.filter((b) => b.quantity > 1 && b.price > 0);
  // best[n] = coût minimal pour couvrir au moins n photos
  const best = new Array<number>(count + 1).fill(Infinity);
  const choice = new Array<number>(count + 1).fill(-1);
  best[0] = 0;
  for (let n = 1; n <= count; n++) {
    best[n] = best[n - 1] + pricing.unit;
    choice[n] = -1;
    bundles.forEach((b, i) => {
      const cost = best[Math.max(0, n - b.quantity)] + b.price;
      if (cost < best[n]) {
        best[n] = cost;
        choice[n] = i;
      }
    });
  }

  const total = best[count];
  const usedBundles = new Map<number, number>();
  let singles = 0;
  for (let n = count; n > 0; ) {
    const c = choice[n];
    if (c === -1) {
      singles++;
      n--;
    } else {
      usedBundles.set(c, (usedBundles.get(c) ?? 0) + 1);
      n = Math.max(0, n - bundles[c].quantity);
    }
  }

  const allPrice = pricing.all ?? null;
  // Si la galerie complète revient moins cher, on l'offre : toutes les photos.
  if (allPrice && (count >= totalPhotos || allPrice <= total)) {
    return {
      count: totalPhotos,
      total: allPrice,
      undiscounted: totalPhotos * pricing.unit,
      breakdown: "Galerie complète",
      all: true,
    };
  }

  const parts = [...usedBundles].map(([i, n]) => `${n} lot${n > 1 ? "s" : ""} de ${bundles[i].quantity}`);
  if (singles) parts.push(`${singles} photo${singles > 1 ? "s" : ""}`);
  return { count, total, undiscounted, breakdown: parts.join(" + "), all: false };
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
