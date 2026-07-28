import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/utils";
import { updateDestino, uploadDestinoImage } from "@/app/actions/admin/destinos";
import { DestinoFormFields } from "@/components/admin/destinos/DestinoFormFields";
import type { Destination } from "@/types";

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

/* ──────────────────────────────────────────────
 * Page
 * ────────────────────────────────────────────── */

export default async function EditarDestinoPage({ params }: Props) {
  const { locale, id } = await params;

  // Auth guard
  const userClient = await createClient();
  await requireAdmin(userClient, locale);

  const adminClient = createAdminClient();

  // Fetch destination by ID
  const { data: destination, error } = await adminClient
    .from("destinations")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle<Destination>();

  if (error || !destination) {
    notFound();
  }

  const ft = await getTranslations("admin.destinos.form");
  const destT = await getTranslations("admin.destinos");

  return (
    <DestinoFormFields
      action={updateDestino}
      uploadAction={uploadDestinoImage}
      initialData={{
        id: destination.id,
        name: destination.name,
        slug: destination.slug,
        description: destination.description,
        country: destination.country,
        region: destination.region,
        image_url: destination.image_url,
        is_active: destination.is_active,
        meta_title: destination.meta_title,
        meta_description: destination.meta_description,
      }}
      backHref={`/${locale}/admin/destinos`}
      labels={{
        title: destT("edit"),
        backLabel: `← ${destT("title")}`,
        name: ft("name"),
        slug: ft("slug"),
        slugHelper: ft("slugHelper"),
        description: ft("description"),
        country: ft("country"),
        region: ft("region"),
        image: ft("image"),
        isActive: ft("isActive"),
        metaTitle: ft("metaTitle"),
        metaDescription: ft("metaDescription"),
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
