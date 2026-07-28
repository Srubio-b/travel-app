"use client";

import { useState, useRef } from "react";
import { useRouter, usePathname } from "@/lib/i18n/navigation";
import Link from "next/link";
import { AdminTable } from "@/components/admin/ui/AdminTable";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import type { Destination, ActionResult } from "@/types";

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export type DestinoListClientProps = {
  data: Destination[];
  searchValue: string;
  /** Translated labels forwarded from the Server Component */
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
    columnCountry: string;
    columnRegion: string;
    columnActive: string;
    yes: string;
    no: string;
  };
  basePath: string;
  /** Server Action reference for delete */
  deleteAction: (
    prev: ActionResult | null,
    formData: FormData,
  ) => Promise<ActionResult>;
};

/* ──────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────── */

export function DestinoListClient({
  data,
  searchValue,
  labels,
  basePath,
  deleteAction,
}: DestinoListClientProps) {
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
          { key: "name", label: labels.columnName },
          { key: "country", label: labels.columnCountry },
          {
            key: "region",
            label: labels.columnRegion,
            render: (row) => row.region ?? "—",
          },
          {
            key: "is_active",
            label: labels.columnActive,
            render: (row) =>
              row.is_active ? (
                <span className="text-sm text-success">{labels.yes}</span>
              ) : (
                <span className="text-sm text-muted-foreground">{labels.no}</span>
              ),
          },
        ]}
        searchValue={searchValue}
        onSearch={handleSearch}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
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
