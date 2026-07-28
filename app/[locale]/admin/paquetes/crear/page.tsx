import { getTranslations } from "next-intl/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/utils";
import { createPaquete, uploadPaqueteImage } from "@/app/actions/admin/paquetes";
import { PaqueteFormFields } from "@/components/admin/paquetes/PaqueteFormFields";

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

type Props = {
  params: Promise<{ locale: string }>;
};

/* ──────────────────────────────────────────────
 * Page
 * ────────────────────────────────────────────── */

export default async function CrearPaquetePage({ params }: Props) {
  const { locale } = await params;

  // Auth guard
  const userClient = await createClient();
  await requireAdmin(userClient, locale);

  const ft = await getTranslations("admin.paquetes.form");
  const pt = await getTranslations("admin.paquetes");

  const adminClient = createAdminClient();

  // Fetch active destinations for multi-select
  const { data: destinations } = await adminClient
    .from("destinations")
    .select("id, name")
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("name", { ascending: true });

  return (
    <PaqueteFormFields
      action={createPaquete}
      uploadAction={uploadPaqueteImage}
      destinations={destinations ?? []}
      backHref={`/${locale}/admin/paquetes`}
      labels={{
        title: pt("create"),
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
        save: ft("save"),
        cancel: ft("cancel"),
        upload: ft("upload"),
        change: ft("change"),
        remove: ft("remove"),
        uploading: ft("uploading"),
      }}
    />
  );
}
