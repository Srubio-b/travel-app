# Design: Admin CRUD — Destinos & Paquetes

## Technical Approach

Server Components fetch data and render page shell; Client Forms with `useActionState` handle all mutations via Server Actions backed by `createAdminClient()`. Two entity domains share reusable admin UI primitives (`AdminTable`, `AdminFormLayout`, `ImageUploader`) to avoid duplication across destinos and paquetes.

## Architecture Decisions

### DB Access

| Option | Tradeoff | Decision |
|--------|----------|----------|
| RLS-based client for admin | RLS policies must allow admin role; fragile | **`createAdminClient()`** (service_role) — already exists, no RLS complexity |
| Direct `supabase-js` in Server Actions | Already the pattern in `app/actions/auth.ts` | **Use existing** `"use server"` + `FormData` + `_prev` pattern |

### Component Reuse

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Separate everything per entity | Max duplication | **Shared primitives**: `AdminTable`, `AdminFormLayout`, `ImageUploader` in `components/admin/ui/` |
| Entity-specific form bodies | Different fields per entity | **Keep separate** — `DestinoFormFields`, `PaqueteFormFields` wrap shared layout |

### Storage Buckets

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Single bucket per entity type | Clean separation, simpler RLS | **`destinos/`** (flat, `{uuid}.ext`), **`paquetes/`** (`{package-id}/{uuid}.ext`) |
| Upload via admin client | Already have `createAdminClient()` | **Yes** — consistent, no RLS bucket policies needed |

### Slug Generation

| Option | Tradeoff | Decision |
|--------|----------|----------|
| DB trigger on INSERT | Harder to preview | **Client-side** `slugify()` in `lib/utils/slug.ts`, admin can override; Server validates uniqueness |
| Always auto | No control | **Override allowed** — explicit slug field in form |

### Server Action Security

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Trust page-level guard only | Admin layout guards page rendering, but Server Actions are POST endpoints | **requireAdmin() in every Server Action** — defense-in-depth |
| Use createClient() + requireAdmin() then switch to createAdminClient() | Slight overhead (2 Supabase clients) | **Required** — first verify session via user client, then use admin client for DB ops |

### Search & Pagination

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Client-side search (filter JS array) | Fast UX, breaks with pagination | **Server-side ILIKE** via URL searchParams — Server Component re-fetches with filter |
| Pagination: client-side (all rows) | Simple, but breaks with large datasets | **Server-side LIMIT/OFFSET** via URL searchParams — default 20 per page |

### Soft Delete

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Hard DELETE | Cascade issues, no audit trail | **`deleted_at = now()`** on `destinations` and `travel_packages` |
| Same filter everywhere | Must remember `.is('deleted_at', null)` | **Wrapped** in reusable query builders in Server Actions |

## Data Flow

```
LIST:   Server Page → createAdminClient() → .select().is('deleted_at',null) → Client Table (read-only)
        Search: server-side ILIKE on name/description via URL searchParams, re-renders Server Page

CREATE: Client Form → useActionState → Server Action → requireAdmin() check → upload (if image) → insert DB → revalidatePath → redirect
EDIT:   Server Page → createAdminClient() → .select().eq('id',id) → prefill Client Form → useActionState → Server Action → requireAdmin() check → update DB → revalidatePath → redirect
DELETE: Client Button → confirm dialog → Server Action → requireAdmin() check → .update({deleted_at:now()}) → revalidatePath → redirect
                ↓
        Soft-delete: row kept, excluded from all list queries
        Pagination: server-side LIMIT/OFFSET via URL searchParams (?page=&limit=)
```
```

```
┌─────────────────────────────────────────────────────────┐
│  Server Component (page.tsx)                            │
│  ┌─────────────────────────────────────────────────┐    │
│  │  AdminTable (Client) ← props: data, columns     │    │
│  │  └─ onDelete → confirm → Server Action ────────┘    │
│  │  └─ onSearch → URL searchParams (client nav)         │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  Server Component (crear/page.tsx, [id]/editar/page.tsx)│
│  ┌──────────────────────────────────────────────────┐   │
│  │  AdminFormLayout (Client) ← props: fields array  │   │
│  │  ├─ DestinoFormFields / PaqueteFormFields        │   │
│  │  ├─ ImageUploader/Gallery (Client)              │   │
│  │  └─ useActionState → Server Action               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## File Changes

### Shared / Infrastructure

| File | Action |
|------|--------|
| `lib/utils/slug.ts` | Create — `slugify(text)` utility |
| `lib/supabase/storage.ts` | Create — `uploadImage(bucket, file, path?)`, `deleteImage(bucket, path)` using admin client |
| `supabase/migrations/20260728000001_add_destinations_seo.sql` | Create — add `meta_title`, `meta_description` to `destinations` |
| `supabase/migrations/20260728000002_create_admin_buckets.sql` | Create — `destinos` + `paquetes` Storage buckets |

### Reusable Admin Components

| File | Action |
|------|--------|
| `components/admin/ui/AdminTable.tsx` | Create — generic data table: columns config, search input, pagination slot |
| `components/admin/ui/AdminFormLayout.tsx` | Create — form wrapper: title, back link, error summary, submit/cancel |
| `components/admin/ui/ImageUploader.tsx` | Create — single image: file picker, preview, upload button (returns URL) |
| `components/admin/ui/ConfirmDialog.tsx` | Create — reusable delete confirmation modal |

### Destinos CRUD

| File | Action |
|------|--------|
| `app/[locale]/admin/destinos/page.tsx` | Create — list page, Server Component fetches + renders AdminTable |
| `app/[locale]/admin/destinos/crear/page.tsx` | Create — create page, Server Component renders form |
| `app/[locale]/admin/destinos/[id]/editar/page.tsx` | Create — edit page, Server Component fetches destination + renders form |
| `components/admin/destinos/DestinoFormFields.tsx` | Create — form fields (name, slug, description, country, region, is_active) |
| `app/actions/admin/destinos.ts` | Create — Server Actions: `createDestino`, `updateDestino`, `deleteDestino` |

### Paquetes CRUD

| File | Action |
|------|--------|
| `app/[locale]/admin/paquetes/page.tsx` | Create — list page with status badges |
| `app/[locale]/admin/paquetes/crear/page.tsx` | Create — create page, fetches destinations for multi-select |
| `app/[locale]/admin/paquetes/[id]/editar/page.tsx` | Create — edit page, fetches package + relations |
| `components/admin/paquetes/PaqueteFormFields.tsx` | Create — form fields (title, slug, description, price, duration, includes/excludes, is_national, publish toggle) |
| `components/admin/paquetes/DestinoMultiSelect.tsx` | Create — searchable checkbox list of destinations |
| `components/admin/paquetes/ImageGallery.tsx` | Create — gallery with add/remove/set-primary/reorder |
| `app/actions/admin/paquetes.ts` | Create — Server Actions: `createPaquete`, `updatePaquete`, `deletePaquete`, `togglePublish` |

### Existing File Modifications

| File | Action |
|------|--------|
| `types/index.ts` | Modify — add `meta_title: string \| null`, `meta_description: string \| null` to `Destination` |
| `lib/supabase/database.types.ts` | Modify — add `meta_title`, `meta_description` to `destinations` Row/Insert/Update |
| `messages/en.json` | Modify — add `admin.destinos.*`, `admin.paquetes.*` keys |
| `messages/es.json` | Modify — add `admin.destinos.*`, `admin.paquetes.*` keys |
| `components/layout/AdminSidebar.tsx` | Modify — wrap nav links in `AdminSidebarNav` (Client) that reads `usePathname()` for `aria-current="page"` highlighting |

## Interfaces / Contracts

```typescript
// Server Action return type (shared pattern, matches AuthResult)
type ActionResult = {
  success: boolean;
  error?: string;
  field?: string;       // field-level error key
  data?: { id: string }; // created/updated entity
};

// AdminTable column config
type Column<T> = {
  key: string;
  label: string;            // i18n key
  render?: (row: T) => ReactNode;
  sortable?: boolean;
};

type AdminTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  searchValue?: string;
  onSearch?: (value: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  actions?: (row: T) => ReactNode;  // extra action buttons
};
```

## Migration

```sql
-- 20260728000001_add_destinations_seo.sql
ALTER TABLE destinations
  ADD COLUMN meta_title       varchar(70),
  ADD COLUMN meta_description varchar(160);
```

## Testing Strategy

No test runner configured (`openspec/config.yaml`: `testing.runner: null`). Quality enforced via:
- **TypeScript strict** — compiler catches shape mismatches
- **ESLint** — `eslint-config-next/core-web-vitals`
- **Build check** — `pnpm build` must pass per success criteria

## Open Questions

- [ ] **Bucket naming**: The existing `package-images` bucket (from catalog migration) serves public package images. The new `paquetes/` bucket serves admin-uploaded gallery images. These can coexist — admin writes to `paquetes/`, and the existing catalog queries the `package_images` table which stores URLs from either bucket. No naming collision at DB level. Resolved: **keep both, admin writes to `paquetes/` bucket**.
