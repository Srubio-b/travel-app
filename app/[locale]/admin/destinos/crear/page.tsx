import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/utils";
import { createDestino, uploadDestinoImage } from "@/app/actions/admin/destinos";
import { DestinoFormFields } from "@/components/admin/destinos/DestinoFormFields";

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

type Props = {
  params: Promise<{ locale: string }>;
};

/* ──────────────────────────────────────────────
 * Page
 * ────────────────────────────────────────────── */

export default async function CrearDestinoPage({ params }: Props) {
  const { locale } = await params;

  // Auth guard
  const userClient = await createClient();
  await requireAdmin(userClient, locale);

  const ft = await getTranslations("admin.destinos.form");
  const dt = await getTranslations("admin.destinos");

  return (
    <DestinoFormFields
      action={createDestino}
      uploadAction={uploadDestinoImage}
      backHref={`/${locale}/admin/destinos`}
      labels={{
        title: dt("create"),
        backLabel: `← ${dt("title")}`,
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
