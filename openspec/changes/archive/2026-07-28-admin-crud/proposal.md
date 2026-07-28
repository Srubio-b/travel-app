# Proposal: Admin CRUD — Destinos & Paquetes

## Intent

Admin panel has layout + sidebar placeholders but no working CRUD pages. Catalog content requires raw DB access. Give admins full control over destinations and travel packages via a functional admin UI.

## Scope

**In:**
1. Destinos CRUD — list, create, edit, soft-delete + image upload (Supabase Storage)
2. Paquetes CRUD — list, create, edit, soft-delete + destination multi-select + image gallery + draft/published workflow
3. Admin Server Actions for all write operations
4. Supabase Storage uploads (`destinos/` + `paquetes/` buckets)
5. DB migration: add `meta_title`, `meta_description` columns to `destinations`
6. i18n for all admin UI strings (es/en)

**Out:**
- Planes section (entity not yet defined)
- Client trip management / referral codes / popups / announcements

## Capabilities

### New
- `admin-destinos-crud`: Admin CRUD for destinations — list, create, edit, soft-delete, image upload
- `admin-paquetes-crud`: Admin CRUD for travel packages — list, create, edit, soft-delete, destination association, image gallery, draft/published lifecycle

### Modified
None

## Approach

- **Pages**: Server Components at `app/[locale]/admin/destinos/` and `app/[locale]/admin/paquetes/`
- **Forms**: Client Components with `useActionState` for create/edit
- **Data**: `createAdminClient()` for all DB operations (RLS bypass via service_role)
- **Storage**: Supabase Storage via admin client
- **Slugs**: auto-generated via `slugify(name)` — admin can override in form
- **Draft/published**: `is_active` + `published_at` — draft by default, publish explicitly
- **Delete**: soft delete (`deleted_at`), excluded from list by default

## Affected Areas

| Area | Impact |
|------|--------|
| `app/[locale]/admin/destinos/` | New — list, create, edit pages |
| `app/[locale]/admin/paquetes/` | New — list, create, edit pages |
| `app/actions/admin/` | New — Server Actions |
| `components/admin/` | New — reusable form components |
| `lib/supabase/storage.ts` | New — upload helpers |
| `messages/{en,es}.json` | Modified — add CRUD i18n keys |
| `components/layout/AdminSidebar.tsx` | Modified — active page highlighting |
| `supabase/migrations/20260728000001_add_destinations_seo.sql` | New — add `meta_title`, `meta_description` to destinations |
| `types/index.ts` | Modified — update Destination type |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Storage buckets missing | Low | Setup docs in README / migration script |
| Image upload size abuse | Low | Client-side + server-side validation |
| Soft-delete filter omission | Low | Apply `.is('deleted_at', null)` in all list queries |

## Rollback Plan

- Vercel: rollback to previous deployment
- DB: revert migration via `supabase migration repair`
- Soft deletes are reversible by setting `deleted_at = null`
- Orphaned Storage images: no functional impact

## Dependencies

- Supabase Storage buckets (`destinos`, `paquetes`) created
- Slug utility (`slugify`) — create in `lib/utils/slug.ts` if absent

## Success Criteria

- [ ] Admin views destinations table with search/filter
- [ ] Admin creates destination (name, slug override, description, country, region, image)
- [ ] Admin edits any destination field including replacing image
- [ ] Admin soft-deletes destination (`deleted_at`)
- [ ] Admin views packages with draft/published status badge
- [ ] Admin creates package (all fields + destination multi-select + gallery upload)
- [ ] Admin edits package (manage destinations + reorder/remove images)
- [ ] Admin toggles draft/published state
- [ ] Admin soft-deletes package
- [ ] `pnpm build` passes with zero errors
- [ ] All UI text uses i18n (es/en)
