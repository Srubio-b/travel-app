import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type PackageDestinationSummary = {
  slug: string;
  name: string;
  country: string;
};

export type PackageCardData = {
  id: string;
  title: string;
  slug: string;
  price: number;
  durationDays: number;
  isNational: boolean;
  primaryImage: { url: string; altText: string | null } | null;
  destinations: PackageDestinationSummary[];
};

export type ListPackagesOptions = {
  tipo?: "nacional" | "internacional";
};

type ListPackagesRow = {
  id: string;
  title: string;
  slug: string;
  price: number;
  duration_days: number;
  is_national: boolean;
  package_images: {
    url: string;
    alt_text: string | null;
    is_primary: boolean;
  }[];
  package_destinations: {
    destinations: {
      slug: string;
      name: string;
      country: string;
    } | null;
  }[];
};

/**
 * Lists active, published packages for the public catalog grid.
 * Optionally filters by `tipo` (nacional | internacional).
 * Resolves storage paths to public URLs via the `package-images` bucket.
 */
export async function listPackages(
  supabase: SupabaseClient<Database>,
  options?: ListPackagesOptions,
): Promise<PackageCardData[]> {
  let query = supabase
    .from("travel_packages")
    .select(
      `
      id, title, slug, price, duration_days, is_national,
      package_images (url, alt_text, is_primary),
      package_destinations (
        destinations ( slug, name, country )
      )
    `,
    )
    .eq("is_active", true)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (options?.tipo === "nacional") {
    query = query.eq("is_national", true);
  } else if (options?.tipo === "internacional") {
    query = query.eq("is_national", false);
  }

  const { data, error } = await query;

  if (error) {
    console.error("listPackages: failed to fetch packages from Supabase:", error);
    return [];
  }

  const rows = (data ?? []) as unknown as ListPackagesRow[];

  return rows.map((row) => {
    const images = row.package_images ?? [];
    const primary = images.find((img) => img.is_primary) ?? images[0] ?? null;
    const primaryImage = primary
      ? {
          url: supabase.storage
            .from("package-images")
            .getPublicUrl(primary.url).data.publicUrl,
          altText: primary.alt_text,
        }
      : null;

    const destinations = (row.package_destinations ?? [])
      .map((pd) => pd.destinations)
      .filter((d): d is PackageDestinationSummary => d !== null);

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      price: row.price,
      durationDays: row.duration_days,
      isNational: row.is_national,
      primaryImage,
      destinations,
    };
  });
}
