# Admin — Paquetes CRUD Specification

## Purpose

Admin interface to manage travel packages: list, create, edit, soft-delete, associate destinations, manage image gallery, and toggle draft/published state.

## Requirements

### Requirement: List packages with status badges

Admins MUST see a paginated table of packages excluding soft-deleted rows. Each row SHALL show: title, slug, is_national badge, price, duration, draft/published status badge.

#### Scenario: Default list

- GIVEN 10 packages (2 with `deleted_at` set, 3 draft, 5 published)
- WHEN admin opens `/admin/paquetes`
- THEN the table shows 8 packages
- AND each shows a "Draft" or "Published" badge
- AND national packages show a "Nacional" badge, international "Internacional"

### Requirement: Create package

Admin SHALL create a package with: title, slug (auto-generated, overridable), description, price, duration_days, what_includes, what_excludes, is_national toggle, one or more destinations (multi-select), image gallery (one or more images, first is primary), is_active, published_at.

#### Scenario: Happy path — draft by default

- GIVEN admin on create form
- WHEN filling title "Tour por Cartagena", price 1500000, duration_days 4, selecting "Cartagena" destination, uploading 3 images
- THEN package is created
- AND `is_active` defaults to true
- AND `published_at` is NULL (draft)
- AND first uploaded image has `is_primary = true`
- AND destination is linked via `package_destinations`

#### Scenario: Publish explicitly

- GIVEN admin on create form
- WHEN toggling "Publish now" before submit
- THEN `published_at` is set to `now()`
- AND package is immediately visible to public

#### Scenario: No destinations selected

- GIVEN admin on create form
- WHEN submitting with empty destination list
- THEN form shows validation error
- AND no package is created

#### Scenario: Duplicate slug

- GIVEN package with slug "tour-cartagena" exists
- WHEN submitting with same slug
- THEN submission fails with duplicate slug error

### Requirement: Edit package

Admin SHALL edit all package fields. Destination association SHALL support add/remove. Image gallery SHALL support add, reorder (display_order), set primary (is_primary), and remove.

#### Scenario: Update fields and destinations

- GIVEN package "Tour por Cartagena" with destination "Cartagena"
- WHEN admin removes Cartagena, adds "Bogotá", saves
- THEN `package_destinations` reflects the change
- AND package row fields are updated

#### Scenario: Add new image to gallery

- GIVEN package with 2 existing images
- WHEN admin uploads a new image
- THEN new image has `display_order = 2`
- AND existing primary is unchanged

### Requirement: Toggle draft/published

Admin SHALL toggle between draft and published. Publishing sets `published_at = now()`. Unpublishing sets `published_at = NULL`.

#### Scenario: Publish draft

- GIVEN package with `published_at = NULL`
- WHEN admin clicks "Publish"
- THEN `published_at` is set to `now()`

#### Scenario: Unpublish published

- GIVEN package with `published_at` set
- WHEN admin clicks "Unpublish"
- THEN `published_at` is set to `NULL`

### Requirement: Soft-delete package

Admin SHALL soft-delete by setting `deleted_at = now()`. Related `package_destinations` and `package_images` rows MAY remain.

#### Scenario: Delete with client trips

- GIVEN package with 3 `client_trips` references
- WHEN admin soft-deletes
- THEN `deleted_at` is set
- AND existing client_trips are unaffected

### Requirement: Image gallery upload

Package images SHALL upload to `paquetes/` Storage bucket using admin client. Max 10 images per package. Max file size: 5 MB. Allowed: JPEG, PNG, WebP.

#### Scenario: Upload gallery

- GIVEN admin uploads 5 images to package gallery
- WHEN all are valid
- THEN all are stored at `paquetes/{package-id}/{uuid}.{ext}`
- AND `package_images` table has 5 rows
- AND the first is marked `is_primary`

#### Scenario: Exceeds max images

- GIVEN package has 10 images already
- WHEN admin attempts to upload another
- THEN upload is rejected with "max images reached" error

## i18n Keys

| Key | Purpose |
|-----|---------|
| `admin.paquetes.title` | Page title |
| `admin.paquetes.create` | Create button |
| `admin.paquetes.edit` | Edit button |
| `admin.paquetes.delete` | Delete button |
| `admin.paquetes.confirmDelete` | Delete confirmation |
| `admin.paquetes.search` | Search placeholder |
| `admin.paquetes.form.title` | Title field label |
| `admin.paquetes.form.slug` | Slug field label |
| `admin.paquetes.form.description` | Description label |
| `admin.paquetes.form.price` | Price label |
| `admin.paquetes.form.duration` | Duration label |
| `admin.paquetes.form.includes` | What's included label |
| `admin.paquetes.form.excludes` | What's excluded label |
| `admin.paquetes.form.isNational` | National toggle label |
| `admin.paquetes.form.destinations` | Destinations multi-select |
| `admin.paquetes.form.images` | Image gallery label |
| `admin.paquetes.form.publishNow` | Publish now toggle |
| `admin.paquetes.form.save` | Save button |
| `admin.paquetes.form.cancel` | Cancel button |
| `admin.paquetes.badge.draft` | Draft badge text |
| `admin.paquetes.badge.published` | Published badge text |
| `admin.paquetes.badge.national` | National badge text |
| `admin.paquetes.badge.international` | International badge text |
| `admin.paquetes.actions.publish` | Publish action |
| `admin.paquetes.actions.unpublish` | Unpublish action |
| `admin.paquetes.errors.duplicateSlug` | Duplicate slug error |
| `admin.paquetes.errors.noDestinations` | No destinations error |
| `admin.paquetes.errors.maxImages` | Max images reached error |

## Component Contracts

| Component | Type | Props | Boundaries |
|-----------|------|-------|------------|
| `app/[locale]/admin/paquetes/page.tsx` | Server | `params: {locale}` | Fetch list, render table |
| `app/[locale]/admin/paquetes/crear/page.tsx` | Server | `params: {locale}` | Fetch destinos list, render form |
| `app/[locale]/admin/paquetes/[id]/editar/page.tsx` | Server | `params: {locale, id}` | Fetch package + relations, render edit |
| `app/actions/admin/paquetes.ts` | Server Only | N/A | Server Actions (create, update, delete, togglePublish, upload) |
| `components/admin/paquetes/PaqueteForm.tsx` | Client | `locale, package?, destinations[], onSave` | Form with useActionState |
| `components/admin/paquetes/PaqueteTable.tsx` | Client | `packages[], onSearch, onDelete, onTogglePublish` | Sortable table with badges |
| `components/admin/paquetes/DestinoMultiSelect.tsx` | Client | `destinations[], selected[], onChange` | Multi-select dropdown |
| `components/admin/paquetes/ImageGallery.tsx` | Client | `images[], onAdd, onRemove, onReorder, onSetPrimary` | Gallery with drag-to-reorder |

## File Changes

| File | Action |
|------|--------|
| `app/[locale]/admin/paquetes/page.tsx` | Create |
| `app/[locale]/admin/paquetes/crear/page.tsx` | Create |
| `app/[locale]/admin/paquetes/[id]/editar/page.tsx` | Create |
| `app/actions/admin/paquetes.ts` | Create |
| `components/admin/paquetes/PaqueteForm.tsx` | Create |
| `components/admin/paquetes/PaqueteTable.tsx` | Create |
| `components/admin/paquetes/DestinoMultiSelect.tsx` | Create |
| `components/admin/paquetes/ImageGallery.tsx` | Create |
| `messages/{en,es}.json` | Modify (add `admin.paquetes.*` keys) |
