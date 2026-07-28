# Route Protection Specification

## Purpose

Protect routes by auth status and role. Compose with next-intl middleware.

## Requirements

### Requirement: Unauthenticated guard

Visitors without a session MUST redirect to /login for /mi-cuenta/* and /admin/*.

#### Scenario: Blocked visitor
- GIVEN no session
- WHEN requesting a protected route
- THEN redirect to /login preserving URL

### Requirement: Role-based guard

`cliente` SHALL access /mi-cuenta/*. `admin` SHALL access /admin/*. Others blocked.

#### Scenario: Admin access
- GIVEN role `admin`
- WHEN requesting /admin/*
- THEN serve the page

#### Scenario: Client blocked from admin
- GIVEN role `cliente`
- WHEN requesting /admin/*
- THEN redirect home or 403

### Requirement: Auth page redirect

Users with a session on /login or /register SHALL redirect home.

#### Scenario: Logged-in user on login
- GIVEN an authenticated user
- WHEN visiting /login
- THEN redirect home

### Requirement: i18n

Auth middleware SHALL compose with next-intl in one chain.

#### Scenario: i18n route
- GIVEN a request to /es/admin
- WHEN middleware runs
- THEN locale and auth/role resolve
