import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";
import { TOOLS } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  return LOCALES.flatMap((locale) => [{ url: `${base}/${locale}` }, ...TOOLS.map((tool) => ({ url: `${base}/${locale}/${tool.slug}` }))]);
}
