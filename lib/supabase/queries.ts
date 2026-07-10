import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Thrown when a Supabase query fails for reasons other than "not found"
 * (network blip, RLS misconfiguration, transient DB error, etc). Callers
 * should let this propagate to the route's error boundary instead of
 * treating it the same as a genuine 404 — a silent 404 on a real backend
 * failure is worse for SEO/monitoring than a visible error.
 */
export class SupabaseQueryError extends Error {
  constructor(message: string, cause: unknown) {
    super(message);
    this.name = "SupabaseQueryError";
    this.cause = cause;
  }
}

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

export type PackageImage = {
  url: string;
  altText: string | null;
  isPrimary: boolean;
};

export type PackageDetailData = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  durationDays: number;
  isNational: boolean;
  whatIncludes: string | null;
  whatExcludes: string | null;
  images: PackageImage[];
  destinations: PackageDestinationSummary[];
};

type PackageDetailRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  duration_days: number;
  is_national: boolean;
  what_includes: string | null;
  what_excludes: string | null;
  package_images: {
    url: string;
    alt_text: string | null;
    is_primary: boolean;
    display_order: number;
  }[];
  package_destinations: {
    destinations: {
      slug: string;
      name: string;
      country: string;
      is_active: boolean;
      deleted_at: string | null;
    } | null;
  }[];
};

/**
 * Fetches a single active, published package by slug for the detail page,
 * including its full image gallery and included destinations.
 * Returns null when not found, inactive, or not yet published.
 */
export async function getPackageBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<PackageDetailData | null> {
  const { data, error } = await supabase
    .from("travel_packages")
    .select(
      `
      id, title, slug, description, price, duration_days, is_national,
      what_includes, what_excludes,
      package_images (url, alt_text, is_primary, display_order),
      package_destinations (
        destinations ( slug, name, country, is_active, deleted_at )
      )
    `,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error(
      `getPackageBySlug: failed to fetch package "${slug}" from Supabase:`,
      error,
    );
    throw new SupabaseQueryError(
      `Failed to fetch package "${slug}" from Supabase`,
      error,
    );
  }

  if (!data) return null;

  const row = data as unknown as PackageDetailRow;

  const images = (row.package_images ?? [])
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => ({
      url: supabase.storage.from("package-images").getPublicUrl(img.url).data
        .publicUrl,
      altText: img.alt_text,
      isPrimary: img.is_primary,
    }));

  const destinations = (row.package_destinations ?? [])
    .map((pd) => pd.destinations)
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .filter((d) => d.is_active && d.deleted_at === null)
    .map(({ slug, name, country }) => ({ slug, name, country }));

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    price: row.price,
    durationDays: row.duration_days,
    isNational: row.is_national,
    whatIncludes: row.what_includes,
    whatExcludes: row.what_excludes,
    images,
    destinations,
  };
}

export type DestinationPackageSummary = {
  slug: string;
  title: string;
  price: number;
  durationDays: number;
  isNational: boolean;
  primaryImage: { url: string; altText: string | null } | null;
};

export type DestinationDetailData = {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: string | null;
  description: string | null;
  imageUrl: string | null;
  packages: DestinationPackageSummary[];
};

type DestinationDetailRow = {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: string | null;
  description: string | null;
  image_url: string | null;
  package_destinations: {
    travel_packages: {
      slug: string;
      title: string;
      price: number;
      duration_days: number;
      is_national: boolean;
      is_active: boolean;
      published_at: string | null;
      deleted_at: string | null;
      package_images: {
        url: string;
        alt_text: string | null;
        is_primary: boolean;
      }[];
    } | null;
  }[];
};

/**
 * Fetches a single active destination by slug for the landing page,
 * including active published packages that include this destination.
 * Returns null when not found or inactive.
 */
export async function getDestinationBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<DestinationDetailData | null> {
  const { data, error } = await supabase
    .from("destinations")
    .select(
      `
      id, slug, name, country, region, description, image_url,
      package_destinations (
        travel_packages (
          slug, title, price, duration_days, is_national,
          is_active, published_at, deleted_at,
          package_images (url, alt_text, is_primary)
        )
      )
    `,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error(
      `getDestinationBySlug: failed to fetch destination "${slug}" from Supabase:`,
      error,
    );
    throw new SupabaseQueryError(
      `Failed to fetch destination "${slug}" from Supabase`,
      error,
    );
  }

  if (!data) return null;

  const row = data as unknown as DestinationDetailRow;

  const now = new Date().toISOString();
  const packages = (row.package_destinations ?? [])
    .map((pd) => pd.travel_packages)
    .filter(
      (tp): tp is NonNullable<typeof tp> =>
        tp !== null &&
        tp.is_active &&
        tp.published_at !== null &&
        tp.published_at <= now &&
        tp.deleted_at === null,
    )
    .map((tp) => {
      const images = tp.package_images ?? [];
      const primary = images.find((img) => img.is_primary) ?? images[0] ?? null;
      const primaryImage = primary
        ? {
            url: supabase.storage
              .from("package-images")
              .getPublicUrl(primary.url).data.publicUrl,
            altText: primary.alt_text,
          }
        : null;

      return {
        slug: tp.slug,
        title: tp.title,
        price: tp.price,
        durationDays: tp.duration_days,
        isNational: tp.is_national,
        primaryImage,
      };
    });

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    country: row.country,
    region: row.region,
    description: row.description,
    imageUrl: row.image_url
      ? supabase.storage.from("package-images").getPublicUrl(row.image_url).data
          .publicUrl
      : null,
    packages,
  };
}

export type ActiveSlugs = {
  packages: { slug: string }[];
  destinations: { slug: string }[];
};

/**
 * Fetches all active, published package slugs and active destination slugs.
 * Used to build the dynamic sitemap with hreflang alternates.
 */
export async function getAllActiveSlugs(
  supabase: SupabaseClient<Database>,
): Promise<ActiveSlugs> {
  const [packagesResult, destinationsResult] = await Promise.all([
    supabase
      .from("travel_packages")
      .select("slug")
      .eq("is_active", true)
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .is("deleted_at", null),
    supabase.from("destinations").select("slug").eq("is_active", true).is("deleted_at", null),
  ]);

  if (packagesResult.error) {
    console.error("getAllActiveSlugs: failed to fetch package slugs:", packagesResult.error);
  }
  if (destinationsResult.error) {
    console.error(
      "getAllActiveSlugs: failed to fetch destination slugs:",
      destinationsResult.error,
    );
  }

  return {
    packages: packagesResult.data ?? [],
    destinations: destinationsResult.data ?? [],
  };
}
