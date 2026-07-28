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

export async function createDestino(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const userClient = await createClient();
  const locale = await getLocale();
  await requireAdmin(userClient, locale);

  const adminClient = createAdminClient();

  const name = (formData.get("name") as string)?.trim();
  let slug = (formData.get("slug") as string)?.trim() || slugify(name ?? "");
  const description = (formData.get("description") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim();
  const region = (formData.get("region") as string)?.trim() || null;
  const isActive = formData.get("is_active") === "on";
  const imageUrl = (formData.get("image_url") as string) || null;
  const metaTitle = (formData.get("meta_title") as string)?.trim() || null;
  const metaDescription = (formData.get("meta_description") as string)?.trim() || null;

  // Validation
  if (!name || name.length === 0) {
    return { success: false, error: "El nombre es requerido.", field: "name" };
  }
  if (!country || country.length === 0) {
    return { success: false, error: "El país es requerido.", field: "country" };
  }
  if (!slug || slug.length === 0) {
    slug = slugify(name);
  }

  // Slug uniqueness check
  const { data: existing } = await adminClient
    .from("destinations")
    .select("id")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: "Ya existe un destino con ese slug.",
      field: "slug",
    };
  }

  const { data, error } = await adminClient
    .from("destinations")
    .insert({
      name,
      slug,
      description,
      country,
      region,
      image_url: imageUrl,
      is_active: isActive,
      meta_title: metaTitle,
      meta_description: metaDescription,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/${locale}/admin/destinos`);
  redirect(`/${locale}/admin/destinos`);
}

/* ──────────────────────────────────────────────
 * Update
 * ────────────────────────────────────────────── */

export async function updateDestino(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const userClient = await createClient();
  const locale = await getLocale();
  await requireAdmin(userClient, locale);

  const adminClient = createAdminClient();

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  let slug = (formData.get("slug") as string)?.trim() || slugify(name ?? "");
  const description = (formData.get("description") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim();
  const region = (formData.get("region") as string)?.trim() || null;
  const isActive = formData.get("is_active") === "on";
  const imageUrl = (formData.get("image_url") as string) || null;
  const metaTitle = (formData.get("meta_title") as string)?.trim() || null;
  const metaDescription = (formData.get("meta_description") as string)?.trim() || null;

  if (!id) {
    return { success: false, error: "ID de destino no proporcionado." };
  }
  if (!name || name.length === 0) {
    return { success: false, error: "El nombre es requerido.", field: "name" };
  }
  if (!country || country.length === 0) {
    return { success: false, error: "El país es requerido.", field: "country" };
  }
  if (!slug || slug.length === 0) {
    slug = slugify(name);
  }

  // Slug uniqueness check (exclude current)
  const { data: existing } = await adminClient
    .from("destinations")
    .select("id")
    .eq("slug", slug)
    .is("deleted_at", null)
    .neq("id", id)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: "Ya existe otro destino con ese slug.",
      field: "slug",
    };
  }

  const { error } = await adminClient
    .from("destinations")
    .update({
      name,
      slug,
      description,
      country,
      region,
      image_url: imageUrl,
      is_active: isActive,
      meta_title: metaTitle,
      meta_description: metaDescription,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/${locale}/admin/destinos`);
  redirect(`/${locale}/admin/destinos`);
}

/* ──────────────────────────────────────────────
 * Delete (soft)
 * ────────────────────────────────────────────── */

export async function deleteDestino(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const userClient = await createClient();
  const locale = await getLocale();
  await requireAdmin(userClient, locale);

  const adminClient = createAdminClient();

  const id = formData.get("id") as string;

  if (!id) {
    return { success: false, error: "ID de destino no proporcionado." };
  }

  const { error } = await adminClient
    .from("destinations")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/${locale}/admin/destinos`);
  redirect(`/${locale}/admin/destinos`);
}

/* ──────────────────────────────────────────────
 * Image Upload
 * ────────────────────────────────────────────── */

export type UploadImageResult = {
  success: boolean;
  url?: string;
  error?: string;
};

export async function uploadDestinoImage(
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
    const url = await uploadImage("destinos", file);
    return { success: true, url };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al subir la imagen.",
    };
  }
}
