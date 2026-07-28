# Admin — Destinos CRUD Specification

## Purpose

Admin interface to manage destinations: list, create, edit, soft-delete, and upload images to Supabase Storage.

## Requirements

### Requirement: List destinations with pagination and search

Admins MUST see a paginated table of destinations excluding soft-deleted rows (`deleted_at IS NULL`). Columns: name, slug, country, region, is_active. Search SHALL filter by name, country, region.

#### Scenario: Default list (soft-delete excluded)

- GIVEN 15 destinations (3 with `deleted_at` set)
- WHEN admin opens `/admin/destinos`
- THEN the table shows 12 destinations
- AND deleted rows are absent

#### Scenario: Search by name

- GIVEN 10 destinations with various names
- WHEN admin types "Colombia" in search
- THEN only destinations matching "Colombia" in name, country, or region are displayed

### Requirement: Create destination

Admin SHALL create a destination with: name, slug (auto-generated from name, overridable), description, country, region, image (uploaded to `destinos/` Storage bucket), is_active.

#### Scenario: Happy path

- GIVEN admin on create form
- WHEN filling name "Cartagena", country "Colombia", uploading image, and submitting
- THEN destination is created
- AND slug is auto-generated as "cartagena"
- AND image stored at `destinos/{uuid}.{ext}`
- AND `image_url` column stores the public URL

#### Scenario: Slug override

- GIVEN admin on create form with name "San Andrés"
- WHEN admin changes slug to "san-andres-islas"
- THEN destination is created with slug "san-andres-islas"

#### Scenario: Duplicate slug

- GIVEN destination with slug "cartagena" exists
- WHEN admin submits with slug "cartagena"
- THEN submission fails with duplicate slug error

#### Scenario: Missing required fields

- GIVEN admin on create form
- WHEN submitting with empty name
- THEN form shows validation error for name
- AND no row is created

### Requirement: Edit destination

Admin SHALL edit all destination fields. Replacing the image SHALL upload a new file and update `image_url`. Not uploading a new image SHALL keep the existing URL.

#### Scenario: Update fields

- GIVEN destination "Cartagena" with existing image
- WHEN admin changes description and submits
- THEN description is updated
- AND `image_url` is unchanged

#### Scenario: Replace image

- GIVEN destination with `image_url` pointing to `destinos/old.jpg`
- WHEN admin uploads a new image
- THEN new file is stored at `destinos/{new-uuid}.{ext}`
- AND `image_url` points to new file
- AND old file SHOULD be deleted from Storage

### Requirement: Soft-delete destination

Admin SHALL soft-delete by setting `deleted_at = now()`. The row MUST remain in the database but be excluded from default list queries.

#### Scenario: Delete confirmation

- GIVEN destination "Cartagena"
- WHEN admin clicks delete and confirms
- THEN `deleted_at` is set
- AND destination disappears from list

#### Scenario: Delete with active packages

- GIVEN destination "Cartagena" linked to 2 active packages
- WHEN admin attempts soft-delete
- THEN delete succeeds (junction rows remain)

### Requirement: Image upload via Supabase Storage

Destination images SHALL be uploaded to `destinos/` Storage bucket. Upload MUST use admin client (service_role). Max file size: 5 MB. Allowed types: JPEG, PNG, WebP.

#### Scenario: Upload valid image

- GIVEN admin client
- WHEN uploading a 1 MB JPEG to `destinos/`
- THEN file is stored
- AND public URL is returned

#### Scenario: File too large

- GIVEN admin client
- WHEN uploading a 10 MB PNG
- THEN upload is rejected with size error

## i18n Keys

| Key | Purpose |
|-----|---------|
| `admin.destinos.title` | Page title |
| `admin.destinos.create` | Create button |
| `admin.destinos.edit` | Edit button |
| `admin.destinos.delete` | Delete button |
| `admin.destinos.confirmDelete` | Delete confirmation dialog |
| `admin.destinos.search` | Search placeholder |
| `admin.destinos.form.name` | Name field label |
| `admin.destinos.form.slug` | Slug field label |
| `admin.destinos.form.description` | Description label |
| `admin.destinos.form.country` | Country label |
| `admin.destinos.form.region` | Region label |
| `admin.destinos.form.image` | Image upload label |
| `admin.destinos.form.isActive` | Active toggle label |
| `admin.destinos.form.save` | Save button |
| `admin.destinos.form.cancel` | Cancel button |
| `admin.destinos.errors.duplicateSlug` | Duplicate slug error |
| `admin.destinos.errors.imageTooLarge` | Image too large error |

## Component Contracts

| Component | Type | Props | Boundaries |
|-----------|------|-------|------------|
| `app/[locale]/admin/destinos/page.tsx` | Server | `params: {locale}` | Fetch list, render table |
| `app/[locale]/admin/destinos/crear/page.tsx` | Server | `params: {locale}` | Render create form |
| `app/[locale]/admin/destinos/[id]/editar/page.tsx` | Server | `params: {locale, id}` | Fetch destination, render edit form |
| `app/actions/admin/destinos.ts` | Server Only | N/A | Server Actions (create, update, delete, upload) |
| `components/admin/destinos/DestinoForm.tsx` | Client | `locale, destination?, onSave` | Form with useActionState |
| `components/admin/destinos/DestinoTable.tsx` | Client | `destinations[], onSearch, onDelete` | Sortable table |
| `components/admin/destinos/ImageUpload.tsx` | Client | `onUpload, currentUrl?, bucket` | File picker + preview |

## File Changes

| File | Action |
|------|--------|
| `app/[locale]/admin/destinos/page.tsx` | Create |
| `app/[locale]/admin/destinos/crear/page.tsx` | Create |
| `app/[locale]/admin/destinos/[id]/editar/page.tsx` | Create |
| `app/actions/admin/destinos.ts` | Create |
| `components/admin/destinos/DestinoForm.tsx` | Create |
| `components/admin/destinos/DestinoTable.tsx` | Create |
| `components/admin/destinos/ImageUpload.tsx` | Create |
| `lib/supabase/storage.ts` | Create (upload helpers) |
| `lib/utils/slug.ts` | Create (slugify) |
| `supabase/migrations/20260728000001_add_destinations_seo.sql` | Create (add meta_title, meta_description) |
| `types/index.ts` | Modify (add `meta_title`, `meta_description` to Destination) |
| `messages/{en,es}.json` | Modify (add `admin.destinos.*` keys) |
