# Design: Auth UI — Missing Frontend Pages

## Technical Approach

Refactor existing stubs to match project conventions (i18n, CSS variables), add the missing UserMenu component, and integrate it into the Header. All forms reuse existing Server Actions (`login`, `register`, `updateProfile`, `uploadAvatar`). Role guards use the existing middleware (first line) + layout-level `requireAuth`/`requireAdmin` (defense-in-depth).

## Architecture Decisions

### Decision: UserMenu Server/Client split

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Full Server Component | Can't do dropdown interactivity | ❌ |
| Full Client Component | Client fetch duplicates auth check, waterfall | ❌ |
| Server wrapper + Client dropdown | Session read once server-side, interactive dropdown | ✅ |

**Rationale**: `Header` is a Server Component; `getUserRole` is `React.cache`'d. The UserMenu wrapper calls it, passes `{ fullName, role, avatarUrl }` as props to a Client dropdown. Zero extra queries.

### Decision: Admin sidebar as Server Component

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Separate sidebar component | Cleaner, matches component-per-file pattern | ✅ |
| Inline in layout | Simpler but harder to maintain | ❌ |

**Rationale**: Sidebar has its own responsive toggle state → needs a Client component for mobile toggle. Layout stays Server, delegates sidebar rendering to `AdminSidebar`.

### Decision: Existing stubs — refactor, not rewrite

All existing pages (login, register, profile) work functionally. They need:
1. i18n via `useTranslations` / `getTranslations` (currently hardcoded Spanish)
2. CSS variable migration (`gray-*`/`blue-*` → `var(--bg)`, `var(--fg)`, `var(--primary)`, `var(--border)`, `var(--muted-foreground)`)
3. Admin layout: add sidebar

**Rationale**: Zero backend changes. The middleware already handles unauthenticated redirects — layouts provide defense-in-depth for Server Component rendering.

## Data Flow

```
UserMenu:
  Header (Server)
    ├── getUserRole(supabase) → { role, user }
    └── UserMenuClient (Client) ← props: { fullName, role, avatarUrl }
          ├── Unauthenticated → <Link href="/auth/login">
          └── Authenticated → dropdown ↓
                ├── "Mi cuenta" → /mi-cuenta/perfil
                ├── "Admin" (if role=admin) → /admin/destinos
                └── <form action={logout}> → "Cerrar sesión"

Login form:
  LoginPage (Client)
    ├── useSearchParams() → ?redirect=
    ├── <input type="hidden" name="redirect" value={redirectParam} />
    └── useActionState(login, initialState)
          ├── success → server redirect (login() calls redirect())
          └── error → state.error renders in <p role="alert">

Register form:
  RegisterPage (Client)
    └── useActionState(register, initialState)
          ├── success + message → confirmation view (email required)
          ├── success → server redirect
          └── error → state.error renders, field hint from state.field

Profile form:
  PerfilPage (Server)
    ├── supabase.auth.getUser() → user
    ├── supabase.from("profiles").select() → { fullName, phone, avatarUrl }
    └── ProfileForm (Client) ← props: { defaultName, defaultPhone, avatarUrl }
          ├── useActionState(updateProfile) → profile fields
          └── useActionState(uploadAvatar) → avatar upload
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `components/layout/UserMenu.tsx` | Create | Server wrapper (getUserRole) + Client dropdown (toggle, links, logout form) |
| `components/layout/AdminSidebar.tsx` | Create | Server component with responsive sidebar nav (links: Destinos, Paquetes, Planes), mobile toggle via Client wrapper |
| `components/layout/Header.tsx` | Modify | Import and render `<UserMenu />` in the desktop right-side area before LocaleSwitcher |
| `app/[locale]/auth/login/page.tsx` | Modify | Add i18n (`useTranslations("auth.login")`), migrate colors to CSS variables |
| `app/[locale]/auth/register/page.tsx` | Modify | Add i18n (`useTranslations("auth.register")`), migrate colors to CSS variables |
| `app/[locale]/admin/layout.tsx` | Modify | Add i18n (`getTranslations("admin")`), import and render `AdminSidebar` |
| `app/[locale]/mi-cuenta/layout.tsx` | Modify | Add i18n (`getTranslations("profile")`) for the layout title |
| `app/[locale]/mi-cuenta/perfil/page.tsx` | Modify | Add i18n (`getTranslations("profile")`), migrate colors to CSS variables |
| `app/[locale]/mi-cuenta/perfil/profile-form.tsx` | Modify | Add i18n (`useTranslations("profile")`), migrate colors to CSS variables |
| `app/globals.css` | Modify | Add `--muted-foreground` token (`oklch(0.55 0.01 60 / 0.7)` for light, `oklch(0.7 0.01 60 / 0.7)` for dark) under `@theme inline` as `--color-muted-foreground` |
| `messages/es.json` | Modify | Add `auth`, `profile`, `admin`, `nav.login`, `nav.myAccount`, `nav.admin`, `nav.logout` keys |
| `messages/en.json` | Modify | Same keys translated |

## Interfaces / Contracts

```typescript
// UserMenuClient props
type UserMenuClientProps = {
  fullName: string | null;
  role: string | null;
  avatarUrl: string | null;
};

// AdminSidebar props
type AdminSidebarProps = {
  locale: string;
};

// Reused from existing code:
// AuthResult — lib/auth/errors.ts (unchanged)
// login, register, updateProfile, uploadAvatar — app/actions/auth.ts (unchanged)
// getUserRole, requireAuth, requireAdmin — lib/auth/utils.ts (unchanged)
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Build | `pnpm build` | Must pass with zero errors (strict TypeScript) |
| Visual | Login page at `/es/auth/login` | Verify i18n renders Spanish, check redirect to `/es` on login |
| Visual | Register page at `/es/auth/register` | Verify field validation, confirmation message on register |
| Visual | Admin layout at `/es/admin` | Verify sidebar renders, non-admin redirected home |
| Visual | Mi-cuenta at `/es/mi-cuenta/perfil` | Verify profile loads, form updates work |
| Visual | UserMenu in Header | Verify auth/dropdown/logout behavior |
| i18n | Toggle locale to `/en/...` | Verify all new keys render in English |

## Migration / Rollout

No migration required. Existing backend, middleware, and database unchanged. All files are new or self-contained refactors.

## Open Questions

- None. All decisions are scoped to frontend-only changes against existing backend.
