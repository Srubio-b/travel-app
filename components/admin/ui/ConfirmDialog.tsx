"use client";

import { useEffect, useRef } from "react";

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export type ConfirmDialogProps = {
  /** Whether the dialog is visible */
  open: boolean;
  /** Dialog title */
  title: string;
  /** Confirmation message body */
  message: string;
  /** Label for the confirm (destructive) button */
  confirmLabel: string;
  /** Label for the cancel button */
  cancelLabel: string;
  /** Called when the user confirms */
  onConfirm: () => void;
  /** Called when the user cancels or closes */
  onCancel: () => void;
};

/* ──────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────── */

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus trap basics: focus the confirm button when opened
  useEffect(() => {
    if (open) {
      confirmRef.current?.focus();
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl border border-border bg-bg p-6 shadow-lg"
      >
        <h3
          id="confirm-title"
          className="text-lg font-semibold text-fg"
        >
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-muted"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
