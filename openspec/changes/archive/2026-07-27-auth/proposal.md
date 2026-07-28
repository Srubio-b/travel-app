# Proposal: Auth — Authentication & Authorization

## Intent

El proyecto no tiene registro, login, sesiones ni protección de rutas. Las tablas de auth (`profiles`, `roles`, `user_roles`, `client_trips`, `referral_codes`) existen en Supabase pero sin RLS — datos expuestos. Habilitar autenticación con Supabase Auth + roles admin/cliente para desbloquear el panel admin y el panel de cliente.

## Scope

### In Scope
- Registro de clientes (email + password)
- Login/logout con sesión persistente (@supabase/ssr, cookies httpOnly)
- Roles: `admin` (1) y `cliente` (2) desde tabla existente `roles`
- Protección de rutas: `/admin/*` (solo admin), `/mi-cuenta/*` (solo cliente autenticado), `/login`/`/register` (redirect si hay sesión)
- RLS en `profiles`, `user_roles`, `client_trips`, `referral_codes` + policies admin para catalog tables
- Server Actions para auth (login, register, logout)
- Middleware de auth (composable con next-intl)
- Admin client (`lib/supabase/admin.ts`) con service_role key
- Trigger: crear profile automático al registrarse

### Out of Scope
- OAuth/SSO (Google, GitHub, etc.)
- Magic links, password reset
- WhatsApp auth, referidos automatizados, chatbot
- Pagos en línea

## Capabilities

> No existing specs in `openspec/specs/` — all capabilities are new.

### New Capabilities
- `user-registration`: registro email+password, creación automática de profile, asignación de rol `cliente`
- `user-authentication`: login, logout, session refresh vía @supabase/ssr (cookies httpOnly)
- `route-protection`: middleware que protege rutas por rol y redirige según estado de sesión
- `admin-panel-auth`: verificación de rol admin para CRUD en catalog tables
- `client-profile`: datos básicos del perfil (nombre, teléfono, avatar) desde tabla `profiles`

## Approach

| Capa | Decisión |
|------|----------|
| Auth provider | Supabase Auth + @supabase/ssr (cookies httpOnly, server-side getUser) |
| Auth operations | Server Actions en `app/actions/auth.ts` — login, register, logout |
| Middleware | Composable: chain `next-intl` + `auth-middleware` en un solo `middleware.ts` |
| Role check | Helper `getUserRole()` → lee `user_roles` + `roles`. Cache en request. |
| Admin client | `lib/supabase/admin.ts` — `createServerClient` con `service_role` key |
| RLS | 5 tablas auth: policies para SELECT/INSERT/UPDATE propias + admin bypass |
| Trigger | `handle_new_user()` → insert en `profiles` + `user_roles` (role_id=2) |
| DB types | Regenerar `database.types.ts` vía `supabase gen types typescript` |

## Affected Areas

| Area | Impact |
|------|--------|
| `middleware.ts` | Modified — auth + i18n chain |
| `lib/supabase/admin.ts` | New — service_role client |
| `app/actions/auth.ts` | New — Server Actions |
| `app/auth/login/page.tsx` | New |
| `app/auth/register/page.tsx` | New |
| `app/admin/layout.tsx` | New — role gate |
| `app/mi-cuenta/layout.tsx` | New — auth gate |
| `.env.local` | Modified — add `SUPABASE_SERVICE_ROLE_KEY` |
| `supabase/migrations/` | New migration — RLS + trigger |
| `lib/supabase/database.types.ts` | Regenerated |
| `lib/supabase/server.ts` | Minor — cookie handling tweaks |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Middleware chain rompe i18n | Med | Test todas las rutas con ambos locales |
| RLS mal configurada bloquea acceso | Med | Test policies por rol antes de deploy |
| No hay `SUPABASE_SERVICE_ROLE_KEY` | Low | Obtener del dashboard Supabase |
| Tablas auth sin RLS hoy → datos expuestos | High | RLS es prioridad #1 en implementación |

## Rollback Plan

1. Revert `middleware.ts` a versión original (solo next-intl)
2. Revert migración RLS via `supabase migration repair`
3. Eliminar `SUPABASE_SERVICE_ROLE_KEY` del `.env.local`
4. Eliminar archivos nuevos (`app/actions/auth.ts`, layouts, páginas auth)

## Dependencies

- `SUPABASE_SERVICE_ROLE_KEY` desde dashboard Supabase (agregar a `.env.local`)
- `@supabase/ssr` ya instalado ✅
- `next-intl` middleware debe coexistir con auth middleware

## Success Criteria

- [ ] Registro crea auth.user + profile + user_roles (role=cliente)
- [ ] Login con email+password → sesión persistente
- [ ] Admin accede a `/admin/*`, cliente NO
- [ ] Cliente accede a `/mi-cuenta/*`, no autenticado NO
- [ ] `/login` redirige a home si ya hay sesión
- [ ] RLS activa en todas las tablas auth; usuario ve solo sus datos
- [ ] Admin bypass RLS via service_role
