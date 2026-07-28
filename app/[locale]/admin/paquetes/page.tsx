import { getTranslations } from "next-intl/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/utils";
import { PaqueteListClient } from "@/components/admin/paquetes/PaqueteListClient";
import { deletePaquete, togglePublish } from "@/app/actions/admin/paquetes";
import type { TravelPackage } from "@/types";

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

export default async function PaquetesPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const { q } = await searchParams;

  // Auth guard
  const userClient = await createClient();
  await requireAdmin(userClient, locale);

  const t = await getTranslations("admin.paquetes");

  const adminClient = createAdminClient();

  // Fetch packages (excluding soft-deleted)
  let query = adminClient
    .from("travel_packages")
    .select("*, package_destinations(count)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  // Server-side search via ILIKE on title
  if (q && q.trim().length > 0) {
    const term = `%${q.trim()}%`;
    query = query.or(`title.ilike.${term}`);
  }

  const { data: packages, error } = await query.returns<
    (TravelPackage & { package_destinations?: { count: number }[] })[]
  >();

  if (error) {
    throw new Error(error.message);
  }

  return (
    <PaqueteListClient
      data={packages ?? []}
      searchValue={q ?? ""}
      basePath={`/${locale}/admin/paquetes`}
      deleteAction={deletePaquete}
      togglePublishAction={togglePublish}
      labels={{
        title: t("title"),
        create: t("create"),
        search: t("search"),
        edit: t("edit"),
        delete: t("delete"),
        noResults: t("noResults"),
        confirmDeleteTitle: t("confirmDeleteTitle"),
        confirmDeleteMessage: t("confirmDeleteMessage"),
        confirmLabel: t("confirmDelete"),
        cancelLabel: t("cancel"),
        columnName: t("columnName"),
        columnType: t("columnType"),
        columnPrice: t("columnPrice"),
        columnDuration: t("columnDuration"),
        columnStatus: t("columnStatus"),
        badgeDraft: t("badge.draft"),
        badgePublished: t("badge.published"),
        badgeNational: t("badge.national"),
        badgeInternational: t("badge.international"),
        publish: t("actions.publish"),
        unpublish: t("actions.unpublish"),
      }}
    />
  );
}
