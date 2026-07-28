# Tasks: Auth — Authentication & Authorization

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 600–900 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Foundation) → PR 2 (Infra) → PR 3 (Core) → PR 4 (Integration) → PR 5 (Profile) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | RLS + Trigger + FK | PR 1 | Database — blocks public data exposure |
| 2 | Admin client + env | PR 2 | Infrastructure: `admin.ts`, `.env.local` |
| 3 | Auth actions + pages | PR 3 | Core: `app/actions/auth.ts`, login, register |
| 4 | Middleware + layouts | PR 4 | Integration: middleware chain, admin/mi-cuenta layouts |
| 5 | Profile feature | PR 5 | Feature: `getUserRole()`, profile read/update, avatar |

## Phase 1: RLS & Trigger (Foundation)

- [x] 1.1 Create migration `20260727000001_auth_rls_trigger.sql`: FK constraint, RLS policies on 4 auth tables, `handle_new_user()` trigger function
- [x] 1.2 Apply migration — add FK `profiles.id → auth.users.id on delete cascade`, enable RLS on auth tables, create trigger
- [x] 1.3 Regenerate types — **skipped**: Supabase CLI not installed on this machine. `database.types.ts` kept as-is (tables unchanged, only RLS/trigger added which don't affect public schema types)

## Phase 2: Admin Client (Infrastructure)

- [x] 2.1 Create `lib/supabase/admin.ts` with `createAdminClient()` using `SUPABASE_SERVICE_ROLE_KEY`
- [x] 2.2 Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` with placeholder. **nota**: `next.config.ts` env block no necesario — Next.js expone automáticamente las variables sin prefijo `NEXT_PUBLIC_` solo al server

## Phase 3: Server Actions + Pages (Core)

- [x] 3.1 Create `lib/auth/errors.ts` with `AuthResult` union type + `mapAuthError()` sanitizer
- [x] 3.2 Create `lib/auth/utils.ts` with `getUserRole()` (React.cache), `requireAdmin()`, `requireAuth()` helpers
- [x] 3.3 Create `app/actions/auth.ts` with `login()`, `register()`, `logout()`, `updateProfile()`, `uploadAvatar()` Server Actions
- [x] 3.4 Create `app/[locale]/auth/login/page.tsx` with email/password form → Server Action
- [x] 3.5 Create `app/[locale]/auth/register/page.tsx` with email/password form, client-side min 6 chars validation
- [x] 3.6 Server.ts review — cookie handling already correct (try/catch for Server Components). No changes needed.

## Phase 4: Middleware + Layouts (Integration)

- [x] 4.1 Compose `middleware.ts`: next-intl i18n first, then auth `getUser()`, redirect on protected/auth routes
- [x] 4.2 Create `app/[locale]/admin/layout.tsx` with role gate (admin only, uses `requireAdmin()`)
- [x] 4.3 Create `app/[locale]/mi-cuenta/layout.tsx` with auth gate (uses `requireAuth()`)

## Phase 5: Profile (Feature)

- [x] 5.1 Create `app/[locale]/mi-cuenta/perfil/page.tsx`: reads name/phone/avatar from `profiles` via RLS
- [x] 5.2 Create `app/[locale]/mi-cuenta/perfil/profile-form.tsx`: Client Component with name + phone edit via `updateProfile()` Server Action
- [x] 5.3 Create `avatars` Storage bucket with RLS policies; `uploadAvatar()` Server Action saves to storage/{userId}/{uuid}.ext, updates `profiles.avatar_url`

## 🔧 Post-Review Fixes

- [x] **CRITICAL-1**: Migration now self-contained — `CREATE TABLE IF NOT EXISTS` for `roles`, `profiles`, `user_roles`, `client_trips`, `referral_codes` + seed roles
- [x] **CRITICAL-2**: Server Actions read `NEXT_LOCALE` cookie instead of hardcoded `/es`
- [x] **CRITICAL-3**: `login()` reads `redirect` hidden input from form; login page passes `redirect` from `useSearchParams()`
- [x] **CRITICAL-4**: `register()` checks `data.session` after signUp — returns `{ success, message }` instead of redirect when email confirmation is required
- [x] **CRITICAL-5**: New migration `20260727000002_create_avatars_bucket.sql` with bucket creation + RLS policies (SELECT public, INSERT/UPDATE/DELETE own)
- [x] **WARNING-1**: `mapAuthError()` in `lib/auth/errors.ts` sanitizes all Supabase errors before returning to client
- [x] **WARNING-2**: Server-side phone validation in `updateProfile()` (`/^[\d\s+\-()]{7,20}$/`)
- [x] **WARNING-3**: `updated_at: new Date().toISOString()` added to `updateProfile()` updates + trigger function `update_updated_at_column()` on `profiles` and `client_trips`
- [x] **WARNING-4**: Login/register links use `usePathname()` for locale instead of hardcoded `/es`
- [x] **WARNING-5**: Server-side `full_name` validation (≥2 chars) in `register()`
- [x] **WARNING-6**: Avatar upload deletes previous avatar from Storage before uploading new one
- [x] **WARNING-7**: `update_updated_at_column()` trigger function applied to `profiles` and `client_trips`
