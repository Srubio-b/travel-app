# L&A Viajes y Aventuras

Plataforma web para la agencia de turismo **L&A Viajes y Aventuras**. Catálogo digital de planes turísticos nacionales e internacionales con contacto directo vía WhatsApp.

## Stack

| Capa          | Tecnología                          |
| ------------- | ----------------------------------- |
| Frontend      | Next.js 16 (App Router, TypeScript) |
| Backend       | Next.js API Routes (full-stack)     |
| Base de datos | Supabase (PostgreSQL)               |
| Autenticación | Supabase Auth                       |
| Estilos       | Tailwind CSS v4                     |

## Estructura del Proyecto

```
travel-app/
├── app/                 # Next.js App Router (páginas y API Routes)
│   ├── [locale]/        # Rutas internacionalizadas
│   │   ├── admin/       # Panel de administración (CRUD)
│   │   ├── auth/        # Login / Register
│   │   ├── destinos/    # Catálogo público de destinos
│   │   ├── mi-cuenta/   # Perfil del cliente
│   │   └── paquetes/    # Catálogo público de paquetes
│   └── actions/         # Server Actions
├── components/          # Componentes de UI reutilizables
│   ├── admin/           # Componentes del panel admin
│   ├── catalog/         # Componentes del catálogo público
│   └── layout/          # Layout, header, sidebar, footer
├── domain/              # Entidades y reglas de negocio
├── application/         # Casos de uso / servicios de aplicación
├── infrastructure/      # Adaptadores de infraestructura
├── lib/
│   ├── auth/            # Utilidades de autenticación
│   ├── supabase/        # Clientes Supabase (browser y server)
│   └── utils/           # Utilidades generales
├── messages/            # Traducciones i18n (es/en)
├── supabase/
│   └── migrations/      # Migraciones de base de datos
└── types/               # Definiciones de tipos globales
```

## Requisitos

- Node.js 20+
- pnpm 9+
- Cuenta en Supabase (proyecto: `yqrqebfflyhqmonjaiwg`)

## Configuración Inicial

```bash
# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env.local  # o crear .env.local manualmente

# Iniciar servidor de desarrollo
pnpm dev
```

## Environment Variables

Crea un archivo `.env.local` con las siguientes variables:

| Variable                        | Origen / Valor esperado                               | Ámbito   |
| ------------------------------- | ----------------------------------------------------- | -------- |
| `NEXT_PUBLIC_SITE_URL`          | URL pública del sitio, p. ej. `http://localhost:3000` | Público  |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL del proyecto Supabase                             | Público  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key del proyecto Supabase                        | Público  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service role key (secreto, solo servidor)             | Servidor |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`   | Número de WhatsApp en formato internacional sin `+`   | Público  |

> `.env.local` está en `.gitignore` y nunca debe commitearse.

## Scripts Disponibles

```bash
pnpm dev            # Servidor de desarrollo (http://localhost:3000)
pnpm build          # Build de producción
pnpm start          # Iniciar servidor de producción
pnpm lint           # Linter ESLint
pnpm typecheck      # Verificación de tipos TypeScript
pnpm format         # Formatear con Prettier
pnpm format:check   # Validar formato con Prettier
pnpm verify         # typecheck + lint + format:check
```

## Deploy

El proyecto está pensado para desplegarse en **Vercel**:

```bash
# 1. Verificar variables de entorno
# 2. Aplicar migraciones de Supabase
# 3. Build de producción
pnpm verify
pnpm build
```

Pasos sugeridos en Vercel:

1. Conectar el repositorio de GitHub.
2. Agregar las variables de entorno listadas arriba en Project Settings.
3. Establecer el framework preset como **Next.js**.
4. Desplegar. El comando de build por defecto es `pnpm build`.

## Desarrollo

Este proyecto sigue principios de **Clean Architecture**:

- **`domain/`** — Entidades de negocio puras, sin dependencias externas.
- **`application/`** — Casos de uso que orquestan el dominio.
- **`infrastructure/`** — Implementaciones concretas (bases de datos, APIs externas).
- **`components/`** — Componentes de presentación reutilizables.

## Licencia

Privado — L&A Viajes y Aventuras.
