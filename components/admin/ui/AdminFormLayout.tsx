"use client";

import type { ReactNode } from "react";
import { Link } from "@/lib/i18n/navigation";

export type AdminFormLayoutProps = {
  /** Page title (e.g. "Create destination", "Edit package") */
  title: string;
  /** Link to navigate back */
  backHref: string;
  /** Label for the back link */
  backLabel: string;
  /** Optional error message to display at the top of the form */
  error?: string;
  /** Label for the submit button */
  submitLabel: string;
  /** Label for the cancel button */
  cancelLabel: string;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Form fields rendered by the parent */
  children: ReactNode;
};

export function AdminFormLayout({
  title,
  backHref,
  backLabel,
  error,
  submitLabel,
  cancelLabel,
  isSubmitting = false,
  children,
}: AdminFormLayoutProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* ── Header ─────────────────────────── */}
      <div>
        <Link
          href={backHref}
          className="mb-2 inline-block text-sm text-muted-foreground transition-colors hover:text-fg"
        >
          &larr; {backLabel}
        </Link>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      {/* ── Error summary ──────────────────── */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {/* ── Form body (slot for entity fields) ─── */}
      <div className="space-y-4">{children}</div>

      {/* ── Actions ────────────────────────── */}
      <div className="flex items-center gap-3 border-t border-border pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>

        <Link
          href={backHref}
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-muted"
        >
          {cancelLabel}
        </Link>
      </div>
    </div>
  );
}
