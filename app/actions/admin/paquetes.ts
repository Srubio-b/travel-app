"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/utils";
import { slugify } from "@/lib/utils/slug";
import { uploadImage } from "@/lib/supabase/storage";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { ActionResult } from "@/types";

/* ──────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────── */

async function getLocale(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get("NEXT_LOCALE")?.value ?? "es";
}

/* ──────────────────────────────────────────────
 * Create
 * ────────────────────────────────────────────── */

export async function createPaquete(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const userClient = await createClient();
  const locale = await getLocale();
  await requireAdmin(userClient, locale);

  const adminClient = createAdminClient();

  const title = (formData.get("title") as string)?.trim();
  let slug = (formData.get("slug") as string)?.trim() || slugify(title ?? "");
  const description = (formData.get("description") as string)?.trim() || "";
  const whatIncludes =
    (formData.get("includes") as string)?.trim() || null;
  const whatExcludes =
    (formData.get("excludes") as string)?.trim() || null;
  const durationDays = parseInt(
    formData.get("duration_days") as string,
    10,
  );
  const isNational = formData.get("is_national") === "on";
  const price = parseFloat(formData.get("price_cop") as string);
  const isActive = formData.get("is_active") === "on";
  const publishNow = formData.get("publish_now") === "on";

  // Parse JSON arrays
  let destinationIds: string[] = [];
  let imageUrls: string[] = [];

  try {
    destinationIds = JSON.parse(
      (formData.get("destination_ids") as string) || "[]",
    );
    imageUrls = JSON.parse(
      (formData.get("image_urls") as string) || "[]",
    );
  } catch {
    return {
      success: false,
      error: "Error al procesar los datos del formulario.",
    };
  }

  // Validation
  if (!title || title.length === 0) {
    return {
      success: false,
      error: "El título es requerido.",
      field: "title",
    };
  }
  if (!slug || slug.length === 0) {
    slug = slugify(title);
  }
  if (!description || description.length === 0) {
    return {
      success: false,
      error: "La descripción es requerida.",
      field: "description",
    };
  }
  if (isNaN(durationDays) || durationDays < 1) {
    return {
      success: false,
      error: "La duración debe ser al menos 1 día.",
      field: "duration_days",
    };
  }
  if (isNaN(price) || price < 0) {
    return {
      success: false,
      error: "El precio debe ser un valor válido.",
      field: "price_cop",
    };
  }
  if (destinationIds.length === 0) {
    return {
      success: false,
      error: "Seleccioná al menos un destino.",
      field: "destination_ids",
    };
  }
  if (imageUrls.length > 10) {
    return {
      success: false,
      error: "Máximo 10 imágenes por paquete.",
      field: "image_urls",
    };
  }

  // Slug uniqueness check
  const { data: existing } = await adminClient
    .from("travel_packages")
    .select("id")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: "Ya existe un paquete con ese slug.",
      field: "slug",
    };
  }

  // Insert package
  const { data: pkg, error } = await adminClient
    .from("travel_packages")
    .insert({
      title,
      slug,
      description,
      what_includes: whatIncludes,
      what_excludes: whatExcludes,
      duration_days: durationDays,
      is_national: isNational,
      price,
      is_active: isActive,
      published_at: publishNow ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Insert package_destinations
  if (destinationIds.length > 0) {
    const { error: pdError } = await adminClient
      .from("package_destinations")
      .insert(
        destinationIds.map((destId, i) => ({
          package_id: pkg.id,
          destination_id: destId,
          display_order: i,
        })),
      );

    if (pdError) {
      return { success: false, error: pdError.message };
    }
  }

  // Insert package_images (first is primary)
  if (imageUrls.length > 0) {
    const { error: piError } = await adminClient
      .from("package_images")
      .insert(
        imageUrls.map((url, i) => ({
          package_id: pkg.id,
          url,
          is_primary: i === 0,
          display_order: i,
          alt_text: null,
        })),
      );

    if (piError) {
      return { success: false, error: piError.message };
    }
  }

  revalidatePath(`/${locale}/admin/paquetes`);
  redirect(`/${locale}/admin/paquetes`);
}

/* ──────────────────────────────────────────────
 * Update
 * ────────────────────────────────────────────── */

export async function updatePaquete(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const userClient = await createClient();
  const locale = await getLocale();
  await requireAdmin(userClient, locale);

  const adminClient = createAdminClient();

  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim();
  let slug = (formData.get("slug") as string)?.trim() || slugify(title ?? "");
  const description = (formData.get("description") as string)?.trim() || "";
  const whatIncludes =
    (formData.get("includes") as string)?.trim() || null;
  const whatExcludes =
    (formData.get("excludes") as string)?.trim() || null;
  const durationDays = parseInt(
    formData.get("duration_days") as string,
    10,
  );
  const isNational = formData.get("is_national") === "on";
  const price = parseFloat(formData.get("price_cop") as string);
  const isActive = formData.get("is_active") === "on";
  const publishNow = formData.get("publish_now") === "on";

  // Parse JSON arrays
  let destinationIds: string[] = [];
  let imageUrls: string[] = [];

  try {
    destinationIds = JSON.parse(
      (formData.get("destination_ids") as string) || "[]",
    );
    imageUrls = JSON.parse(
      (formData.get("image_urls") as string) || "[]",
    );
  } catch {
    return {
      success: false,
      error: "Error al procesar los datos del formulario.",
    };
  }

  if (!id) {
    return {
      success: false,
      error: "ID de paquete no proporcionado.",
    };
  }
  if (!title || title.length === 0) {
    return {
      success: false,
      error: "El título es requerido.",
      field: "title",
    };
  }
  if (!slug || slug.length === 0) {
    slug = slugify(title);
  }
  if (!description || description.length === 0) {
    return {
      success: false,
      error: "La descripción es requerida.",
      field: "description",
    };
  }
  if (isNaN(durationDays) || durationDays < 1) {
    return {
      success: false,
      error: "La duración debe ser al menos 1 día.",
      field: "duration_days",
    };
  }
  if (isNaN(price) || price < 0) {
    return {
      success: false,
      error: "El precio debe ser un valor válido.",
      field: "price_cop",
    };
  }
  if (destinationIds.length === 0) {
    return {
      success: false,
      error: "Seleccioná al menos un destino.",
      field: "destination_ids",
    };
  }
  if (imageUrls.length > 10) {
    return {
      success: false,
      error: "Máximo 10 imágenes por paquete.",
      field: "image_urls",
    };
  }

  // Slug uniqueness check (exclude current)
  const { data: existing } = await adminClient
    .from("travel_packages")
    .select("id")
    .eq("slug", slug)
    .is("deleted_at", null)
    .neq("id", id)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: "Ya existe otro paquete con ese slug.",
      field: "slug",
    };
  }

  // Update package row
  const { error: updateError } = await adminClient
    .from("travel_packages")
    .update({
      title,
      slug,
      description,
      what_includes: whatIncludes,
      what_excludes: whatExcludes,
      duration_days: durationDays,
      is_national: isNational,
      price,
      is_active: isActive,
      published_at: publishNow
        ? new Date().toISOString()
        : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Replace package_destinations
  await adminClient
    .from("package_destinations")
    .delete()
    .eq("package_id", id);

  if (destinationIds.length > 0) {
    const { error: pdError } = await adminClient
      .from("package_destinations")
      .insert(
        destinationIds.map((destId, i) => ({
          package_id: id,
          destination_id: destId,
          display_order: i,
        })),
      );

    if (pdError) {
      return { success: false, error: pdError.message };
    }
  }

  // Replace package_images
  await adminClient
    .from("package_images")
    .delete()
    .eq("package_id", id);

  if (imageUrls.length > 0) {
    const { error: piError } = await adminClient
      .from("package_images")
      .insert(
        imageUrls.map((url, i) => ({
          package_id: id,
          url,
          is_primary: i === 0,
          display_order: i,
          alt_text: null,
        })),
      );

    if (piError) {
      return { success: false, error: piError.message };
    }
  }

  revalidatePath(`/${locale}/admin/paquetes`);
  redirect(`/${locale}/admin/paquetes`);
}

/* ──────────────────────────────────────────────
 * Delete (soft)
 * ────────────────────────────────────────────── */

export async function deletePaquete(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const userClient = await createClient();
  const locale = await getLocale();
  await requireAdmin(userClient, locale);

  const adminClient = createAdminClient();

  const id = formData.get("id") as string;

  if (!id) {
    return {
      success: false,
      error: "ID de paquete no proporcionado.",
    };
  }

  const { error } = await adminClient
    .from("travel_packages")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/${locale}/admin/paquetes`);
  redirect(`/${locale}/admin/paquetes`);
}

/* ──────────────────────────────────────────────
 * Toggle Publish
 * ────────────────────────────────────────────── */

export async function togglePublish(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const userClient = await createClient();
  const locale = await getLocale();
  await requireAdmin(userClient, locale);

  const adminClient = createAdminClient();

  const id = formData.get("id") as string;

  if (!id) {
    return {
      success: false,
      error: "ID de paquete no proporcionado.",
    };
  }

  const { data: pkg, error: fetchError } = await adminClient
    .from("travel_packages")
    .select("published_at")
    .eq("id", id)
    .single();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  const isPublishing = !pkg?.published_at;

  const { error: updateError } = await adminClient
    .from("travel_packages")
    .update({
      published_at: isPublishing ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath(`/${locale}/admin/paquetes`);
  return { success: true };
}

/* ──────────────────────────────────────────────
 * Image Upload
 * ────────────────────────────────────────────── */

export type UploadImageResult = {
  success: boolean;
  url?: string;
  error?: string;
};

export async function uploadPaqueteImage(
  _prev: UploadImageResult | null,
  formData: FormData,
): Promise<UploadImageResult> {
  const userClient = await createClient();
  const locale = (await cookies()).get("NEXT_LOCALE")?.value ?? "es";
  await requireAdmin(userClient, locale);

  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return { success: false, error: "Seleccioná una imagen." };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: "Formato no soportado. Usá JPEG, PNG o WebP.",
    };
  }

  if (file.size > 5 * 1024 * 1024) {
    return {
      success: false,
      error: "La imagen es muy grande. Máximo 5 MB.",
    };
  }

  try {
    const url = await uploadImage("paquetes", file);
    return { success: true, url };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Error al subir la imagen.",
    };
  }
}
