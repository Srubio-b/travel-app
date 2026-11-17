#!/usr/bin/env tsx
/**
 * Storage migration script — polish-and-refactor / Fase 1.
 *
 * Idempotently copies objects from the legacy buckets (`destinos`, `paquetes`)
 * into the unified `package-images` bucket using paths derived from row IDs:
 *
 *   destinations/{id}.webp
 *   packages/{package_id}/{display_order}.webp
 *
 * Objects in the old buckets that cannot be associated to a DB row are copied
 * to `package-images/orphaned/{timestamp}/{bucket}/{path}` for manual review.
 *
 * Run with service-role credentials, for example:
 *   tsx scripts/migrate-storage.ts
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
    "[migrate-storage] Missing required environment variables:\n" +
      "  NEXT_PUBLIC_SUPABASE_URL\n" +
      "  SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type StorageRef = { bucket: string; path: string };
type ListedObject = { name: string; id: string | null };

function parseStorageUrl(url: string): StorageRef | null {
  if (!url) return null;

  // Already a relative path that starts with the legacy bucket name.
  if (!url.startsWith("http") && !url.startsWith("/")) {
    if (url.startsWith("destinos/")) {
      return { bucket: "destinos", path: url.slice("destinos/".length) };
    }
    if (url.startsWith("paquetes/")) {
      return { bucket: "paquetes", path: url.slice("paquetes/".length) };
    }
    return null;
  }

  // Full public URL: https://.../storage/v1/object/public/{bucket}/{path}
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (match) {
      return { bucket: match[1], path: match[2] };
    }
  } catch {
    // ignore malformed URLs
  }

  return null;
}

async function objectExists(bucket: string, path: string): Promise<boolean> {
  const parts = path.split("/");
  const fileName = parts.pop() ?? path;
  const prefix = parts.join("/");

  const { data, error } = await supabase.storage.from(bucket).list(prefix || "", {
    search: fileName,
    limit: 10,
  });

  if (error || !data) return false;
  return data.some((obj: ListedObject) => obj.name === fileName && obj.id !== null);
}

async function copyObject(
  sourceBucket: string,
  sourcePath: string,
  targetPath: string,
): Promise<boolean> {
  const { data, error: downloadError } = await supabase.storage
    .from(sourceBucket)
    .download(sourcePath);

  if (downloadError || !data) {
    console.error(
      `[migrate-storage] Failed to download ${sourceBucket}/${sourcePath}:`,
      downloadError?.message,
    );
    return false;
  }

  const { error: uploadError } = await supabase.storage
    .from("package-images")
    .upload(targetPath, data, {
      upsert: true,
      contentType: "image/webp",
    });

  if (uploadError) {
    console.error(
      `[migrate-storage] Failed to upload package-images/${targetPath}:`,
      uploadError.message,
    );
    return false;
  }

  return true;
}

async function listObjectsRecursively(bucket: string, prefix = ""): Promise<string[]> {
  const paths: string[] = [];
  const limit = 100;
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit, offset });

    if (error) {
      console.error(`[migrate-storage] Failed to list ${bucket}/${prefix}:`, error.message);
      break;
    }

    if (!data || data.length === 0) break;

    for (const item of data as ListedObject[]) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;

      if (item.id === null) {
        // Folder placeholder — recurse.
        const folderPrefix = fullPath.replace(/\/$/, "");
        const nested = await listObjectsRecursively(bucket, folderPrefix);
        paths.push(...nested);
      } else {
        paths.push(fullPath);
      }
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return paths;
}

async function migrateDestinations(): Promise<void> {
  console.log("[migrate-storage] Migrating destination images...");

  const { data: rows, error } = await supabase
    .from("destinations")
    .select("id, image_url")
    .not("image_url", "is", null);

  if (error) {
    console.error("[migrate-storage] Failed to fetch destinations:", error.message);
    return;
  }

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows ?? []) {
    const url = row.image_url!;
    const ref = parseStorageUrl(url);
    const sourceBucket = ref?.bucket ?? "destinos";
    const sourcePath = ref?.path ?? url;
    const targetPath = `destinations/${row.id}.webp`;

    if (await objectExists("package-images", targetPath)) {
      skipped++;
      continue;
    }

    const ok = await copyObject(sourceBucket, sourcePath, targetPath);
    if (ok) {
      migrated++;
      console.log(`[migrate-storage]  → package-images/${targetPath}`);
    } else {
      failed++;
    }
  }

  console.log(
    `[migrate-storage] Destinations: ${migrated} migrated, ${skipped} skipped (already exist), ${failed} failed`,
  );
}

async function migratePackageImages(): Promise<void> {
  console.log("[migrate-storage] Migrating package gallery images...");

  const { data: rows, error } = await supabase
    .from("package_images")
    .select("id, package_id, display_order, url")
    .not("url", "is", null);

  if (error) {
    console.error("[migrate-storage] Failed to fetch package_images:", error.message);
    return;
  }

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows ?? []) {
    const url = row.url;
    const ref = parseStorageUrl(url);
    const sourceBucket = ref?.bucket ?? "paquetes";
    const sourcePath = ref?.path ?? url;
    const targetPath = `packages/${row.package_id}/${row.display_order}.webp`;

    if (await objectExists("package-images", targetPath)) {
      skipped++;
      continue;
    }

    const ok = await copyObject(sourceBucket, sourcePath, targetPath);
    if (ok) {
      migrated++;
      console.log(`[migrate-storage]  → package-images/${targetPath}`);
    } else {
      failed++;
    }
  }

  console.log(
    `[migrate-storage] Package images: ${migrated} migrated, ${skipped} skipped (already exist), ${failed} failed`,
  );
}

async function migrateOrphans(): Promise<void> {
  console.log("[migrate-storage] Checking for orphaned objects...");

  const [{ data: destRows }, { data: imageRows }] = await Promise.all([
    supabase.from("destinations").select("id, image_url").not("image_url", "is", null),
    supabase.from("package_images").select("id, url").not("url", "is", null),
  ]);

  const referenced = new Set<string>();

  for (const row of destRows ?? []) {
    const ref = parseStorageUrl(row.image_url!);
    if (ref) referenced.add(`${ref.bucket}:${ref.path}`);
  }

  for (const row of imageRows ?? []) {
    const ref = parseStorageUrl(row.url);
    if (ref) referenced.add(`${ref.bucket}:${ref.path}`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  let copied = 0;
  let failed = 0;

  for (const bucket of ["destinos", "paquetes"]) {
    const objects = await listObjectsRecursively(bucket);
    for (const path of objects) {
      if (referenced.has(`${bucket}:${path}`)) continue;

      const targetPath = `orphaned/${timestamp}/${bucket}/${path}`;
      const ok = await copyObject(bucket, path, targetPath);
      if (ok) {
        copied++;
        console.log(`[migrate-storage]  orphaned → package-images/${targetPath}`);
      } else {
        failed++;
      }
    }
  }

  console.log(`[migrate-storage] Orphans: ${copied} copied, ${failed} failed`);
}

async function main(): Promise<void> {
  console.log("[migrate-storage] Starting storage migration...");
  console.log(`[migrate-storage] Supabase project: ${supabaseUrl}`);

  await migrateDestinations();
  await migratePackageImages();
  await migrateOrphans();

  console.log("[migrate-storage] Done.");
}

main().catch((err) => {
  console.error("[migrate-storage] Unexpected error:", err);
  process.exit(1);
});
