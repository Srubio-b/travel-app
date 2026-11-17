"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/utils";
import { slugify } from "@/lib/utils/slug";
import { getPublicUrl, moveImage, uploadImage } from "@/lib/supabase/storage";
import { mapSupabaseError } from "@/lib/supabase/errors";
import { logQueryError } from "@/lib/logger";
import { withAdminAction } from "./_shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { ActionResult } from "@/types";

/* ──────────────────────────────────────────────
 * Create
 * ────────────────────────────────────────────── */

export const createDestino = withAdminAction<ActionResult>(
  async ({ locale, adminClient }, formData) => {
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
      return { success: false, error: mapSupabaseError(error, locale) };
    }

    // Move staging image to its final path after the destination ID is known.
    if (data && imageUrl?.startsWith("destinations/staging/")) {
      const finalPath = `destinations/${data.id}.webp`;
      try {
        await moveImage("package-images", imageUrl, finalPath);
        await adminClient.from("destinations").update({ image_url: finalPath }).eq("id", data.id);
      } catch (moveErr) {
        logQueryError("createDestino:moveImage", moveErr);
      }
    }

    revalidatePath(`/${locale}/admin/destinos`);
    revalidatePath(`/${locale}/`);
    revalidatePath(`/${locale}/destinos`);
    revalidatePath(`/${locale}/destinos/${slug}`);
    revalidatePath(`/sitemap.xml`);
    redirect(`/${locale}/admin/destinos`);
  },
);

/* ──────────────────────────────────────────────
 * Update
 * ────────────────────────────────────────────── */

export const updateDestino = withAdminAction<ActionResult>(
  async ({ locale, adminClient }, formData) => {
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
      return { success: false, error: mapSupabaseError(error, locale) };
    }

    // Move a re-uploaded staging image to its final path.
    if (imageUrl?.startsWith("destinations/staging/")) {
      const finalPath = `destinations/${id}.webp`;
      try {
        await moveImage("package-images", imageUrl, finalPath);
        await adminClient.from("destinations").update({ image_url: finalPath }).eq("id", id);
      } catch (moveErr) {
        logQueryError("updateDestino:moveImage", moveErr);
      }
    }

    revalidatePath(`/${locale}/admin/destinos`);
    revalidatePath(`/${locale}/`);
    revalidatePath(`/${locale}/destinos`);
    revalidatePath(`/${locale}/destinos/${slug}`);
    revalidatePath(`/sitemap.xml`);
    redirect(`/${locale}/admin/destinos`);
  },
);

/* ──────────────────────────────────────────────
 * Delete (soft)
 * ────────────────────────────────────────────── */

export const deleteDestino = withAdminAction<ActionResult>(
  async ({ locale, adminClient }, formData) => {
    const id = formData.get("id") as string;

    if (!id) {
      return { success: false, error: "ID de destino no proporcionado." };
    }

    const { data: dest } = await adminClient
      .from("destinations")
      .select("slug")
      .eq("id", id)
      .single();

    const { error } = await adminClient
      .from("destinations")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { success: false, error: mapSupabaseError(error, locale) };
    }

    revalidatePath(`/${locale}/admin/destinos`);
    revalidatePath(`/${locale}/`);
    revalidatePath(`/${locale}/destinos`);
    if (dest?.slug) {
      revalidatePath(`/${locale}/destinos/${dest.slug}`);
    }
    revalidatePath(`/sitemap.xml`);
    redirect(`/${locale}/admin/destinos`);
  },
);

/* ──────────────────────────────────────────────
 * Image Upload
 * ────────────────────────────────────────────── */

export type UploadImageResult = {
  success: boolean;
  url?: string;
  path?: string;
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
    const stagingPath = `destinations/staging/${crypto.randomUUID()}.webp`;
    const path = await uploadImage("package-images", file, stagingPath);
    const url = getPublicUrl("package-images", path);
    return { success: true, path, url };
  } catch (err) {
    logQueryError("uploadDestinoImage", err);
    return {
      success: false,
      error: mapSupabaseError(err, locale),
    };
  }
}
