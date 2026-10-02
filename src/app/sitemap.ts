import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { listEvents } from "@/lib/events";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = (await listEvents()).filter((e) => e.listed);
  const pages = ["", "/portfolio", "/evenements", "/a-propos", "/contact", "/acces", "/cgv", "/mentions-legales"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.6 })),
    ...events.map((e) => ({ url: `${site.url}/evenements/${e.slug}`, lastModified: e.updatedAt, priority: 0.5 })),
  ];
}
