import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Uploads a file to the specified Storage bucket using the admin client
 * (service_role — bypasses RLS).
 *
 * @param bucket - Storage bucket name (e.g. "package-images")
 * @param file   - The File object to upload
 * @param path   - Optional explicit path inside the bucket. When omitted,
 *                 a random UUID is generated (keeping the original extension).
 * @returns The relative path of the uploaded file inside the bucket.
 */
export async function uploadImage(bucket: string, file: File, path?: string): Promise<string> {
  const supabase = createAdminClient();

  const fileExt = file.name.split(".").pop() ?? "jpg";
  const filePath = path ?? `${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  return filePath;
}

/**
 * Builds a public URL for a relative path inside a Storage bucket.
 *
 * @param bucket - Storage bucket name
 * @param path   - Relative path inside the bucket
 * @returns The public URL for the object.
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createAdminClient();

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}

/**
 * Moves an object within the same Storage bucket.
 *
 * @param bucket  - Storage bucket name
 * @param fromPath - Current relative path of the object
 * @param toPath   - Target relative path inside the same bucket
 * @returns The new relative path.
 */
export async function moveImage(bucket: string, fromPath: string, toPath: string): Promise<string> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage.from(bucket).move(fromPath, toPath);

  if (error) {
    throw new Error(error.message);
  }

  return toPath;
}

/**
 * Deletes a file from the specified Storage bucket using the admin client.
 *
 * @param bucket - Storage bucket name
 * @param path   - Full path of the file to delete
 */
export async function deleteImage(bucket: string, path: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(error.message);
  }
}
