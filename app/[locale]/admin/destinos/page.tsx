import { getTranslations } from "next-intl/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/utils";
import { DestinoListClient } from "@/components/admin/destinos/DestinoListClient";
import { deleteDestino } from "@/app/actions/admin/destinos";
import type { Destination } from "@/types";

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
};

/* ──────────────────────────────────────────────
 * Page
 * ────────────────────────────────────────────── */

export default async function DestinosPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q } = await searchParams;

  // Auth guard
  const userClient = await createClient();
  await requireAdmin(userClient, locale);

  const t = await getTranslations("admin.destinos");

  const adminClient = createAdminClient();

  // Fetch destinations (excluding soft-deleted)
  let query = adminClient
    .from("destinations")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  // Server-side search via ILIKE
  if (q && q.trim().length > 0) {
    const term = `%${q.trim()}%`;
    query = query.or(
      `name.ilike.${term},country.ilike.${term},region.ilike.${term}`,
    );
  }

  const { data: destinations, error } = await query.returns<Destination[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (
    <DestinoListClient
      data={destinations ?? []}
      searchValue={q ?? ""}
      basePath={`/${locale}/admin/destinos`}
      deleteAction={deleteDestino}
      labels={{
        title: t("title"),
        create: t("create"),
        search: t("search"),
        edit: t("edit"),
        delete: t("delete"),
        noResults: t("noResults"),
        confirmDeleteTitle: t("confirmDeleteTitle"),
        confirmDeleteMessage: t("confirmDeleteMessage"),
        confirmLabel: t("confirmLabel"),
        cancelLabel: t("cancelLabel"),
        columnName: t("columnName"),
        columnCountry: t("columnCountry"),
        columnRegion: t("columnRegion"),
        columnActive: t("columnActive"),
        yes: t("yes"),
        no: t("no"),
      }}
    />
  );
}
