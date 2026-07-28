"use client";

import { useActionState, useState, useRef } from "react";
import { slugify } from "@/lib/utils/slug";
import { AdminFormLayout } from "@/components/admin/ui/AdminFormLayout";
import { DestinoMultiSelect } from "@/components/admin/paquetes/DestinoMultiSelect";
import { ImageGallery } from "@/components/admin/paquetes/ImageGallery";
import type { ActionResult } from "@/types";
import type { UploadImageResult } from "@/app/actions/admin/paquetes";

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export type PaqueteFormFieldsProps = {
  /** Server Action: create or update */
  action: (
    prev: ActionResult | null,
    formData: FormData,
  ) => Promise<ActionResult>;
  /** Server Action: upload image to paquetes bucket */
  uploadAction: (
    prev: UploadImageResult | null,
    formData: FormData,
  ) => Promise<UploadImageResult>;
  /** Prefilled data for edit mode */
  initialData?: {
    id?: string;
    title?: string;
    slug?: string;
    description?: string;
    includes?: string | null;
    excludes?: string | null;
    duration_days?: number;
    is_national?: boolean;
    price_cop?: number;
    is_active?: boolean;
    published_at?: string | null;
    destination_ids?: string[];
    image_urls?: string[];
  };
  /** Available destinations for multi-select */
  destinations: { id: string; name: string }[];
  /** Translated labels from parent Server Component */
  labels: {
    title: string;
    backLabel: string;
    formTitle: string;
    slug: string;
    slugHelper: string;
    description: string;
    includes: string;
    excludes: string;
    duration: string;
    isNational: string;
    price: string;
    isActive: string;
    publishNow: string;
    destinations: string;
    destinosSearch: string;
    destinosCount: string;
    destinosEmpty: string;
    images: string;
    imagesCount: string;
    imagePrimary: string;
    imageAlt: string;
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

export function PaqueteFormFields({
  action,
  uploadAction,
  initialData,
  destinations,
  labels,
  backHref,
}: PaqueteFormFieldsProps) {
  const [state, formAction, isPending] = useActionState(action, null);

  // Text fields state
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const slugManuallyEdited = useRef(!!initialData?.slug);

  // Multi-select & gallery state
  const [selectedDestIds, setSelectedDestIds] = useState<string[]>(
    initialData?.destination_ids ?? [],
  );
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData?.image_urls ?? [],
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!slugManuallyEdited.current) {
      setSlug(slugify(newTitle));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    slugManuallyEdited.current = true;
    setSlug(e.target.value);
  };

  return (
    <form action={formAction}>
      {/* Hidden fields */}
      {initialData?.id && (
        <input type="hidden" name="id" value={initialData.id} />
      )}
      <input
        type="hidden"
        name="destination_ids"
        value={JSON.stringify(selectedDestIds)}
      />
      <input
        type="hidden"
        name="image_urls"
        value={JSON.stringify(imageUrls)}
      />

      <AdminFormLayout
        title={labels.title}
        backHref={backHref}
        backLabel={labels.backLabel}
        error={state && !state.success ? state.error : undefined}
        submitLabel={labels.save}
        cancelLabel={labels.cancel}
        isSubmitting={isPending}
      >
        {/* ── Title ────────────────────────── */}
        <div>
          <label
            htmlFor="paquete-title"
            className="mb-1 block text-sm font-medium text-fg"
          >
            {labels.formTitle} <span className="text-destructive">*</span>
          </label>
          <input
            id="paquete-title"
            name="title"
            type="text"
            required
            value={title}
            onChange={handleTitleChange}
            className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-fg placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-subtle"
          />
        </div>

        {/* ── Slug ─────────────────────────── */}
        <div>
          <label
            htmlFor="paquete-slug"
            className="mb-1 block text-sm font-medium text-fg"
          >
            {labels.slug}
          </label>
          <input
            id="paquete-slug"
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

        {/* ── Description ──────────────────── */}
        <div>
          <label
            htmlFor="paquete-description"
            className="mb-1 block text-sm font-medium text-fg"
          >
            {labels.description} <span className="text-destructive">*</span>
          </label>
          <textarea
            id="paquete-description"
            name="description"
            rows={4}
            required
            defaultValue={initialData?.description ?? ""}
            className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-fg placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-subtle"
          />
        </div>

        {/* ── Includes ─────────────────────── */}
        <div>
          <label
            htmlFor="paquete-includes"
            className="mb-1 block text-sm font-medium text-fg"
          >
            {labels.includes}
          </label>
          <textarea
            id="paquete-includes"
            name="includes"
            rows={3}
            defaultValue={initialData?.includes ?? ""}
            className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-fg placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-subtle"
          />
        </div>

        {/* ── Excludes ─────────────────────── */}
        <div>
          <label
            htmlFor="paquete-excludes"
            className="mb-1 block text-sm font-medium text-fg"
          >
            {labels.excludes}
          </label>
          <textarea
            id="paquete-excludes"
            name="excludes"
            rows={3}
            defaultValue={initialData?.excludes ?? ""}
            className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-fg placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-subtle"
          />
        </div>

        {/* ── Price & Duration (side-by-side) ──── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="paquete-price"
              className="mb-1 block text-sm font-medium text-fg"
            >
              {labels.price} (COP){" "}
              <span className="text-destructive">*</span>
            </label>
            <input
              id="paquete-price"
              name="price_cop"
              type="number"
              min={0}
              step={100}
              required
              defaultValue={initialData?.price_cop ?? ""}
              className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-fg placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-subtle"
            />
          </div>
          <div>
            <label
              htmlFor="paquete-duration"
              className="mb-1 block text-sm font-medium text-fg"
            >
              {labels.duration} (días){" "}
              <span className="text-destructive">*</span>
            </label>
            <input
              id="paquete-duration"
              name="duration_days"
              type="number"
              min={1}
              required
              defaultValue={initialData?.duration_days ?? ""}
              className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-fg placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-subtle"
            />
          </div>
        </div>

        {/* ── Checkboxes row ───────────────── */}
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <input
              id="paquete-is-national"
              name="is_national"
              type="checkbox"
              defaultChecked={initialData?.is_national ?? true}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary-subtle"
            />
            <label
              htmlFor="paquete-is-national"
              className="text-sm font-medium text-fg"
            >
              {labels.isNational}
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="paquete-is-active"
              name="is_active"
              type="checkbox"
              defaultChecked={initialData?.is_active ?? true}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary-subtle"
            />
            <label
              htmlFor="paquete-is-active"
              className="text-sm font-medium text-fg"
            >
              {labels.isActive}
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="paquete-publish-now"
              name="publish_now"
              type="checkbox"
              defaultChecked={!!initialData?.published_at}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary-subtle"
            />
            <label
              htmlFor="paquete-publish-now"
              className="text-sm font-medium text-fg"
            >
              {labels.publishNow}
            </label>
          </div>
        </div>

        {/* ── Destinations Multi-Select ────── */}
        <div>
          <label className="mb-1 block text-sm font-medium text-fg">
            {labels.destinations} <span className="text-destructive">*</span>
          </label>
          <DestinoMultiSelect
            destinations={destinations}
            selectedIds={selectedDestIds}
            onChange={setSelectedDestIds}
            labels={{
              search: labels.destinosSearch,
              count: labels.destinosCount,
              empty: labels.destinosEmpty,
            }}
          />
        </div>

        {/* ── Image Gallery ────────────────── */}
        <div>
          <label className="mb-1 block text-sm font-medium text-fg">
            {labels.images}
          </label>
          <ImageGallery
            images={imageUrls}
            onChange={setImageUrls}
            uploadAction={uploadAction}
            labels={{
              upload: labels.upload,
              change: labels.change,
              remove: labels.remove,
              uploading: labels.uploading,
              primary: labels.imagePrimary,
              alt: labels.imageAlt,
              count: labels.imagesCount,
            }}
          />
        </div>
      </AdminFormLayout>
    </form>
  );
}
