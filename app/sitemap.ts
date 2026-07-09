import type { MetadataRoute } from "next";
import { routing } from "@/lib/i18n/routing";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://laviajesyaventuras.com";

/**
 * Minimal static sitemap for Phase 1 (homepage only, per-locale).
 * Dynamic entries for packages/destinations land in PR 2/3 once those
 * routes exist.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.map((locale) => ({
    url: `${BASE_URL}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${BASE_URL}/${l}`]),
      ),
    },
  }));
}
