# Design: Auth — Authentication & Authorization

## Technical Approach

Email/password auth via Supabase Auth + `@supabase/ssr`. Server Actions handle login/register/logout. Middleware composes next-intl i18n + auth route protection in a single chain. DB trigger auto-creates profile + `cliente` role on signup. RLS secures all auth tables. Admin operations bypass RLS via `service_role` client.

## Architecture Decisions

### Decision: Middleware chain (i18n + auth)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Migrate to `proxy.ts` | Next.js 16 deprecates middleware.ts, proxy.ts only supports Node.js runtime. next-intl `createMiddleware` requires Edge Runtime. | **Keep `middleware.ts`** — deprecation warning only, no runtime breakage. Migrate when next-intl supports Node.js proxy. |
| Two separate files | Impossible — Next.js only allows one file. | **Single file, composed chain**: i18n middleware first, then auth check on response. |
| Auth in layout instead | Layouts don't run on 404/redirect, can't block static assets. | **Middleware required** for proper route protection. |

### Decision: Server Actions location

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `app/actions/auth.ts` | Standard Next.js convention, colocated with app directory. | **Use this path.** Each action returns `{error?: string}` to avoid redirect complications with i18n. |
| Route handlers (API) | More boilerplate, no `redirect()` from `next/navigation`. | **Rejected** — Server Actions are simpler for form-based auth. |

### Decision: Admin client key

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` | Required for RLS bypass on catalog CRUD. Missing key = admin panel broken. | **Document as required.** Admin layout checks key presence at build/runtime. |
| Use anon key for admin | RLS policies for admin would need `auth.uid()` in catalog tables — slow and couples auth to RLS. | **Rejected** — service_role is canonical pattern for admin bypass. |

### Decision: Role check caching

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `React.cache(getUserRole)` | Deduplicates within same render, no external cache. | **Use `React.cache`** — simplest, request-scoped, no stale data risk. |
| Global store or Redis | Overkill for two roles. | **Rejected** — not needed at this scale. |

## Middleware: Edge Runtime Cookie Pattern

Middleware runs in Edge Runtime, NOT Node.js. `createServerClient` requires explicit cookie get/set via the `NextRequest`/`NextResponse` objects — `next/headers` `cookies()` is NOT available in Edge Runtime.

```typescript
import createI18nMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/lib/i18n/routing";

const i18nMiddleware = createI18nMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Step 1: i18n — let next-intl handle locale routing first
  let response = i18nMiddleware(request);
  if (response) return response; // redirect/rewrite handled

  // Step 2: auth
  response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const locale = request.nextUrl.locale || "es";

  // Protected: /admin/* → only admin role
  if (path.startsWith(`/${locale}/admin`)) {
    if (!user) return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
    // role check delegated to admin layout (avoids extra query on every request)
  }

  // Protected: /mi-cuenta/* → any authenticated user
  if (path.startsWith(`/${locale}/mi-cuenta`)) {
    if (!user) return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
  }

  // Redirect authenticated users away from login/register
  if (path.startsWith(`/${locale}/auth/login`) || path.startsWith(`/${locale}/auth/register`)) {
    if (user) return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
```

**Composition order**: i18n runs first (locale detection, redirect). If no redirect, auth runs on the response. This ensures locale is always resolved before checking routes.

## Data Flow

```
Request → middleware.ts
  ├─ i18n (createMiddleware routing) → locale detection, redirect
  └─ auth (getUser) → redirect if unauthenticated on protected routes

Login flow:
  User → /[locale]/auth/login → Server Action → supabase.auth.signInWithPassword
    → success → redirect to /[locale] or intended path
    → error → return { error } to form

Register flow:
  User → /[locale]/auth/register → Server Action → supabase.auth.signUp
    → success → redirect to /[locale]
    → DB trigger fires: INSERT profiles + user_roles (role_id=2)
```

**Note**: Register trigger failure is atomic — if the trigger fails (e.g. FK violation), PostgreSQL reverts the entire auth.users insert. The user won't be created. This is intentional: auth and profile creation are an all-or-nothing operation.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `middleware.ts` | Modify | Compose next-intl + auth chain. Check protected routes. |
| `lib/supabase/admin.ts` | Create | Server client with `SUPABASE_SERVICE_ROLE_KEY` — export `createAdminClient()`. |
| `lib/supabase/server.ts` | Modify | Minor: cookie handling tweaks. **Keep `createClient` export** — no rename. |
| `app/actions/auth.ts` | Create | Server Actions: `login`, `register`, `logout`, `updateProfile`. |
| `app/[locale]/auth/login/page.tsx` | Create | Login page with form → Server Action. |
| `app/[locale]/auth/register/page.tsx` | Create | Register page with form → Server Action. Client-side password validation (min 6 chars, Supabase Auth default). |
| `app/[locale]/admin/layout.tsx` | Create | Role gate: only `admin` (role_id=1) can access children. |
| `app/[locale]/mi-cuenta/layout.tsx` | Create | Auth gate: redirect to login if no session. |
| `lib/auth/utils.ts` | Create | `getUserRole()`, `requireAdmin()`, `requireAuth()` helpers. |
| `lib/auth/errors.ts` | Create | Typed auth error responses. |
| `.env.local` | Modify | Add `SUPABASE_SERVICE_ROLE_KEY`. |
| `supabase/migrations/<timestamp>_auth_rls_trigger.sql` | Create | Migration: RLS for auth tables + trigger + `handle_new_user()` + FK constraint. |
| `lib/supabase/database.types.ts` | Modify | Regenerate after migration. |

**CRIT-1 fix**: `server.ts` keeps `createClient` export. The 4 existing imports (`page.tsx`, `paquetes/page.tsx`, `paquetes/[slug]/page.tsx`, `destinos/[slug]/page.tsx`) remain unchanged. New `admin.ts` exports `createAdminClient()` — no name collision.

## Interfaces / Contracts

```typescript
// lib/auth/errors.ts
export type AuthResult =
  | { success: true }
  | { success: false; error: string; field?: keyof FormData };

// lib/auth/utils.ts
import { cache } from "react";

export const getUserRole = cache(async (supabase: SupabaseClient<Database>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { role: null, user: null };

  const { data } = await supabase
    .from("user_roles")
    .select("role_id, roles!inner(name)")
    .eq("user_id", user.id)
    .maybeSingle();

  return { role: data?.roles?.name ?? null, user };
});

// updateProfile (referenced in Server Actions)
export async function updateProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  data: { full_name?: string; phone?: string; avatar_url?: string },
): Promise<AuthResult>;
```

**Password validation**: Client-side checks `password.length >= 6` before submitting. Supabase Auth enforces minimum 6 chars server-side by default. The form shows inline error if validation fails. This prevents unnecessary API round-trips for obviously invalid passwords.

## Migration SQL (with FK constraint)

```sql
-- WARN-2 fix: FK constraint profiles.id → auth.users.id
alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users(id) on delete cascade;

-- DB Trigger: handle_new_user()
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));

  insert into public.user_roles (user_id, role_id)
  values (new.id, 2); -- role_id=2 = cliente

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
```

**SUG-1 note**: If `handle_new_user()` fails (e.g. FK violation from missing `auth.users` row — improbable given the trigger is `after insert on auth.users`), PostgreSQL reverts the entire transaction. The user creation is atomic. This is intentional.

## RLS Policies

| Table | Policy | Action | Scope |
|-------|--------|--------|-------|
| `profiles` | `user_select_own` | SELECT | `id = auth.uid()` |
| `profiles` | `user_update_own` | UPDATE | `id = auth.uid()` WITH CHECK same |
| `user_roles` | `user_select_own` | SELECT | `user_id = auth.uid()` |
| `client_trips` | `user_select_own` | SELECT | `client_id = auth.uid()` |
| `client_trips` | `user_insert_own` | INSERT | `client_id = auth.uid()` |
| `client_trips` | `user_update_own` | UPDATE | `client_id = auth.uid()` |
| `referral_codes` | `user_select_own` | SELECT | `client_id = auth.uid()` |
| `roles` | No RLS | — | Reference table, anon can read |

**Catalog tables** (`travel_packages`, `destinations`, etc.): existing anon select policies remain. Admin writes use `admin.ts` (service_role bypass). No RLS changes needed. `roles` RLS intentionally NOT enabled — it's read-only reference (2 rows).

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `getUserRole()`, `AuthResult` types | Manual assertions (no test runner) |
| Integration | Register → profile created, RLS blocks cross-user reads | `execute_sql` queries against Supabase |
| Integration | Middleware chain: i18n + auth redirect | Manual test in browser with both locales |
| E2E | Full login/logout flow, protected routes | Manual verification checklist |

**No test runner configured** (`strict_tdd: false`) — tests are manual until vitest/playwright is added.

## Migration / Rollout

1. **Phase 1 — RLS & Trigger**: Apply migration. Enable RLS on auth tables. Create trigger + FK constraint. ✅ Blocks public data exposure.
2. **Phase 2 — Admin client**: Create `lib/supabase/admin.ts`. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`.
3. **Phase 3 — Server Actions + Pages**: Create auth actions, login/register pages.
4. **Phase 4 — Middleware**: Compose i18n + auth chain. Create protected layouts.
5. **Phase 5 — Profile**: `getUserRole()`, profile read/update, avatar upload.

**Rollback**: Revert each phase independently.
- Middleware: restore original `middleware.ts` from git.
- RLS/trigger/FK: **NOT via `supabase migration repair`** (that only marks migration as reverted, it doesn't execute inverse SQL). Instead, apply a **manual down migration**:

```sql
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
alter table public.profiles drop constraint if exists profiles_id_fkey;

-- Disable RLS on auth tables
alter table public.profiles disable row level security;
alter table public.user_roles disable row level security;
alter table public.client_trips disable row level security;
alter table public.referral_codes disable row level security;

-- Drop all policies (one per table)
drop policy if exists user_select_own on public.profiles;
drop policy if exists user_update_own on public.profiles;
-- ... repeat for user_roles, client_trips, referral_codes
```

Then run `supabase migration repair --status reverted <timestamp>` to mark it.

## Open Questions

- [ ] Next.js 16.2.10: confirm middleware.ts still works without build error (speculative — compatible per docs)
- [ ] next-intl v4: confirm `createMiddleware` still uses Edge Runtime (prevents proxy.ts migration)
- [ ] Avatar storage bucket: not created yet. Will `avatar` images go in a new bucket or existing `package-images`?
- [ ] Passwordless/reset flows excluded from MVP — confirm this stays out of scope
