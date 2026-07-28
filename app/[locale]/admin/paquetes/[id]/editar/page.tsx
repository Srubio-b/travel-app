import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/utils";
import { updatePaquete, uploadPaqueteImage } from "@/app/actions/admin/paquetes";
import { PaqueteFormFields } from "@/components/admin/paquetes/PaqueteFormFields";
import type { TravelPackage, PackageImage } from "@/types";

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

/* ──────────────────────────────────────────────
 * Page
 * ────────────────────────────────────────────── */

export default async function EditarPaquetePage({ params }: Props) {
  const { locale, id } = await params;

  // Auth guard
  const userClient = await createClient();
  await requireAdmin(userClient, locale);

  const ft = await getTranslations("admin.paquetes.form");
  const pt = await getTranslations("admin.paquetes");

  const adminClient = createAdminClient();

  // Fetch package by ID
  const { data: pkg, error } = await adminClient
    .from("travel_packages")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle<TravelPackage>();

  if (error || !pkg) {
    notFound();
  }

  // Fetch associated destinations
  const { data: packageDests } = await adminClient
    .from("package_destinations")
    .select("destination_id")
    .eq("package_id", id)
    .order("display_order", { ascending: true });

  // Fetch gallery images
  const { data: packageImages } = await adminClient
    .from("package_images")
    .select("url, is_primary, display_order")
    .eq("package_id", id)
    .order("display_order", { ascending: true });

  // Fetch all active destinations for multi-select
  const { data: destinations } = await adminClient
    .from("destinations")
    .select("id, name")
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("name", { ascending: true });

  const destinationIds = (packageDests ?? []).map(
    (pd) => pd.destination_id,
  );
  const imageUrls = (packageImages ?? [])
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => img.url);

  return (
    <PaqueteFormFields
      action={updatePaquete}
      uploadAction={uploadPaqueteImage}
      initialData={{
        id: pkg.id,
        title: pkg.title,
        slug: pkg.slug,
        description: pkg.description,
        includes: pkg.what_includes,
        excludes: pkg.what_excludes,
        duration_days: pkg.duration_days,
        is_national: pkg.is_national,
        price_cop: pkg.price,
        is_active: pkg.is_active,
        published_at: pkg.published_at,
        destination_ids: destinationIds,
        image_urls: imageUrls,
      }}
      destinations={destinations ?? []}
      backHref={`/${locale}/admin/paquetes`}
      labels={{
        title: pt("edit"),
        backLabel: `← ${pt("title")}`,
        formTitle: ft("title"),
        slug: ft("slug"),
        slugHelper: ft("slugHelper"),
        description: ft("description"),
        includes: ft("includes"),
        excludes: ft("excludes"),
        duration: ft("duration"),
        isNational: ft("isNational"),
        price: ft("price"),
        isActive: ft("isActive"),
        publishNow: ft("publishNow"),
        destinations: ft("destinations"),
        destinosSearch: ft("destinosSearch"),
        destinosCount: ft("destinosCount"),
        destinosEmpty: ft("destinosEmpty"),
        images: ft("images"),
        imagesCount: ft("imagesCount"),
        imagePrimary: ft("imagePrimary"),
        imageAlt: ft("imageAlt"),
        save: ft("saveChanges"),
        cancel: ft("cancel"),
        upload: ft("upload"),
        change: ft("change"),
        remove: ft("remove"),
        uploading: ft("uploading"),
      }}
    />
  );
}
