import type { SiteImage } from "./images";

export type Series = {
  slug: string;
  title: string;
  category: "spectacle" | "concert" | "trail";
  place: string;
  year: string;
  text: string;
  images: SiteImage[];
};

export const hero: SiteImage = { id: "1503095396549-807759245b35", alt: "Une scène de théâtre sous les projecteurs" };

export const heroSlides: SiteImage[] = [
  hero,
  { id: "1504025468847-0e438279542c", alt: "Un traileur sur une arête face aux sommets" },
  { id: "1501386761578-eac5c94b800a", alt: "Un concert vu depuis la foule" },
];

/** Séries du portfolio (page d'accueil et page Portfolio). */
export const series: Series[] = [
  {
    slug: "sous-les-projecteurs",
    title: "Sous les projecteurs",
    category: "spectacle",
    place: "Grenoble",
    year: "2026",
    text: "Danse, théâtre, galas : saisir le geste juste, sans flash, au rythme de la scène.",
    images: [
      { id: "1503095396549-807759245b35", alt: "Une scène éclairée devant le public" },
      { id: "1547153760-18fc86324498", alt: "Une danseuse en mouvement" },
      { id: "1518834107812-67b0b7c58434", alt: "Une danseuse classique en pointes" },
      { id: "1507676184212-d03ab07a01bf", alt: "Une salle de spectacle" },
    ],
  },
  {
    slug: "ligne-de-crete",
    title: "Ligne de crête",
    category: "trail",
    place: "Vercors",
    year: "2026",
    text: "Suivre les coureurs là où le terrain décide et où le souffle suit.",
    images: [
      { id: "1504025468847-0e438279542c", alt: "Un traileur sur une arête" },
      { id: "1530143311094-34d807799e8f", alt: "Un coureur en montagne" },
      { id: "1539182972012-585804f77548", alt: "Une silhouette face au relief" },
      { id: "1464822759023-fed622ff2c3b", alt: "Les sommets au petit matin" },
    ],
  },
  {
    slug: "premier-rang",
    title: "Premier rang",
    category: "concert",
    place: "Lyon",
    year: "2025",
    text: "La scène, la foule, et ce moment précis où les deux ne font plus qu'un.",
    images: [
      { id: "1501386761578-eac5c94b800a", alt: "Un concert vu depuis la foule" },
      { id: "1470229722913-7c0e2dbbafd3", alt: "Des lumières de scène" },
      { id: "1514525253161-7a46d19cd819", alt: "Le public sous les projecteurs" },
      { id: "1493225457124-a3eb161ffa5f", alt: "Un groupe sur scène" },
    ],
  },
  {
    slug: "festival",
    title: "Nuits d'été",
    category: "concert",
    place: "Festival",
    year: "2025",
    text: "Confettis, contre-jours et mains levées : la fête vue de l'intérieur.",
    images: [
      { id: "1540039155733-5bb30b53aa14", alt: "Une foule de festival" },
      { id: "1429962714451-bb934ecdc4ec", alt: "Le public d'un festival" },
      { id: "1459749411175-04bf5292ceea", alt: "Une scène de concert" },
      { id: "1516450360452-9312f5e86fc7", alt: "Des mains levées dans la lumière" },
    ],
  },
  {
    slug: "altitude",
    title: "Altitude",
    category: "trail",
    place: "Alpes",
    year: "2025",
    text: "Le relief comme décor, l'effort comme sujet.",
    images: [
      { id: "1506905925346-21bda4d32df4", alt: "Un massif montagneux" },
      { id: "1551632811-561732d1e306", alt: "Des randonneurs sur la crête" },
      { id: "1464822759023-fed622ff2c3b", alt: "Une vallée alpine" },
    ],
  },
];

export const portrait: SiteImage = { id: "1516035069371-29a1b244cc32", alt: "L'appareil de Lou Villard" };
