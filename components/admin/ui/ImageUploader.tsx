"use client";

import { useActionState, useState } from "react";

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export type UploadResult = {
  success: boolean;
  url?: string;
  error?: string;
};

export type ImageUploaderProps = {
  /** Initial image URL (edit mode) */
  initialUrl?: string;
  /**
   * Server Action that receives the selected file via FormData and returns
   * an UploadResult with the public URL on success.
   *
   * The Server Action signature follows the useActionState convention:
   *   (prev: UploadResult | null, formData: FormData) => Promise<UploadResult>
   */
  action: (
    prev: UploadResult | null,
    formData: FormData,
  ) => Promise<UploadResult>;
  /** Called when an upload succeeds — receives the public URL */
  onSuccess?: (url: string) => void;
  /** Translated labels forwarded from parent */
  labels: {
    upload: string;
    change: string;
    remove: string;
    uploading: string;
  };
};

/* ──────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────── */

export function ImageUploader({
  initialUrl,
  action,
  onSuccess,
  labels,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [state, formAction, isPending] = useActionState(action, null);

  // Notify parent when upload succeeds
  if (state?.success && state.url && state.url !== preview) {
    setPreview(state.url);
    setSelectedFile(null);
    onSuccess?.(state.url);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-3">
      {/* ── Preview ──────────────────────────── */}
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="h-40 w-60 rounded-lg border border-border object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-bg text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-fg"
            aria-label={labels.remove}
          >
            &times;
          </button>
        </div>
      ) : (
        <div className="flex h-40 w-60 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
          {labels.upload}
        </div>
      )}

      {/* ── Form ─────────────────────────────── */}
      <form action={formAction} className="flex items-center gap-3">
        <label className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-muted">
          {preview ? labels.change : labels.upload}
          <input
            type="file"
            name="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>

        {selectedFile && (
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? labels.uploading : labels.upload}
          </button>
        )}

        {state?.error && (
          <span className="text-sm text-red-500" role="alert">
            {state.error}
          </span>
        )}
      </form>
    </div>
  );
}
