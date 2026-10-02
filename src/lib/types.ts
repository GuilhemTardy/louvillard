export type EventCategory = "spectacle" | "concert" | "trail" | "evenement";

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  spectacle: "Spectacle",
  concert: "Concert",
  trail: "Trail",
  evenement: "Événement",
};

/** Tarifs en centimes d'euro. */
export type Pricing = {
  /** Prix d'une photo à l'unité. */
  unit: number;
  /** Lots dégressifs : `quantity` photos pour `price`. */
  bundles: { quantity: number; price: number }[];
  /** Prix de la galerie complète (optionnel). */
  all?: number | null;
};

export type Photo = {
  id: string;
  /** Nom du fichier d'origine (affiché uniquement dans l'admin). */
  filename: string;
  width: number;
  height: number;
  /** ISO 8601, lu dans l'EXIF quand il existe. */
  takenAt?: string | null;
  /** Numéros de dossard visibles (trail). */
  bibs: string[];
  /** Moments, tableaux, points de passage… */
  tags: string[];
  /** Clé de stockage du fichier original HD. */
  originalKey: string;
};

export type EventRecord = {
  slug: string;
  title: string;
  category: EventCategory;
  /** AAAA-MM-JJ */
  date: string;
  location: string;
  description: string;
  /** Codes d'accès (normalisés en majuscules, sans espaces). */
  accessCodes: string[];
  /** Visible dans la liste publique des événements. */
  listed: boolean;
  /** Événement de démonstration : paiement simulé. */
  demo?: boolean;
  /** Mode de recherche proposé aux visiteurs. */
  search: "bib" | "tags";
  coverId?: string | null;
  pricing: Pricing;
  photos: Photo[];
  createdAt: string;
  updatedAt: string;
};

/** Ce qui est envoyé au navigateur (jamais de code ni de clé de stockage). */
export type PublicPhoto = Omit<Photo, "originalKey" | "filename">;

export type PublicEvent = Omit<EventRecord, "accessCodes" | "photos" | "demo"> & {
  demo: boolean;
  photoCount: number;
};

export type GalleryEvent = PublicEvent & { photos: PublicPhoto[] };
