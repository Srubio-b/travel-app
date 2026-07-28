# Tasks: Admin CRUD — Destinos & Paquetes

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1470 |
| 800-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Infra + Shared UI + Sidebar → PR 2: Destinos → PR 3: Paquetes + i18n |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
800-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Base |
|------|------|-----------|------|
| 1 | Infrastructure, shared UI components, sidebar nav fix | PR 1 | main |
| 2 | Destinos CRUD (actions + pages + form fields) | PR 2 | main or PR 1 |
| 3 | Paquetes CRUD + i18n keys + build verification | PR 3 | main or PR 2 |

## Phase 1: Infrastructure

- [x] 1.1 Create `lib/utils/slug.ts` — `slugify(text: string): string` utility
- [x] 1.2 Create `lib/supabase/storage.ts` — `uploadImage`, `deleteImage` helpers via admin client
- [x] 1.3 Create migration `20260728000001_add_destinations_seo.sql` — add `meta_title`, `meta_description` to `destinations`
- [x] 1.4 Create migration `20260728000002_create_admin_buckets.sql` — create `destinos` + `paquetes` Storage buckets
- [x] 1.5 Update `types/index.ts` — add `meta_title`, `meta_description` to `Destination`
- [x] 1.6 Update `database.types.ts` — add columns to `destinations` Row/Insert/Update

## Phase 2: Shared UI Components

- [x] 2.1 Create `components/admin/ui/AdminTable.tsx` — generic data table with columns config, search input, pagination slot
- [x] 2.2 Create `components/admin/ui/AdminFormLayout.tsx` — form wrapper with title, back link, error summary, submit/cancel
- [x] 2.3 Create `components/admin/ui/ImageUploader.tsx` — file picker + preview + upload (returns URL)
- [x] 2.4 Create `components/admin/ui/ConfirmDialog.tsx` — reusable delete confirmation modal

## Phase 3: Sidebar Active Nav

- [x] 3.1 Add `AdminSidebarNav` Client wrapper in `AdminSidebar.tsx` — reads `usePathname()` for `aria-current="page"` highlighting

## Phase 4: Destinos CRUD

- [x] 4.1 Create `app/actions/admin/destinos.ts` — `createDestino`, `updateDestino`, `deleteDestino` with `requireAdmin()` + admin client
- [x] 4.2 Create `components/admin/destinos/DestinoFormFields.tsx` — name, slug, description, country, region, image, is_active
- [x] 4.3 Create `app/[locale]/admin/destinos/page.tsx` — list page with server-side search + pagination via AdminTable
- [x] 4.4 Create `app/[locale]/admin/destinos/crear/page.tsx` — create page with AdminFormLayout + DestinoFormFields
- [x] 4.5 Create `app/[locale]/admin/destinos/[id]/editar/page.tsx` — edit page, prefills form from fetched destination

## Phase 5: Paquetes CRUD

- [x] 5.1 Create `app/actions/admin/paquetes.ts` — `createPaquete`, `updatePaquete`, `deletePaquete`, `togglePublish` with `requireAdmin()`
- [x] 5.2 Create `components/admin/paquetes/PaqueteFormFields.tsx` — title, slug, description, price, duration, includes/excludes, is_national, publish toggle
- [x] 5.3 Create `components/admin/paquetes/DestinoMultiSelect.tsx` — searchable checkbox list of destinations
- [x] 5.4 Create `components/admin/paquetes/ImageGallery.tsx` — add/remove/reorder/set-primary gallery images
- [x] 5.5 Create `app/[locale]/admin/paquetes/page.tsx` — list page with draft/published/national status badges
- [x] 5.6 Create `app/[locale]/admin/paquetes/crear/page.tsx` — create page, fetches destinations list for multi-select
- [x] 5.7 Create `app/[locale]/admin/paquetes/[id]/editar/page.tsx` — edit page, fetches package + relations

## Phase 6: i18n + Build

- [x] 6.1 Add `admin.destinos.*` i18n keys to `messages/en.json` and `messages/es.json`
- [x] 6.2 Add `admin.paquetes.*` i18n keys to `messages/en.json` and `messages/es.json`
- [x] 6.3 Run `pnpm build` — verify zero errors
