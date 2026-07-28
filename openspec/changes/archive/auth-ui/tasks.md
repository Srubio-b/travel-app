# Tasks: Auth UI — Missing Frontend Pages

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~425 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | auto-forecast |
| Chain strategy | not_applicable |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: not_applicable
400-line budget risk: Medium

## Phase 1: Foundation — Tokens & i18n

- [x] 1.1 Add `--muted-foreground` token to `app/globals.css` under `@theme inline` as `--color-muted-foreground`
- [x] 1.2 Add `auth.*`, `profile.*`, `admin.*`, `nav.login`, `nav.myAccount`, `nav.admin`, `nav.logout` keys to `messages/es.json`
- [x] 1.3 Add same keys (English translations) to `messages/en.json`

## Phase 2: UserMenu

- [x] 2.1 Create `components/layout/UserMenu.tsx` — Server wrapper that calls `getUserRole()`, passes `{ fullName, role, avatarUrl }` to a Client dropdown component
- [x] 2.2 Create inline `UserMenuClient` — dropdown with toggle, click-outside/Escape close, i18n via `useTranslations("nav")`, logout form calling `logout()`
- [x] 2.3 Modify `components/layout/Header.tsx` — import and render `<UserMenu />` between desktop nav and LocaleSwitcher

## Phase 3: AdminSidebar

- [x] 3.1 Create `components/layout/AdminSidebar.tsx` — Server component with responsive sidebar nav (links: Destinos, Paquetes, Planes via `getTranslations("admin.sidebar")`), mobile toggle via Client wrapper
- [x] 3.2 Integrate `AdminSidebar` into `app/[locale]/admin/layout.tsx` — import, render alongside guard + `{children}`

## Phase 4: Refactor Existing Pages (i18n + CSS Variables)

- [x] 4.1 Refactor `app/[locale]/auth/login/page.tsx` — add `useTranslations("auth.login")`, replace hardcoded strings and Tailwind color classes with CSS variable tokens (`border-border`, `text-muted-foreground`, `bg-primary`)
- [x] 4.2 Refactor `app/[locale]/auth/register/page.tsx` — add `useTranslations("auth.register")`, same CSS variable migration
- [x] 4.3 Refactor `app/[locale]/mi-cuenta/layout.tsx` — add `getTranslations("profile")` for the layout title
- [x] 4.4 Refactor `app/[locale]/mi-cuenta/perfil/page.tsx` — add `getTranslations("profile")`, CSS variable migration for `<dl>` labels and border classes
- [x] 4.5 Refactor `app/[locale]/mi-cuenta/perfil/profile-form.tsx` — add `useTranslations("profile")`, CSS variable migration for all labels, inputs, buttons, error/success text

## Verification

- [x] 5.1 `pnpm build` passes with zero TypeScript errors
- [ ] 5.2 Visual check: login page renders with i18n, redirect works
- [ ] 5.3 Visual check: register page validates fields, shows confirmation message
- [ ] 5.4 Visual check: admin layout renders sidebar, blocks non-admin
- [ ] 5.5 Visual check: UserMenu shows login link / user dropdown with logout
- [ ] 5.6 Visual check: profile page loads, form updates work, avatar upload shows preview
- [ ] 5.7 i18n check: toggle locale to `/en/...`, verify all new keys render in English
