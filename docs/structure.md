# Estructura del proyecto

Este documento describe la organización de carpetas y las convenciones de naming del proyecto `travel-app`.

## Principios

- **Inglés en código, español en URLs y mensajes**: carpetas, archivos, identificadores, tipos y funciones usan inglés. Las rutas públicas (`/destinos`, `/paquetes`, `/mi-cuenta`) y las claves de i18n usan español.
- **Full-stack Next.js**: toda la lógica de servidor vive dentro de Next.js (Server Components, Server Actions, Route Handlers cuando apliquen).
- **Clean Architecture ligero**: separación conceptual entre `domain/`, `application/` e `infrastructure/`, sin ser rígido con la estructura de carpetas.
- **No barrel files**: solo existe un barrel file en todo el proyecto (`lib/utils/index.ts`). No se agregan nuevos.

## Árbol de carpetas

```
travel-app/
├── app/
│   ├── [locale]/                 # Rutas i18n
│   │   ├── admin/                # Panel admin (layout, destinos/, paquetes/)
│   │   ├── auth/                 # Login, Register
│   │   ├── destinos/             # Catálogo público de destinos
│   │   ├── mi-cuenta/            # Perfil del cliente
│   │   └── paquetes/             # Catálogo público de paquetes
│   ├── actions/                  # Server Actions (admin/, auth.ts)
│   ├── robots.ts                 # robots.txt dinámico
│   └── sitemap.ts                # sitemap.xml dinámico con hreflang
├── components/
│   ├── admin/                    # Componentes del panel admin
│   │   ├── destinos/
│   │   ├── paquetes/
│   │   └── ui/                   # Shared admin UI (AdminTable, ConfirmDialog, etc.)
│   ├── catalog/                  # Componentes públicos del catálogo
│   ├── layout/                   # Header, Footer, AdminSidebar, MobileMenu, etc.
│   └── shared/                   # Logo, ThemeToggle, SchemaScript, WhatsAppButton
├── docs/                         # Documentación del proyecto
├── lib/
│   ├── auth/                     # Utilidades de autenticación y roles
│   ├── config/                   # Configuración de sitio, imágenes, etc.
│   ├── format/                   # Formateadores (moneda, fechas, etc.)
│   ├── i18n/                     # Configuración de next-intl
│   ├── logger.ts                 # Logger estructurado para errores
│   ├── supabase/                 # Clientes SSR, admin, storage, queries, errores
│   └── utils/                    # Helpers puros (slugify, truncateWords, etc.)
├── messages/                     # Traducciones next-intl (es.json, en.json)
├── scripts/                      # Scripts de utilidad (migración de Storage)
├── supabase/migrations/          # Migraciones SQL de Supabase
├── types/                        # Tipos TypeScript globales
└── .env.example                  # Variables de entorno documentadas
```

## Convenciones por capa

### Server Actions (`app/actions/`)

- Las actions del admin deben envolverse con `withAdminAction` importado de `app/actions/admin/_shared.ts`.
- Nunca se expone `error.message` crudo de Supabase al cliente; usar `mapSupabaseError`.
- `redirect()` se llama después de la mutación exitosa y antes de retornar `{ success: true }`.
- Las mutaciones revalidan rutas públicas afectadas y `/sitemap.xml`.

### Autenticación (`lib/auth/`)

- `lib/auth/utils.ts` contiene `getUserRole`, `requireAuth` y `requireAdmin`.
- `lib/auth/errors.ts` contiene `AuthResult` y `mapAuthError`.
- El middleware (`middleware.ts`) verifica el rol admin para rutas `/{locale}/admin/*` como primera línea de defensa.

### Supabase (`lib/supabase/`)

- `client.ts` / `server.ts` / `admin.ts`: clientes SSR y service_role.
- `public.ts`: cliente anónimo para Server Components públicos.
- `storage.ts`: uploads, URLs públicas y movimiento de objetos.
- `queries.ts`: queries públicas envueltas en `React.cache()`.
- `errors.ts`: `SupabaseQueryError`, `classifySupabaseError`, `mapSupabaseError`.

### i18n

- Server Components usan `getTranslations()` de `next-intl/server`.
- Client Components reciben labels como props; no llaman `getTranslations` directamente.
- Claves de mensajes en español: `messages/es.json` y `messages/en.json`.

## Decisiones de estructura

### Route groups `(public)`, `(admin)`, `(auth)`

**Evaluados y no aplicados.**

Introducir route groups bajo `app/[locale]/` movería todos los archivos públicos/admin/auth a subcarpetas sin cambiar las URLs, pero:

- Aumentaría el riesgo de que layouts anidados o imports relativos se rompan.
- El middleware y los paths de revalidación dependerían de una estructura de carpetas más profunda.
- El beneficio estético no justifica el riesgo en un proyecto donde ya hay 6+ PRs en progreso.

Se mantiene la estructura actual plana bajo `app/[locale]/`.

## Referencias

- `README.md` — setup, variables de entorno y deploy.
- `AGENTS.md` — propósito de la aplicación, stack y buenas prácticas.
