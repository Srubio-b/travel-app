"use client";

import type { ReactNode } from "react";

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export type Column<T> = {
  /** Unique key matching a property on T */
  key: string;
  /** Translated column label (passed from Server Component) */
  label: string;
  /** Custom renderer. Defaults to `String(row[key])` */
  render?: (row: T) => ReactNode;
  /** Whether the column supports sorting (reserved for server-side sort) */
  sortable?: boolean;
};

export type AdminTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  /** Current search input value */
  searchValue?: string;
  /** Called when the user types in the search box.
   *  Parent should update URL search params for server-side filtering. */
  onSearch?: (value: string) => void;
  /** Called when the edit action button is clicked — receives the row id */
  onEdit?: (id: string) => void;
  /** Called when the delete action button is clicked — receives the row id */
  onDelete?: (id: string) => void;
  /** Slot for extra action buttons rendered per row */
  actions?: (row: T) => ReactNode;
  /** Translated labels forwarded from the parent Server Component */
  labels: {
    search: string;
    edit: string;
    delete: string;
    noResults: string;
  };
};

/* ──────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────── */

export function AdminTable<T extends { id: string }>({
  columns,
  data,
  searchValue = "",
  onSearch,
  onEdit,
  onDelete,
  actions,
  labels,
}: AdminTableProps<T>) {
  return (
    <div className="space-y-4">
      {/* ── Search ─────────────────────────── */}
      {onSearch && (
        <div>
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={labels.search}
            aria-label={labels.search}
            className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-fg placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-subtle"
          />
        </div>
      )}

      {/* ── Table ──────────────────────────── */}
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {labels.noResults}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className="px-4 py-3 font-medium text-muted-foreground"
                  >
                    {col.label}
                  </th>
                ))}
                {(onEdit || onDelete || actions) && (
                  <th scope="col" className="px-4 py-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-surface"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                  {(onEdit || onDelete || actions) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {actions?.(row)}
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(row.id)}
                            className="rounded-md px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary-subtle"
                          >
                            {labels.edit}
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(row.id)}
                            className="rounded-md px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            {labels.delete}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
