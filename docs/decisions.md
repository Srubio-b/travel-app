# Decisiones de Arquitectura (ADRs)

## ADR-001: Full-Stack Next.js en lugar de NestJS separado

**Estado:** Aceptado

**Contexto:**
El AGENTS.md original especificaba NestJS como backend separado (hosteado en Railway/Render)
y Next.js como frontend (hosteado en Vercel). Esto añadía complejidad operativa (dos deploys,
coordinación CORS, mantenimiento de dos repositorios) sin un beneficio claro para el MVP.

**Decisión:**
Eliminar NestJS del stack. Usar Next.js como full-stack: las API Routes de Next.js cumplen
el rol del backend, compartiendo tipos y utilidades con el frontend.

**Consecuencias:**
- Positivas: TypeScript de punta a punta, un solo deploy, sin CORS, desarrollo más rápido.
- Negativas: Si la aplicación escala más allá de lo que Next.js API Routes puede manejar,
  será necesario extraer un backend dedicado. La separación en `domain/`, `application/` e
  `infrastructure/` facilita esta extracción futura.

## ADR-002: Clean Architecture con carpetas en la raíz

**Estado:** Aceptado

**Contexto:**
Se necesita una estructura que separe claramente las capas de dominio, aplicación e
infraestructura, pero que mantenga imports limpios con el alias `@/*`.

**Decisión:**
Ubicar las capas en carpetas raíz (`domain/`, `application/`, `infrastructure/`) en lugar
de dentro de `src/` o `lib/`. El alias `@/*` en tsconfig.json resuelve a `./*`, por lo que
las rutas de importación quedan limpias: `@/domain/user` vs `@/src/domain/user`.

**Consecuencias:**
- Positivas: imports cortos y semánticos, separación explícita entre rutas (`app/`) y lógica de negocio.
- Negativas: La raíz del proyecto tiene más carpetas, pero es un costo aceptable.

## ADR-003: `@supabase/ssr` sobre `@supabase/supabase-js` directo

**Estado:** Aceptado

**Contexto:**
Next.js App Router requiere manejo de sesiones via cookies en Server Components, Route
Handlers y Server Actions. La integración directa de `@supabase/supabase-js` no proporciona
helpers para el manejo de cookies en el entorno de App Router.

**Decisión:**
Usar `@supabase/ssr` como SDK principal. Este paquete ofrece:
- `createServerClient()` — para Server Components, Route Handlers y Server Actions,
  con manejo automático de cookies via `next/headers`.
- `createBrowserClient()` — para componentes cliente, leyendo `NEXT_PUBLIC_*` env vars.

**Consecuencias:**
- `@supabase/supabase-js` se instala como dependencia transitiva de `@supabase/ssr`.
- Las cookies de sesión se manejan de forma segura y consistente.

## ADR-004: Un solo archivo de decisiones (docs/decisions.md)

**Estado:** Aceptado

**Contexto:**
El proyecto inicia con cero código personalizado. Crear un directorio completo de ADRs
(`docs/adr/`) añade fricción innecesaria.

**Decisión:**
Mantener las decisiones en un solo archivo `docs/decisions.md`. Cuando el proyecto madure
y acumule más decisiones, se puede migrar a ADRs individuales.

**Consecuencias:**
- Fácil de mantener al inicio.
- Se refactorizará a ADRs individuales cuando haya más de 10 decisiones documentadas.

## ADR-005: Tokens de diseño en `globals.css` con `@theme inline`

**Estado:** Aceptado

**Contexto:**
Tailwind CSS v4 requiere que los tokens de tema (`@theme`) se definan dentro de un archivo
CSS procesado por `@tailwindcss/postcss`.

**Decisión:**
Mantener los tokens de marca dentro de `app/globals.css` bajo `@theme inline`, junto con
las variables CSS existentes. No se extrae a un archivo separado porque el bloque es pequeño
(~10 líneas).

**Consecuencias:**
- Todos los tokens de diseño están en un solo lugar.
- Se puede extraer a un archivo `tokens.css` separado cuando crezca.
