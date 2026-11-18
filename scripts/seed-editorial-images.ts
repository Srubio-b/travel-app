#!/usr/bin/env tsx
/**
 * Editorial image seeding — editorial-redesign (F2 visual validation).
 *
 * Downloads curated royalty-free Unsplash photos (Unsplash License: free for
 * commercial use, no attribution required) for the existing destinations and
 * packages, uploads them to the unified `package-images` bucket using the
 * project's path conventions, and repairs stale `image_url` rows that point
 * to legacy buckets that no longer exist:
 *
 *   destinations/{id}.webp
 *   packages/{package_id}/{display_order}.webp
 *
 * Idempotent: uploads use upsert and package_images rows are deleted +
 * reinserted per package, so it is safe to re-run. Records without a mapping
 * are left untouched.
 *
 * Run with service-role credentials (same pattern as migrate-storage.ts):
 *   npx tsx scripts/seed-editorial-images.ts
 *
 * Requires environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "[seed-images] Missing required environment variables:\n" +
      "  NEXT_PUBLIC_SUPABASE_URL\n" +
      "  SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = "package-images";

type DestinationImage = { unsplashId: string; alt: string };
type PackageImage = { unsplashId: string; alt: string };

/** Curated Unsplash photos per destination slug. */
const DESTINATION_IMAGES: Record<string, DestinationImage> = {
  cancun: {
    unsplashId: "1507525428034-b723cf961d3e",
    alt: "Playa de aguas turquesas con palmeras en el Caribe mexicano",
  },
  cartagena: {
    unsplashId: "1553913861-c0fddf2619ee",
    alt: "Calle colonial caribeña de arquitectura colorida",
  },
  "san-andres": {
    unsplashId: "1540541338287-41700207dee6",
    alt: "Vista aérea de la costa caribeña turquesa",
  },
};

/** Curated Unsplash photos per package slug (index + 1 = display_order). */
const PACKAGE_IMAGES: Record<string, PackageImage[]> = {
  "cancun-internacional": [
    { unsplashId: "1520250497591-112f2f40a3f4", alt: "Piscina de resort frente al mar" },
    { unsplashId: "1540541338287-41700207dee6", alt: "Costa turquesa vista desde el aire" },
  ],
  "cartagena-de-vacaciones": [
    { unsplashId: "1488085061387-422e29b40080", alt: "Playa caribeña paradisíaca" },
    { unsplashId: "1519046904884-53103b34b206", alt: "Sombrillas blancas sobre la arena" },
  ],
  "san-andres-todo-incluido": [
    { unsplashId: "1506929562872-bb421503ef21", alt: "Mar caribeño y arena blanca" },
    { unsplashId: "1507525428034-b723cf961d3e", alt: "Palmeras y aguas turquesas del Caribe" },
  ],
};

async function ensureBucket(): Promise<void> {
  const { data, error } = await supabase.storage.getBucket(BUCKET);

  if (error || !data) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: true,
    });

    if (createError) {
      throw new Error(`[seed-images] Cannot ensure bucket ${BUCKET}: ${createError.message}`);
    }

    console.log(`[seed-images] Created bucket ${BUCKET} (public)`);
    return;
  }

  console.log(`[seed-images] Bucket ${BUCKET} exists (public: ${data.public})`);
}

async function downloadUnsplashImage(unsplashId: string, width: number): Promise<ArrayBuffer> {
  const url = `https://images.unsplash.com/photo-${unsplashId}?w=${width}&q=80&fm=webp`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to download ${url}: HTTP ${res.status}`);
  }

  return res.arrayBuffer();
}

async function uploadToBucket(path: string, bytes: ArrayBuffer): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    upsert: true,
    contentType: "image/webp",
  });

  if (error) {
    throw new Error(`Failed to upload ${BUCKET}/${path}: ${error.message}`);
  }
}

async function seedDestinations(): Promise<void> {
  console.log("[seed-images] Seeding destination images...");

  const { data: rows, error } = await supabase
    .from("destinations")
    .select("id, slug, name")
    .is("deleted_at", null)
    .order("name");

  if (error) {
    throw new Error(`Failed to fetch destinations: ${error.message}`);
  }

  let seeded = 0;
  let skipped = 0;

  for (const row of rows ?? []) {
    const mapping = DESTINATION_IMAGES[row.slug];

    if (!mapping) {
      console.log(`[seed-images]  → skip "${row.slug}" (no mapping)`);
      skipped++;
      continue;
    }

    const path = `destinations/${row.id}.webp`;
    const bytes = await downloadUnsplashImage(mapping.unsplashId, 1600);
    await uploadToBucket(path, bytes);

    const { error: updateError } = await supabase
      .from("destinations")
      .update({ image_url: path })
      .eq("id", row.id);

    if (updateError) {
      throw new Error(`Failed to update destination ${row.slug}: ${updateError.message}`);
    }

    seeded++;
    console.log(`[seed-images]  → ${row.slug}: ${BUCKET}/${path}`);
  }

  console.log(`[seed-images] Destinations: ${seeded} seeded, ${skipped} skipped`);
}

async function seedPackages(): Promise<void> {
  console.log("[seed-images] Seeding package images...");

  const { data: rows, error } = await supabase
    .from("travel_packages")
    .select("id, slug, title")
    .is("deleted_at", null)
    .order("title");

  if (error) {
    throw new Error(`Failed to fetch travel_packages: ${error.message}`);
  }

  let seeded = 0;
  let skipped = 0;

  for (const row of rows ?? []) {
    const mapping = PACKAGE_IMAGES[row.slug];

    if (!mapping) {
      console.log(`[seed-images]  → skip "${row.slug}" (no mapping)`);
      skipped++;
      continue;
    }

    // Fresh state per package: remove stale rows, then insert the new set.
    const { error: deleteError } = await supabase
      .from("package_images")
      .delete()
      .eq("package_id", row.id);

    if (deleteError) {
      throw new Error(`Failed to clear package_images for ${row.slug}: ${deleteError.message}`);
    }

    const inserts: {
      package_id: string;
      url: string;
      alt_text: string;
      display_order: number;
      is_primary: boolean;
    }[] = [];

    for (const [index, image] of mapping.entries()) {
      const displayOrder = index + 1;
      const path = `packages/${row.id}/${displayOrder}.webp`;
      const bytes = await downloadUnsplashImage(image.unsplashId, 1200);
      await uploadToBucket(path, bytes);

      inserts.push({
        package_id: row.id,
        url: path,
        alt_text: image.alt,
        display_order: displayOrder,
        is_primary: displayOrder === 1,
      });
    }

    const { error: insertError } = await supabase.from("package_images").insert(inserts);

    if (insertError) {
      throw new Error(`Failed to insert package_images for ${row.slug}: ${insertError.message}`);
    }

    seeded++;
    console.log(
      `[seed-images]  → ${row.slug}: ${inserts.length} images, primary = packages/${row.id}/1.webp`,
    );
  }

  console.log(`[seed-images] Packages: ${seeded} seeded, ${skipped} skipped`);
}

async function main(): Promise<void> {
  console.log("[seed-images] Starting editorial image seeding...");
  console.log(`[seed-images] Supabase project: ${supabaseUrl}`);

  await ensureBucket();
  await seedDestinations();
  await seedPackages();

  console.log("[seed-images] Done.");
}

main().catch((err) => {
  console.error("[seed-images] Unexpected error:", err);
  process.exit(1);
});
