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
| Frontend | Next.js (App Router, TypeScript) | Vercel |
| Backend | Next.js API Routes (full-stack) | Vercel |
| Base de datos | Supabase (PostgreSQL) | Supabase Cloud |
| Autenticación | Supabase Auth (roles: admin, cliente) | Supabase Cloud |
| Estilos | Tailwind CSS v4 | — |

### Justificación de decisiones clave
- Se eligió **full-stack Next.js** para mantener TypeScript de punta a punta en toda la aplicación,
  eliminando la complejidad operativa de un backend separado. Las API Routes de Next.js reemplazan
  a un servidor NestJS dedicado.
- La arquitectura sigue principios de **Clean Architecture**: dominio, aplicación e infraestructura
  separados en `domain/`, `application/` e `infrastructure/`, facilitando una futura extracción a
  un backend independiente si el proyecto lo requiere.
- **Supabase** se integra vía `@supabase/ssr` con `createServerClient` para Server Components y
  `createBrowserClient` para componentes cliente, maximizando la seguridad de sesión.
- **Proyecto Supabase**: `yqrqebfflyhqmonjaiwg`

## Alcance del MVP (fase actual)
- Catálogo público de paquetes (nacional/internacional) con landing pages optimizadas por destino (SEO).
- Botón de contacto directo a WhatsApp por paquete (sin pagos en línea).
- Panel de administrador con CRUD de destinos/paquetes/planes.
- Panel de cliente con historial personal de viajes.
- Base de datos preparada (aunque no activada aún) para soportar códigos de referido únicos por cliente.

## Fuera de alcance del MVP (fases futuras)
- Automatización de referidos vía WhatsApp Business Cloud API + n8n.
- Chatbot con IA para atención automatizada en WhatsApp.
- Pagos en línea.

## Buenas Prácticas de Desarrollo Requeridas
- TypeScript estricto en todo el proyecto.
- Aplicar Clean Architecture y principios SOLID con módulos bien separados.
- Diseño responsive mobile-first (más del 30% del tráfico esperado es móvil).
- SEO técnico: metadatos dinámicos, schema.org (TravelAgency/LocalBusiness), sitemap.xml, Core Web Vitals.
- Row Level Security (RLS) en Supabase para separar datos de admin y cliente.
- Convenciones de commits claras.
- Componentes de UI reutilizables y accesibles (a11y) en Next.js + Tailwind.

## Recomendación de Skills (skills.sh) para los Agentes de IA
Instalar estas skills antes de comenzar el desarrollo, para que los agentes de IA generen
código alineado con el stack y las buenas prácticas definidas:

| Skill | Propósito | Categoría |
|---|---|---|
| vercel-labs/skills (find-skills) | Permite al agente descubrir e instalar otras skills automáticamente | Meta/Descubrimiento |
| vercel-labs/agent-skills (vercel-react-best-practices) | Buenas prácticas oficiales de React/Next.js y guías de diseño web | Frontend |
| anthropics/skills (frontend-design) | Principios de diseño visual e interfaz coherente | Diseño web |
| anthropics/skills (skill-creator) | Permite crear skills personalizadas propias del proyecto | Meta |
| Skill de arquitectura de software (Clean Architecture / DDD) | Revisión de arquitectura, bounded contexts, ADRs | Arquitectura |
| playwright-testing | Buenas prácticas de testing end-to-end (TDD) | Testing/QA |
| cloudflare/skills (opcional) | Buenas prácticas si se evalúa CDN/edge en el futuro | Infraestructura |

Instalación típica (Claude Code / Cursor / Codex):
```
npx skills add vercel-labs/skills
npx skills add vercel-labs/agent-skills
npx skills add anthropics/skills
npx skills add playwright-community/skills
```

## Notas para los Agentes de IA
- Este documento (AGENTS.md) debe leerse al inicio de cada sesión de desarrollo.
- No implementar pagos en línea, autenticación social, ni el chatbot de WhatsApp en esta fase.
- Toda funcionalidad de referidos debe diseñarse en base de datos pero sin activar su lógica de
  automatización todavía.
- Priorizar SEO y velocidad de carga como requisitos no funcionales de primer nivel.
