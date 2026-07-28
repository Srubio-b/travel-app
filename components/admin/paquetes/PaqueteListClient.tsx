"use client";

import { useState, useRef } from "react";
import { useRouter, usePathname } from "@/lib/i18n/navigation";
import Link from "next/link";
import { AdminTable } from "@/components/admin/ui/AdminTable";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import type { TravelPackage, ActionResult } from "@/types";

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

type PaqueteRow = TravelPackage & {
  package_destinations?: { count: number }[];
};

export type PaqueteListClientProps = {
  data: PaqueteRow[];
  searchValue: string;
  labels: {
    title: string;
    create: string;
    search: string;
    edit: string;
    delete: string;
    noResults: string;
    confirmDeleteTitle: string;
    confirmDeleteMessage: string;
    confirmLabel: string;
    cancelLabel: string;
    columnName: string;
    columnType: string;
    columnPrice: string;
    columnDuration: string;
    columnStatus: string;
    badgeDraft: string;
    badgePublished: string;
    badgeNational: string;
    badgeInternational: string;
    publish: string;
    unpublish: string;
  };
  basePath: string;
  deleteAction: (
    prev: ActionResult | null,
    formData: FormData,
  ) => Promise<ActionResult>;
  togglePublishAction: (
    prev: ActionResult | null,
    formData: FormData,
  ) => Promise<ActionResult>;
};

/* ──────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────── */

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/* ──────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────── */

export function PaqueteListClient({
  data,
  searchValue,
  labels,
  basePath,
  deleteAction,
  togglePublishAction,
}: PaqueteListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteFormRef = useRef<HTMLFormElement>(null);

  const handleSearch = (value: string) => {
    const params = new URLSearchParams();
    if (value) params.set("q", value);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleEdit = (id: string) => {
    router.push(`${basePath}/${id}/editar`);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteFormRef.current) {
      deleteFormRef.current.requestSubmit();
    }
    setDeleteId(null);
  };

  return (
    <>
      {/* ── Header + Create button ──────────── */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{labels.title}</h2>
        <Link
          href={`${basePath}/crear`}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          {labels.create}
        </Link>
      </div>

      {/* ── Table ───────────────────────────── */}
      <AdminTable
        data={data}
        columns={[
          { key: "title", label: labels.columnName },
          {
            key: "is_national",
            label: labels.columnType,
            render: (row) =>
              row.is_national ? (
                <span className="inline-block rounded-full border border-primary-subtle bg-primary-subtle/30 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {labels.badgeNational}
                </span>
              ) : (
                <span className="inline-block rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {labels.badgeInternational}
                </span>
              ),
          },
          {
            key: "price",
            label: labels.columnPrice,
            render: (row) => (
              <span className="text-sm tabular-nums text-fg">
                {formatPrice(row.price)}
              </span>
            ),
          },
          {
            key: "duration_days",
            label: labels.columnDuration,
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {row.duration_days}d
              </span>
            ),
          },
          {
            key: "published_at",
            label: labels.columnStatus,
            render: (row) =>
              row.published_at ? (
                <span className="text-sm text-success">
                  {labels.badgePublished}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {labels.badgeDraft}
                </span>
              ),
          },
        ]}
        searchValue={searchValue}
        onSearch={handleSearch}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        actions={(row) => (
          <form
            action={async (formData: FormData) => {
              await togglePublishAction(null, formData);
            }}
          >
            <input type="hidden" name="id" value={row.id} />
            <button
              type="submit"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              {row.published_at ? labels.unpublish : labels.publish}
            </button>
          </form>
        )}
        labels={{
          search: labels.search,
          edit: labels.edit,
          delete: labels.delete,
          noResults: labels.noResults,
        }}
      />

      {/* ── Delete confirmation ─────────────── */}
      <ConfirmDialog
        open={!!deleteId}
        title={labels.confirmDeleteTitle}
        message={labels.confirmDeleteMessage}
        confirmLabel={labels.confirmLabel}
        cancelLabel={labels.cancelLabel}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* ── Hidden form for delete action ───── */}
      <form
        ref={deleteFormRef}
        action={async (formData: FormData) => {
          await deleteAction(null, formData);
        }}
        className="hidden"
      >
        <input type="hidden" name="id" value={deleteId ?? ""} readOnly />
      </form>
    </>
  );
}
