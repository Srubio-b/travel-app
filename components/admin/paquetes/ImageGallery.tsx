"use client";

import { useActionState, useState } from "react";
import type { UploadImageResult } from "@/app/actions/admin/paquetes";

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export type ImageGalleryProps = {
  /** Current image URLs in the gallery */
  images: string[];
  /** Called when the gallery list changes (add/remove/reorder) */
  onChange: (urls: string[]) => void;
  /** Server Action to upload a file to the paquetes bucket */
  uploadAction: (
    prev: UploadImageResult | null,
    formData: FormData,
  ) => Promise<UploadImageResult>;
  /** Translated labels */
  labels: {
    upload: string;
    change: string;
    remove: string;
    uploading: string;
    primary: string;
    alt: string;
    count: string;
  };
};

/* ──────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────── */

export function ImageGallery({
  images,
  onChange,
  uploadAction,
  labels,
}: ImageGalleryProps) {
  const [state, formAction, isPending] = useActionState(uploadAction, null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // When an upload succeeds, add the URL to the gallery
  if (state?.success && state.url && !images.includes(state.url)) {
    onChange([...images, state.url]);
    setSelectedFile(null);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null);
  };

  const handleRemove = (url: string) => {
    onChange(images.filter((u) => u !== url));
  };

  return (
    <div className="space-y-4">
      {/* ── Image grid ───────────────────────── */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, i) => (
            <div key={url} className="group relative">
              <img
                src={url}
                alt={labels.alt.replace("{n}", (i + 1).toString())}
                className="h-28 w-full rounded-lg border border-border object-cover"
              />
              {/* Primary badge */}
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-primary/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {labels.primary}
                </span>
              )}
              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-bg text-xs text-muted-foreground opacity-0 transition-opacity hover:bg-destructive-subtle hover:text-destructive group-hover:opacity-100"
                aria-label={labels.remove}
              >
                &times;
              </button>
              {/* Sort order number */}
              <span className="absolute bottom-1 right-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                #{i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Upload form ───────────────────────── */}
      <form action={formAction} className="flex items-center gap-3">
        <label className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-muted">
          {labels.upload}
          <input
            type="file"
            name="file"
            accept="image/png,image/jpeg,image/webp"
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
          <span className="text-sm text-destructive" role="alert">
            {state.error}
          </span>
        )}
      </form>

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {labels.count.replace("{count}", images.length.toString())}
        </p>
      )}
    </div>
  );
}
