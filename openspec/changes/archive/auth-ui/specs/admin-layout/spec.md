# Admin Layout Specification

## Purpose

Layout shell for `/admin/*` pages with role-based guard and sidebar navigation for future CRUD sections.

## Requirements

### Requirement: Admin role guard

The admin layout MUST call `requireAdmin()` which redirects unauthenticated users to `/auth/login?redirect=` and non-admin authenticated users to home (`/${locale}`).

#### Scenario: Admin accesses admin page
- GIVEN a user with role `admin`
- WHEN navigating to `/admin/destinos`
- THEN the admin layout renders with the sidebar

#### Scenario: Client blocked from admin
- GIVEN a user with role `cliente`
- WHEN navigating to `/admin/destinos`
- THEN `requireAdmin()` redirects to home (`/es/`)

#### Scenario: Unauthenticated blocked
- GIVEN no session
- WHEN navigating to `/admin`
- THEN middleware redirects to `/auth/login?redirect=/es/admin`

### Requirement: Admin sidebar navigation

The layout SHALL render a vertical sidebar with links to future CRUD sections: Destinos, Paquetes, Planes. The sidebar SHALL be collapsible on mobile.

#### Scenario: Sidebar visible
- GIVEN an admin user on any `/admin/*` page
- THEN the sidebar shows links to Destinos, Paquetes, Planes with the current page highlighted

#### Scenario: Mobile sidebar toggle
- GIVEN an admin user on a mobile viewport
- WHEN the sidebar is hidden
- THEN a hamburger button toggles the sidebar visibility

### Requirement: i18n for admin layout

The system MUST provide admin sidebar labels in es and en under the `admin` namespace.

| Key | es | en |
|-----|----|----|
| `admin.title` | Panel de administración | Admin panel |
| `admin.sidebar.destinations` | Destinos | Destinations |
| `admin.sidebar.packages` | Paquetes | Packages |
| `admin.sidebar.plans` | Planes | Plans |

## File Changes

| File | Action |
|------|--------|
| `app/[locale]/admin/layout.tsx` | New — admin layout with role guard + sidebar |
| `messages/es.json` | Modified — add `admin` keys |
| `messages/en.json` | Modified — add `admin` keys |
