import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Uploads a file to the specified Storage bucket using the admin client
 * (service_role — bypasses RLS).
 *
 * @param bucket - Storage bucket name (e.g. "destinos", "paquetes")
 * @param file   - The File object to upload
 * @param path   - Optional explicit path inside the bucket. When omitted,
 *                 a random UUID is generated (keeping the original extension).
 * @returns The public URL of the uploaded file.
 */
export async function uploadImage(
  bucket: string,
  file: File,
  path?: string,
): Promise<string> {
  const supabase = createAdminClient();

  const fileExt = file.name.split(".").pop() ?? "jpg";
  const filePath = path ?? `${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return publicUrl;
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
