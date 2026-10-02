/**
 * Génère le contenu de démonstration (images procédurales) :
 *   - assets/watermark.png         motif de filigrane des aperçus
 *   - public/portfolio/*.jpg       images du portfolio public
 *   - src/content/portfolio.json   légendes du portfolio
 *   - seed/events/*.json           événements de démo
 *   - seed/photos/<slug>/<id>/*    originaux + aperçus filigranés
 *
 * Usage : npm run demo:generate
 * À remplacer par les vraies photos de Lou (voir README).
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { processPhoto } from "../src/lib/images.ts";
import type { EventRecord, Photo } from "../src/lib/types.ts";

const ROOT = process.cwd();
const W = 1800;
const H = 1200;

function rng(seed: number) {
  seed = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
  const next = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = 0; i < 8; i++) next();
  return next;
}
type Rand = ReturnType<typeof rng>;
const pick = <T,>(r: Rand, list: readonly T[]) => list[Math.floor(r() * list.length)];
const between = (r: Rand, a: number, b: number) => a + r() * (b - a);

function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
}

// ---------------------------------------------------------------- scènes

const STAGE_PALETTES = [
  ["#ff6a3d", "#ffb347", "#2a0f0a"],
  ["#5b7cff", "#b46bff", "#0a0b26"],
  ["#ff3d7f", "#ffc1d9", "#21070f"],
  ["#3de0ff", "#4d6bff", "#04131c"],
  ["#ffd27a", "#fff3d6", "#1c1408"],
  ["#ff4d4d", "#7a5cff", "#12061a"],
  ["#37e2a6", "#d6ff7a", "#04140e"],
];

function curtains(r: Rand) {
  const fold = (x0: number, w: number, dir: 1 | -1) => {
    const n = 7;
    return Array.from({ length: n }, (_, i) => {
      const x = x0 + dir * (i / n) * w;
      const fw = w / n;
      return `<rect x="${dir === 1 ? x : x - fw}" y="0" width="${fw + 2}" height="${H}" fill="url(#fold)"/>`;
    }).join("");
  };
  const w = between(r, W * 0.1, W * 0.17);
  return `<g opacity="0.95">${fold(0, w, 1)}${fold(W, w, -1)}</g>
    <path d="M0,0 H${W} V${H * 0.09} Q${W * 0.75},${H * 0.15} ${W / 2},${H * 0.1} Q${W * 0.25},${H * 0.15} 0,${H * 0.09} Z" fill="url(#valance)"/>`;
}

function stageScene(r: Rand, kind: "spectacle" | "concert") {
  const [c1, c2, dark] = pick(r, STAGE_PALETTES);
  const floorY = H * between(r, 0.74, 0.84);
  const cones = Array.from({ length: kind === "concert" ? 8 : 5 }, (_, i) => {
    const x = kind === "concert" ? (i + 0.5) * (W / 8) + between(r, -40, 40) : between(r, W * 0.15, W * 0.85);
    const spread = between(r, 120, 380);
    const target = x + between(r, -420, 420);
    const fromBottom = kind === "concert" && r() > 0.55;
    const y0 = fromBottom ? floorY + 30 : kind === "concert" ? H * 0.08 : -40;
    const y1 = fromBottom ? -60 : floorY;
    return `<polygon points="${x - 10},${y0} ${x + 10},${y0} ${target + spread},${y1} ${target - spread},${y1}" fill="url(#cone${i % 2})" opacity="${between(r, 0.3, 0.75).toFixed(2)}" filter="url(#soft)"/>`;
  }).join("");

  const truss =
    kind === "concert"
      ? `<rect x="0" y="${H * 0.06}" width="${W}" height="${H * 0.025}" fill="#0b0b0e"/>` +
        Array.from({ length: 8 }, (_, i) => `<circle cx="${(i + 0.5) * (W / 8)}" cy="${H * 0.085}" r="10" fill="${i % 2 ? c1 : c2}" filter="url(#bokeh)"/>`).join("")
      : "";

  const crowd =
    kind === "concert"
      ? Array.from({ length: 30 }, (_, i) => {
          const x = (i / 29) * W + between(r, -25, 25);
          const y = H - between(r, 20, 110);
          const s = between(r, 0.8, 1.15);
          return `<ellipse cx="${x}" cy="${y}" rx="${46 * s}" ry="${58 * s}" fill="#030304"/><rect x="${x - 85 * s}" y="${y + 40 * s}" width="${170 * s}" height="180" rx="60" fill="#030304"/>`;
        }).join("")
      : "";

  const bokeh = Array.from({ length: 30 }, () => {
    const rr = between(r, 4, 34);
    return `<circle cx="${between(r, 0, W)}" cy="${between(r, 0, floorY)}" r="${rr}" fill="${pick(r, [c1, c2, "#ffffff"])}" opacity="${between(r, 0.06, 0.32).toFixed(2)}" filter="url(#bokeh)"/>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dark}"/><stop offset="1" stop-color="#050406"/></linearGradient>
    <linearGradient id="cone0" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}" stop-opacity="0.95"/><stop offset="1" stop-color="${c1}" stop-opacity="0.04"/></linearGradient>
    <linearGradient id="cone1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c2}" stop-opacity="0.9"/><stop offset="1" stop-color="${c2}" stop-opacity="0.04"/></linearGradient>
    <radialGradient id="floorGlow" cx="0.5" cy="0" r="0.6"><stop offset="0" stop-color="${c2}" stop-opacity="0.32"/><stop offset="1" stop-color="${c2}" stop-opacity="0"/></radialGradient>
    <radialGradient id="haze" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="${c1}" stop-opacity="0.3"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/></radialGradient>
    <linearGradient id="fold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a0405"/><stop offset="0.45" stop-color="#6b0f16"/><stop offset="0.6" stop-color="#8a1a22"/><stop offset="1" stop-color="#1a0405"/></linearGradient>
    <linearGradient id="valance" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0507"/><stop offset="1" stop-color="#5d0c12"/></linearGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="bokeh"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="edge"><feGaussianBlur stdDeviation="1.4"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#haze)"/>
  ${cones}
  ${truss}
  <rect y="${floorY}" width="${W}" height="${H - floorY}" fill="#09080b"/>
  <ellipse cx="${W / 2}" cy="${floorY}" rx="${W * 0.55}" ry="${(H - floorY) * 0.8}" fill="url(#floorGlow)"/>
  ${kind === "spectacle" ? curtains(r) : ""}
  ${bokeh}
  <g filter="url(#edge)">${crowd}</g>
</svg>`;
}

const SKIES = [
  ["#1b2a4a", "#e9875a", "#f6c88f"],
  ["#2b3f63", "#9fb6d6", "#f0e3cf"],
  ["#13202c", "#476a7d", "#d7c7a3"],
  ["#3a2340", "#e36f5a", "#ffd39a"],
  ["#173041", "#6aa3b8", "#e8f1ee"],
];

function ridge(r: Rand, baseY: number, amp: number, rough: number) {
  const pts: [number, number][] = [];
  const n = 60;
  let y = baseY;
  for (let i = 0; i <= n; i++) {
    y += between(r, -rough, rough);
    y = Math.max(baseY - amp, Math.min(baseY + amp * 0.4, y));
    pts.push([(i / n) * W, y]);
  }
  return { d: `M0,${H} L${pts.map((p) => p.join(",")).join(" L")} L${W},${H} Z`, pts };
}

function pine(x: number, base: number, h: number, fill: string) {
  const w = h * 0.36;
  const tiers = 4;
  let out = `<rect x="${x - h * 0.02}" y="${base - h * 0.12}" width="${h * 0.04}" height="${h * 0.12}" fill="${fill}"/>`;
  for (let i = 0; i < tiers; i++) {
    const ty = base - h * 0.1 - (i * h * 0.85) / tiers;
    const tw = w * (1 - i / (tiers + 1));
    out += `<polygon points="${x - tw / 2},${ty} ${x + tw / 2},${ty} ${x},${ty - h * 0.38}" fill="${fill}"/>`;
  }
  return out;
}

function trailScene(r: Rand, close: boolean) {
  const [top, mid, low] = pick(r, SKIES);
  const layers = [0.4, 0.5, 0.6, 0.71].map((f, i) => {
    const t = i / 3;
    const { d } = ridge(r, H * f, 180 - i * 24, 38 - i * 5);
    return `<path d="${d}" fill="${mix(mid, "#0d1412", 0.25 + t * 0.7)}"/>
      <rect y="${H * f - 30}" width="${W}" height="90" fill="${low}" opacity="${(0.2 - i * 0.04).toFixed(2)}" filter="url(#mist)"/>`;
  });
  const sunX = between(r, W * 0.15, W * 0.85);
  const fg = ridge(r, H * (close ? 0.86 : 0.9), 50, 12);
  const trees = Array.from({ length: close ? 9 : 14 }, () => {
    const p = fg.pts[Math.floor(between(r, 0, fg.pts.length))];
    return pine(p[0], p[1] + 10, between(r, close ? 160 : 90, close ? 340 : 200), "#0a0f0d");
  }).join("");
  const path = `<path d="M${between(r, 0, W * 0.3)},${H} C${W * 0.4},${H * 0.92} ${W * 0.55},${H * 0.85} ${between(r, W * 0.55, W)},${H * 0.76}" stroke="${low}" stroke-opacity="0.22" stroke-width="${close ? 26 : 14}" fill="none" stroke-linecap="round"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="0.6" stop-color="${mid}"/><stop offset="1" stop-color="${low}"/></linearGradient>
    <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff6e0" stop-opacity="0.95"/><stop offset="0.22" stop-color="${low}" stop-opacity="0.55"/><stop offset="1" stop-color="${low}" stop-opacity="0"/></radialGradient>
    <filter id="mist"><feGaussianBlur stdDeviation="24"/></filter>
    <filter id="dof"><feGaussianBlur stdDeviation="${close ? 5 : 0.6}"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#sky)"/>
  <circle cx="${sunX}" cy="${H * 0.36}" r="420" fill="url(#sun)"/>
  <g filter="url(#dof)">${layers.join("")}</g>
  <path d="${fg.d}" fill="#0e1311"/>
  ${path}
  ${trees}
</svg>`;
}
async function render(svg: string, quality = 84) {
  return sharp(Buffer.from(svg)).jpeg({ quality, mozjpeg: true }).toBuffer();
}

// ---------------------------------------------------------------- watermark

async function writeWatermark() {
  const w = 560;
  const h = 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <g transform="rotate(-24 ${w / 2} ${h / 2})" font-family="DejaVu Serif" text-anchor="middle">
      <text x="${w / 2}" y="${h / 2 - 6}" font-size="44" letter-spacing="10" fill="#ffffff" fill-opacity="0.34" stroke="#000000" stroke-opacity="0.18" stroke-width="1">LOU VILLARD</text>
      <text x="${w / 2}" y="${h / 2 + 34}" font-family="DejaVu Sans" font-size="17" letter-spacing="7" fill="#ffffff" fill-opacity="0.3">APERÇU · PREVIEW</text>
    </g>
  </svg>`;
  await mkdir(path.join(ROOT, "assets"), { recursive: true });
  await sharp(Buffer.from(svg)).png().toFile(path.join(ROOT, "assets", "watermark.png"));
}

// ---------------------------------------------------------------- portfolio

async function writePortfolio() {
  const dir = path.join(ROOT, "public", "portfolio");
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const items: { src: string; alt: string; category: string; width: number; height: number }[] = [];
  const plan: [string, string][] = [
    ["spectacle", "Solo contemporain, lumière rasante"],
    ["trail", "Lever de soleil sur les crêtes"],
    ["concert", "Premier rang, dernier morceau"],
    ["spectacle", "Gala de fin d'année — tableau final"],
    ["trail", "Dans la montée du col"],
    ["concert", "Contre-jour au festival"],
    ["spectacle", "Le saut, à 1/1000e"],
    ["trail", "Brume du matin, km 8"],
    ["spectacle", "Saluts"],
    ["concert", "La voix et la foule"],
    ["trail", "Arrivée au sommet"],
    ["spectacle", "Duo, répétition générale"],
  ];
  for (const [i, [category, alt]] of plan.entries()) {
    const r = rng(1000 + i * 17);
    const svg =
      category === "trail"
        ? trailScene(r, i % 2 === 0)
        : stageScene(r, category as "spectacle" | "concert");
    const portrait = i % 4 === 1;
    let img = sharp(await render(svg, 86));
    if (portrait) img = img.extract({ left: 500, top: 0, width: 800, height: 1200 });
    const out = await img.resize({ width: 1600, height: 1600, fit: "inside" }).jpeg({ quality: 80, mozjpeg: true }).toBuffer({ resolveWithObject: true });
    const file = `${String(i + 1).padStart(2, "0")}-${category}.jpg`;
    await writeFile(path.join(dir, file), out.data);
    items.push({ src: `/portfolio/${file}`, alt, category, width: out.info.width, height: out.info.height });
  }
  await mkdir(path.join(ROOT, "src", "content"), { recursive: true });
  await writeFile(path.join(ROOT, "src", "content", "portfolio.json"), JSON.stringify(items, null, 2) + "\n");
}

// ---------------------------------------------------------------- événements

type DemoSpec = Omit<EventRecord, "photos" | "createdAt" | "updatedAt"> & {
  count: number;
  seed: number;
  scene: (r: Rand, i: number) => { svg: string; bibs: string[]; tags: string[] };
  start: string;
};

const TRAIL_BIBS = ["12", "27", "48", "101", "115", "134", "202", "248", "251", "307", "333", "412"];
const TRAIL_SPOTS = ["Départ", "Km 9 — Col de l'Arc", "Km 18 — Crête", "Arrivée"];
const GALA_PARTS = ["Ouverture", "Classique", "Jazz", "Contemporain", "Hip-hop", "Final & saluts"];
const FESTIVAL_PARTS = ["Scène Lune", "Scène Soleil", "Public", "Backstage"];

const DEMOS: DemoSpec[] = [
  {
    slug: "trail-des-cretes-2026",
    title: "Trail des Crêtes 2026",
    category: "trail",
    date: "2026-09-13",
    location: "Vercors (38)",
    description:
      "32 km et 1 900 m D+ entre lever de soleil et brume du matin. Entrez votre numéro de dossard pour retrouver toutes vos photos.",
    accessCodes: ["CRETES26"],
    listed: true,
    demo: true,
    search: "bib",
    pricing: { unit: 600, bundles: [{ quantity: 3, price: 1500 }, { quantity: 6, price: 2400 }], all: null },
    count: 30,
    seed: 42,
    start: "2026-09-13T07:30:00+02:00",
    scene: (r, i) => {
      const spotIndex = Math.min(3, Math.floor(i / 8));
      const close = r() > 0.35;
      const bib = TRAIL_BIBS[Math.floor(r() * TRAIL_BIBS.length)];
      const bib2 = TRAIL_BIBS[Math.floor(r() * TRAIL_BIBS.length)];
      const bibs = close ? [bib] : bib2 === bib ? [bib] : [bib, bib2];
      return { svg: trailScene(r, close), bibs, tags: [TRAIL_SPOTS[spotIndex]] };
    },
  },
  {
    slug: "gala-compagnie-etoile-2026",
    title: "Gala de danse — Compagnie Étoile",
    category: "spectacle",
    date: "2026-06-20",
    location: "Théâtre municipal, Grenoble",
    description:
      "Le gala de fin d'année de la Compagnie Étoile : six tableaux, quatre-vingts danseuses et danseurs. Filtrez par tableau pour retrouver votre enfant.",
    accessCodes: ["ETOILE26"],
    listed: true,
    demo: true,
    search: "tags",
    pricing: { unit: 500, bundles: [{ quantity: 5, price: 2000 }, { quantity: 10, price: 3500 }], all: 6900 },
    count: 30,
    seed: 7,
    start: "2026-06-20T20:00:00+02:00",
    scene: (r, i) => ({ svg: stageScene(r, "spectacle"), bibs: [], tags: [GALA_PARTS[Math.floor(i / 5)]] }),
  },
  {
    slug: "festival-nuits-de-juillet",
    title: "Festival Nuits de Juillet",
    category: "concert",
    date: "2026-07-18",
    location: "Lyon",
    description: "Deux scènes, une nuit d'été. Galerie réservée aux artistes et à l'organisation.",
    accessCodes: ["NUITS26"],
    listed: true,
    demo: true,
    search: "tags",
    pricing: { unit: 800, bundles: [{ quantity: 5, price: 3000 }], all: 9000 },
    count: 18,
    seed: 99,
    start: "2026-07-18T21:00:00+02:00",
    scene: (r, i) => ({ svg: stageScene(r, "concert"), bibs: [], tags: [FESTIVAL_PARTS[i % 4]] }),
  },
];

async function writeEvents() {
  await rm(path.join(ROOT, "seed"), { recursive: true, force: true });
  await mkdir(path.join(ROOT, "seed", "events"), { recursive: true });
  for (const spec of DEMOS) {
    const { count, seed, scene, start, ...base } = spec;
    const r = rng(seed);
    const photos: Photo[] = [];
    for (let i = 0; i < count; i++) {
      const { svg, bibs, tags } = scene(r, i);
      const original = await render(svg, 82);
      const id = `${spec.slug.slice(0, 3)}${String(i + 1).padStart(3, "0")}`;
      const dir = path.join(ROOT, "seed", "photos", spec.slug, id);
      await mkdir(dir, { recursive: true });
      const processed = await processPhoto(original);
      await writeFile(path.join(dir, "original.jpg"), original);
      await writeFile(path.join(dir, "thumb.jpg"), processed.thumb);
      await writeFile(path.join(dir, "large.jpg"), processed.large);
      photos.push({
        id,
        filename: `LV_${String(i + 1).padStart(4, "0")}.jpg`,
        width: processed.width,
        height: processed.height,
        takenAt: new Date(new Date(start).getTime() + i * 6 * 60_000).toISOString(),
        bibs,
        tags,
        originalKey: `photos/${spec.slug}/${id}/original.jpg`,
      });
    }
    const record: EventRecord = {
      ...base,
      coverId: photos[spec.category === "trail" ? 2 : 0].id,
      photos,
      createdAt: "2026-09-20T10:00:00.000Z",
      updatedAt: "2026-09-20T10:00:00.000Z",
    };
    await writeFile(path.join(ROOT, "seed", "events", `${spec.slug}.json`), JSON.stringify(record, null, 2) + "\n");
    console.log(`✓ ${spec.title} (${photos.length} photos)`);
  }
}

await writeWatermark();
console.log("✓ filigrane");
await writePortfolio();
console.log("✓ portfolio");
await writeEvents();
