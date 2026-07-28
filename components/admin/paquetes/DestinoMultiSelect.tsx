"use client";

import { useState, useMemo } from "react";

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export type DestinoMultiSelectProps = {
  /** Available destinations */
  destinations: { id: string; name: string }[];
  /** Currently selected destination IDs */
  selectedIds: string[];
  /** Called when selection changes */
  onChange: (ids: string[]) => void;
  /** Translated labels */
  labels: {
    search: string;
    count: string;
    empty: string;
  };
};

/* ──────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────── */

export function DestinoMultiSelect({
  destinations,
  selectedIds,
  onChange,
  labels,
}: DestinoMultiSelectProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      destinations.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [destinations, search],
  );

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-2">
      {/* ── Search ─────────────────────────── */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={labels.search}
        aria-label={labels.search}
        className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-fg placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-subtle"
      />

      {/* ── Selected count ─────────────────── */}
      <p className="text-xs text-muted-foreground">
        {labels.count.replace("{count}", selectedIds.length.toString())}
      </p>

      {/* ── Checkbox list ──────────────────── */}
      {filtered.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {labels.empty}
        </p>
      ) : (
        <div className="max-h-56 overflow-y-auto rounded-lg border border-border">
          {filtered.map((dest) => (
            <label
              key={dest.id}
              className="flex cursor-pointer items-center gap-3 border-b border-border px-4 py-2.5 text-sm transition-colors last:border-b-0 hover:bg-surface"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(dest.id)}
                onChange={() => toggle(dest.id)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary-subtle"
              />
              <span className="text-fg">{dest.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
