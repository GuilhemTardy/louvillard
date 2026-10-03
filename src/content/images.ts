/**
 * Photos du site public. Remplacer par les images de Lou :
 *  - soit un identifiant Unsplash (`id`),
 *  - soit un fichier dans /public (`src: "/photos/mon-image.jpg"`).
 */
export type SiteImage = { id?: string; src?: string; alt: string };

export const unsplash = (id: string, w = 1600, h?: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ""}&q=80`;

export const srcOf = (image: SiteImage, w = 1600) => image.src ?? (image.id ? unsplash(image.id, w) : "");

const WIDTHS = [640, 960, 1400, 2000];
export const srcSetOf = (image: SiteImage) =>
  image.id && !image.src ? WIDTHS.map((w) => `${unsplash(image.id!, w)} ${w}w`).join(", ") : undefined;
