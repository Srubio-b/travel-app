# Admin Panel Auth Specification

## Purpose

Verify role `admin` for catalog CRUD. Bypass RLS via service_role client. Protect auth tables with RLS.

## Requirements

### Requirement: Admin verification

Catalog writes MUST verify role `admin` via `user_roles` + `roles`.

#### Scenario: Admin CRUD
- GIVEN role `admin`
- WHEN performing catalog write
- THEN execute via service_role client (RLS bypass)

#### Scenario: Non-admin blocked
- GIVEN role `cliente`
- WHEN attempting catalog write
- THEN reject with 403

### Requirement: Service role client

`lib/supabase/admin.ts` SHALL use `createServerClient` with `SUPABASE_SERVICE_ROLE_KEY`. Missing key MUST fail.

#### Scenario: Missing key
- GIVEN no key in env
- WHEN initializing
- THEN fail with config error

### Requirement: RLS on auth tables

`profiles`, `user_roles`, `client_trips`, `referral_codes` MUST have RLS. Users see own rows; admin bypasses via service_role.

#### Scenario: User sees own data
- GIVEN non-admin user
- WHEN querying profiles
- THEN RLS returns only their row

#### Scenario: Admin sees all
- GIVEN service_role client
- WHEN querying auth tables
- THEN all rows returned
