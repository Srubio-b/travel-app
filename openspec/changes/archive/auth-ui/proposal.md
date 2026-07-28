# Proposal: Auth UI — Missing Frontend Pages

## Intent

Backend auth (Server Actions, middleware, RLS, migrations) exists but users can't log in — the pages are missing. This change delivers the frontend pages and navigation to complete the auth UX.

## Scope

### In Scope
- UserMenu component in Header (session-aware)
- Login page with redirect support (`?redirect=` param)
- Register page
- Admin layout with role guard
- Mi-cuenta layout with auth guard
- Profile page with edit form + avatar upload
- i18n messages for all new UI (es/en)

### Out of Scope
- Admin CRUD operations (separate change)
- User photo collection per trip (future)
- Popups/announcements from admin (future)

## Capabilities

### New Capabilities
- `auth-pages`: Login/register page forms — validation display, redirect flow, error handling
- `profile-page`: Profile edit form + avatar upload — form interactions, preview, loading/error states
- `admin-layout`: Admin layout shell with role guard — redirects non-admin to home
- `user-menu`: Header component — shows login/account/admin/logout based on session

### Modified Capabilities
- None

## Approach

Create pages under `app/[locale]/auth/`, `app/[locale]/mi-cuenta/`, and `app/[locale]/admin/`. Build UserMenu in `components/layout/`. Reuse existing Server Actions (`login`, `register`, `updateProfile`, `uploadAvatar`) and auth utilities (`requireAuth`, `requireAdmin`). Add i18n messages for all new UI strings. No backend logic changes.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/[locale]/auth/login/page.tsx` | New | Login form |
| `app/[locale]/auth/register/page.tsx` | New | Register form |
| `app/[locale]/admin/layout.tsx` | New | Admin role guard layout |
| `app/[locale]/mi-cuenta/layout.tsx` | New | Auth guard layout |
| `app/[locale]/mi-cuenta/perfil/page.tsx` | New | Profile display page |
| `app/[locale]/mi-cuenta/perfil/profile-form.tsx` | New | Profile edit form component |
| `components/layout/UserMenu.tsx` | New | Session-aware header menu |
| `messages/es.json` | Modified | Auth UI strings |
| `messages/en.json` | Modified | Auth UI strings |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Avatar bucket missing | Low | Migration `20260727000002` exists |
| Missing i18n keys | Low | Add all keys upfront, build catches missing keys |

## Rollback Plan

Delete all new page/component files. Revert message files. Middleware and auth utilities unchanged — existing features unaffected.

## Dependencies

- Existing auth Server Actions (`app/actions/auth.ts`)
- Existing auth utilities (`lib/auth/`)
- Existing migrations (RLS trigger, avatar bucket)

## Success Criteria

- [ ] UserMenu shows "Login" when not authenticated, user name + "Mi cuenta" + "Admin" (if admin) + "Cerrar sesión" when authenticated
- [ ] Login page validates credentials, redirects to `?redirect` param or home
- [ ] Register page creates account + triggers `handle_new_user()`
- [ ] Admin layout blocks non-admin users (redirects to home)
- [ ] Mi-cuenta layout blocks unauthenticated users (redirects to login with redirect param)
- [ ] Profile page displays and updates `full_name`, `phone`, `avatar`
- [ ] Avatar upload works with preview
- [ ] `pnpm build` passes with zero errors
- [ ] All UI text uses next-intl (es/en)
