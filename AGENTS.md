# AGENTS.md — L&A Viajes y Aventuras

## Propósito de la Aplicación
Plataforma web para la agencia de turismo "L&A Viajes y Aventuras" que resuelve dos problemas de negocio:
1. Baja presencia en redes sociales y motores de búsqueda (se requiere fuerte SEO).
2. Falta de un catálogo digital claro y atractivo de planes turísticos (nacionales e internacionales).

La conversión NO se realiza en línea (no hay pagos ni checkout). El objetivo es que el visitante contacte
al negocio vía WhatsApp. La plataforma debe soportar además:
- Panel de administrador con autenticación para gestionar (crear, editar, eliminar) destinos, paquetes y planes.
- Panel de cliente autenticado con un "recap" histórico de viajes realizados.
- Sistema de referidos automatizado vía WhatsApp mediante links únicos por cliente (fase próxima).
- Chatbot con IA para automatizar la atención por WhatsApp (fase futura, no en el MVP).

## Roles del Sistema
- **Visitante público**: explora catálogo, filtra por nacional/internacional, contacta vía WhatsApp.
- **Cliente registrado**: inicia sesión y ve su panel personal con historial de viajes.
- **Administrador**: inicia sesión y gestiona todo el contenido del sitio (CRUD completo).

## Stack Tecnológico Oficial

| Capa | Tecnología | Hosting |
|---|---|---|
| Frontend | Next.js 16.2.10 (App Router, TypeScript strict) | Vercel |
| Backend | Next.js API Routes + Server Actions (full-stack) | Vercel |
| Base de datos | Supabase PostgreSQL | Supabase Cloud |
| Autenticación | Supabase Auth (roles: admin, cliente) | Supabase Cloud |
| Estilos | Tailwind CSS v4 | — |
| i18n | next-intl (es/en) | — |
| Paquetería | pnpm | — |

### Decisiones clave

- **Full-stack Next.js**: TypeScript de punta a punta, sin backend separado. Server Actions reemplazan API Routes para mutaciones.
- **Clean Architecture**: `domain/`, `application/`, `infrastructure/` separados para facilitar futura extracción.
- **Supabase SSR**: `@supabase/ssr` con `createServerClient` para Server Components y `createBrowserClient` para clientes.
- **Proyecto Supabase**: `yqrqebfflyhqmonjaiwg`

## Funcionalidad Implementada ✅

### Catálogo Público
- Landing pages de paquetes con SEO dinámico, JSON-LD (Product, TravelAgency, LocalBusiness)
- Páginas de destino con paquetes relacionados
- Filtro por nacional/internacional
- Sitemap dinámico con hreflang
- Botón de contacto WhatsApp por paquete
- 404 personalizada + SkipLink de accesibilidad

### Autenticación y Roles
- Registro y login con Supabase Auth
- Middleware de protección de rutas (admin, cliente, público)
- Row Level Security (RLS) en Supabase
- Server Actions con `requireAdmin()` + `createAdminClient()` para operaciones seguras

### Panel de Administración
- Sidebar con navegación y resaltado de ruta activa
- CRUD completo de **Destinos** (crear, listar con búsqueda ILIKE, editar, soft-delete)
- CRUD completo de **Paquetes** (crear con galería de imágenes + multi-destino, listar con badges, editar, soft-delete, publish/draft toggle)
- Componentes compartidos: AdminTable, AdminFormLayout, ImageUploader, ConfirmDialog

### Panel de Cliente
- Página de perfil con formulario y avatar

### i18n
- Traducciones completas es/en para todo el admin, auth y catálogo

## Fuera de alcance del MVP
- Automatización de referidos vía WhatsApp Business Cloud API + n8n
- Chatbot con IA para atención en WhatsApp
- Pagos en línea
- Autenticación social (Google, GitHub)

## Buenas Prácticas

1. **TypeScript strict** en todo el proyecto
2. **Clean Architecture + SOLID**: dominio puro, casos de uso, infraestructura
3. **Mobile-first responsive** (>30% tráfico móvil esperado)
4. **SEO técnico**: metadatos dinámicos, schema.org, sitemap.xml, Core Web Vitals
5. **RLS en Supabase**: separar datos admin/cliente por políticas de seguridad
6. **Soft-delete** con `deleted_at` para entidades del admin
7. **Server Actions seguras**: siempre `requireAdmin()` antes de cualquier operación
8. **CSS Tokens**: usar `--color-*` variables, no colores hardcodeados de Tailwind
9. **i18n**: `getTranslations()` en Server Components, labels props en Client Components
10. **Conventional commits**: `feat(scope): descripción`

## Estructura del Repositorio

```
travel-app/
├── app/
│   ├── [locale]/           # Rutas i18n
│   │   ├── admin/          # Panel admin (layout, destinos/, paquetes/)
│   │   ├── auth/           # Login, Register
│   │   ├── destinos/       # Catálogo público de destinos
│   │   ├── mi-cuenta/      # Perfil del cliente
│   │   └── paquetes/       # Catálogo público de paquetes
│   └── actions/            # Server Actions (admin/, auth.ts)
├── components/
│   ├── admin/              # Admin CRUD components
│   │   ├── destinos/
│   │   ├── paquetes/
│   │   └── ui/             # Shared: AdminTable, AdminFormLayout, etc.
│   ├── catalog/            # Público: PackageCard, PackageFilter, etc.
│   └── layout/             # Header, Footer, AdminSidebar, UserMenu
├── lib/
│   ├── auth/               # Auth utilities
│   ├── supabase/           # Clientes SSR, admin, storage, queries
│   └── utils/              # Slugify, formatters
├── messages/               # next-intl translations (es.json, en.json)
├── supabase/migrations/    # Migraciones SQL
└── types/                  # TypeScript types globales
```

## Convenciones de Código

### Server Actions (admin)
```typescript
export async function createAlgo(formData: FormData) {
  const { user } = await requireAdmin()   // 1. Verificar rol admin
  const adminDb = createAdminClient()      // 2. Cliente con service_role
  // ... validar, insertar, revalidar
  revalidatePath('/admin/algo')
  return { success: true }
}
```

### Componentes Client con i18n
```typescript
// Server Component pasa labels como props
<DestinoMultiSelect
  placeholder={t('admin.paquetes.destinos.placeholder')}
  selectedLabel={t('admin.paquetes.destinos.selected', { count: selected.length })}
/>

// Client Component recibe labels como props (NO usa getTranslations directo)
```

## PRs Existentes (GitHub)

| PR | Branch | Estado |
|---|---|---|
| [#1](https://github.com/Srubio-b/travel-app/pull/1) feat/admin-infra | `feat/admin-infra` → `master` | Abierto |
| [#2](https://github.com/Srubio-b/travel-app/pull/2) feat/admin-destinos | `feat/admin-destinos` → `feat/admin-infra` | Abierto |
| [#3](https://github.com/Srubio-b/travel-app/pull/3) feat/admin-paquetes | `feat/admin-paquetes` → `feat/admin-destinos` | Abierto |

## Notas para Agentes de IA

- Leer este archivo al inicio de cada sesión de desarrollo.
- Las skills de IA están en `.agents/skills/` (local, no en el repo). Instalar con `npx skills add <skill>`.
- No implementar pagos, auth social ni chatbot WhatsApp en esta fase MVP.
- Antes de modificar Server Actions del admin, verificar que llamen a `requireAdmin()`.
- Los componentes Client que muestran texto i18n deben recibir labels como props desde el Server Component padre.
- Priorizar SEO y velocidad de carga como requisitos no funcionales de primer nivel.

## Enlaces Útiles

- **GitHub**: https://github.com/Srubio-b/travel-app
- **Supabase**: https://supabase.com/dashboard/project/yqrqebfflyhqmonjaiwg
- **Vercel**: Pendiente de deploy
