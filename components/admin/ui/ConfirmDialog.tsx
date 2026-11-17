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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Open/close the native dialog in sync with the open prop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      // Focus the safer cancel button after the dialog is shown.
      window.setTimeout(() => cancelRef.current?.focus(), 0);
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Notify parent when the dialog is dismissed (Escape, form method, etc.).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onCancel();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onCancel]);

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === dialogRef.current) onCancel();
      }}
      className="fixed inset-0 z-50 m-auto w-full max-w-sm rounded-xl border border-border bg-bg p-6 shadow-lg"
      aria-labelledby="confirm-title"
    >
      <h3 id="confirm-title" className="text-lg font-semibold text-fg">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          ref={cancelRef}
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-muted"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-destructive/90"
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
