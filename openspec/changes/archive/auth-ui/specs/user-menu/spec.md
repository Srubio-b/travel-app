# UserMenu Specification

## Purpose

Session-aware header component (Desktop) that shows login/account/admin/logout based on authentication status and role. Renders inside the existing `Header` component alongside `LocaleSwitcher` and `ThemeToggle`.

## Requirements

### Requirement: Session-aware rendering

The UserMenu MUST read the current session and role via `getUserRole()`. When no session exists, show a "Login" link. When authenticated, show the user's name + dropdown with role-appropriate links and logout.

#### Scenario: Unauthenticated — show login
- GIVEN no session
- WHEN the Header renders
- THEN UserMenu shows a "Iniciar sesión" / "Sign in" link pointing to `/auth/login`

#### Scenario: Authenticated as client
- GIVEN a session with role `cliente`
- WHEN the Header renders
- THEN UserMenu shows the user's `full_name` and a dropdown with "Mi cuenta" and "Cerrar sesión"

#### Scenario: Authenticated as admin
- GIVEN a session with role `admin`
- WHEN the Header renders
- THEN UserMenu shows the user's `full_name` and a dropdown with "Mi cuenta", "Panel de administración", and "Cerrar sesión"

### Requirement: Logout action

The "Cerrar sesión" / "Sign out" button MUST invoke the `logout()` Server Action which signs out and redirects home.

#### Scenario: Logout
- GIVEN an authenticated user
- WHEN the user clicks "Cerrar sesión"
- THEN `logout()` is called, session ends, and the user is redirected to home

### Requirement: Dropdown behavior

The dropdown MUST toggle on click, close on clicking outside or pressing Escape, and include a clear visual divider between navigation links and the logout action.

### Requirement: i18n for UserMenu

The system MUST provide UserMenu strings in es and en under `nav.*` to align with the existing `nav` namespace.

| Key | es | en |
|-----|----|----|
| `nav.login` | Iniciar sesión | Sign in |
| `nav.myAccount` | Mi cuenta | My account |
| `nav.admin` | Admin | Admin |
| `nav.logout` | Cerrar sesión | Sign out |

## File Changes

| File | Action |
|------|--------|
| `components/layout/UserMenu.tsx` | New — session-aware dropdown component |
| `components/layout/Header.tsx` | Modified — import and render UserMenu in desktop right-side area |
| `messages/es.json` | Modified — add `nav.login`, `nav.myAccount`, `nav.admin`, `nav.logout` |
| `messages/en.json` | Modified — add `nav.login`, `nav.myAccount`, `nav.admin`, `nav.logout` |
