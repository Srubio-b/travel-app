import type { MetadataRoute } from "next";
import { routing } from "@/lib/i18n/routing";
import { SITE_URL as BASE_URL } from "@/lib/config/site";
import { createPublicClient } from "@/lib/supabase/public";
import { getAllActiveSlugs } from "@/lib/supabase/queries";

// Statically generate the sitemap and refresh it every 5 minutes, matching
// the ISR window used by the catalog listing/detail pages.
export const revalidate = 300;

function withAlternates(path: string) {
  return {
    url: `${BASE_URL}${path === "" ? "" : path}`,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${BASE_URL}/${l}${path}`]),
      ),
    },
  };
}

/**
 * Dynamic sitemap covering the homepage, catalog, packages, and
 * destinations, per locale, with hreflang alternates (es/en). Package and
 * destination slugs are fetched from Supabase so newly published content
 * is discoverable without a manual sitemap update.
 */
function buildStaticEntries(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) => [
    {
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: withAlternates("").alternates,
    },
    {
      url: `${BASE_URL}/${locale}/paquetes`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
      alternates: withAlternates("/paquetes").alternates,
    },
  ]);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = buildStaticEntries();

  try {
    const supabase = createPublicClient();
    const { packages, destinations } = await getAllActiveSlugs(supabase);

    const packageEntries: MetadataRoute.Sitemap = routing.locales.flatMap(
      (locale) =>
        packages.map(({ slug }) => ({
          url: `${BASE_URL}/${locale}/paquetes/${slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
          alternates: withAlternates(`/paquetes/${slug}`).alternates,
        })),
    );

    const destinationEntries: MetadataRoute.Sitemap = routing.locales.flatMap(
      (locale) =>
        destinations.map(({ slug }) => ({
          url: `${BASE_URL}/${locale}/destinos/${slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
          alternates: withAlternates(`/destinos/${slug}`).alternates,
        })),
    );

    return [...staticEntries, ...packageEntries, ...destinationEntries];
  } catch (error) {
    console.error(
      "sitemap: failed to build dynamic entries from Supabase, falling back to static entries only:",
      error,
    );
    return staticEntries;
  }
}
