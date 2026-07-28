"use client";

import { useActionState, useState, useRef } from "react";
import { slugify } from "@/lib/utils/slug";
import { AdminFormLayout } from "@/components/admin/ui/AdminFormLayout";
import { ImageUploader } from "@/components/admin/ui/ImageUploader";
import type { ActionResult } from "@/types";
import type { UploadImageResult } from "@/app/actions/admin/destinos";

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export type DestinoFormFieldsProps = {
  /** Server Action: create or update */
  action: (
    prev: ActionResult | null,
    formData: FormData,
  ) => Promise<ActionResult>;
  /** Server Action: upload image to destinos bucket */
  uploadAction: (
    prev: UploadImageResult | null,
    formData: FormData,
  ) => Promise<UploadImageResult>;
  /** Prefilled data for edit mode */
  initialData?: {
    id?: string;
    name?: string;
    slug?: string;
    description?: string | null;
    country?: string;
    region?: string | null;
    image_url?: string | null;
    is_active?: boolean;
    meta_title?: string | null;
    meta_description?: string | null;
  };
  /** Translated labels from parent Server Component */
  labels: {
    title: string;
    backLabel: string;
    name: string;
    slug: string;
    slugHelper: string;
    description: string;
    country: string;
    region: string;
    image: string;
    isActive: string;
    metaTitle: string;
    metaDescription: string;
    save: string;
    cancel: string;
    upload: string;
    change: string;
    remove: string;
    uploading: string;
  };
  /** Link to navigate back */
  backHref: string;
};

/* ──────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────── */

export function DestinoFormFields({
  action,
  uploadAction,
  initialData,
  labels,
  backHref,
}: DestinoFormFieldsProps) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData?.image_url ?? null,
  );

  // Slug auto-generation tracking
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const slugManuallyEdited = useRef(!!initialData?.slug);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!slugManuallyEdited.current) {
      setSlug(slugify(newName));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    slugManuallyEdited.current = true;
    setSlug(e.target.value);
  };

  const handleImageSuccess = (url: string) => {
    setImageUrl(url);
  };

  return (
    <form action={formAction}>
      {/* Hidden fields */}
      {initialData?.id && (
        <input type="hidden" name="id" value={initialData.id} />
      )}
      <input type="hidden" name="image_url" value={imageUrl ?? ""} />

      <AdminFormLayout
        title={labels.title}
        backHref={backHref}
        backLabel={labels.backLabel}
        error={state && !state.success ? state.error : undefined}
        submitLabel={labels.save}
        cancelLabel={labels.cancel}
        isSubmitting={isPending}
      >
        {/* ── Name ────────────────────────── */}
        <div>
          <label
            htmlFor="destino-name"
            className="mb-1 block text-sm font-medium text-fg"
          >
            {labels.name} <span className="text-destructive">*</span>
          </label>
          <input
            id="destino-name"
            name="name"
            type="text"
            required
            value={name}
            onChange={handleNameChange}
            className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-fg placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-subtle"
          />
        </div>

        {/* ── Slug ────────────────────────── */}
        <div>
          <label
            htmlFor="destino-slug"
            className="mb-1 block text-sm font-medium text-fg"
          >
            {labels.slug}
          </label>
          <input
            id="destino-slug"
            name="slug"
            type="text"
            value={slug}
            onChange={handleSlugChange}
            className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-fg placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-subtle"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {labels.slugHelper}
          </p>
        </div>

        {/* ── Description ─────────────────── */}
        <div>
          <label
            htmlFor="destino-description"
            className="mb-1 block text-sm font-medium text-fg"
          >
            {labels.description}
          </label>
          <textarea
            id="destino-description"
            name="description"
            rows={3}
            defaultValue={initialData?.description ?? ""}
            className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-fg placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-subtle"
          />
        </div>

        {/* ── Country ─────────────────────── */}
        <div>
          <label
            htmlFor="destino-country"
            className="mb-1 block text-sm font-medium text-fg"
          >
            {labels.country} <span className="text-destructive">*</span>
          </label>
          <input
            id="destino-country"
            name="country"
            type="text"
            required
            defaultValue={initialData?.country ?? ""}
            className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-fg placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-subtle"
          />
        </div>

        {/* ── Region ──────────────────────── */}
        <div>
          <label
            htmlFor="destino-region"
            className="mb-1 block text-sm font-medium text-fg"
          >
            {labels.region}
          </label>
          <input
            id="destino-region"
            name="region"
            type="text"
            defaultValue={initialData?.region ?? ""}
            className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-fg placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-subtle"
          />
        </div>

        {/* ── Image ───────────────────────── */}
        <div>
          <label className="mb-1 block text-sm font-medium text-fg">
            {labels.image}
          </label>
          <ImageUploader
            initialUrl={initialData?.image_url ?? undefined}
            action={uploadAction}
            onSuccess={handleImageSuccess}
            labels={{
              upload: labels.upload,
              change: labels.change,
              remove: labels.remove,
              uploading: labels.uploading,
            }}
          />
        </div>

        {/* ── Is Active ───────────────────── */}
        <div className="flex items-center gap-2">
          <input
            id="destino-is-active"
            name="is_active"
            type="checkbox"
            defaultChecked={initialData?.is_active ?? true}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary-subtle"
          />
          <label
            htmlFor="destino-is-active"
            className="text-sm font-medium text-fg"
          >
            {labels.isActive}
          </label>
        </div>

        {/* ── Meta Title ──────────────────── */}
        <div>
          <label
            htmlFor="destino-meta-title"
            className="mb-1 block text-sm font-medium text-fg"
          >
            {labels.metaTitle}
          </label>
          <input
            id="destino-meta-title"
            name="meta_title"
            type="text"
            maxLength={70}
            defaultValue={initialData?.meta_title ?? ""}
            className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-fg placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-subtle"
          />
        </div>

        {/* ── Meta Description ────────────── */}
        <div>
          <label
            htmlFor="destino-meta-description"
            className="mb-1 block text-sm font-medium text-fg"
          >
            {labels.metaDescription}
          </label>
          <textarea
            id="destino-meta-description"
            name="meta_description"
            rows={2}
            maxLength={160}
            defaultValue={initialData?.meta_description ?? ""}
            className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-fg placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-subtle"
          />
        </div>
      </AdminFormLayout>
    </form>
  );
}
