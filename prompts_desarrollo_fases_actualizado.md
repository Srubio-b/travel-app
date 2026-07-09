# Prompts Secuenciales para Agentes de IA — L&A Viajes y Aventuras

Instrucciones de uso: ejecutar en orden. Cada prompt asume que el agente ya leyó AGENTS.md
en la raíz del proyecto. El proyecto YA existe en Next.js, y OpenCode YA está conectado a Supabase.
No crear un proyecto nuevo ni levantar un backend separado con NestJS. Toda la lógica backend debe
resolverse dentro de Next.js usando App Router, Route Handlers, Server Actions y utilidades server-only.

---

## FASE 0 — Auditoría y Organización del Proyecto Existente

**Prompt 1**
"Lee el archivo AGENTS.md en la raíz del proyecto y audita la estructura actual del proyecto Next.js ya existente.
No crees un proyecto nuevo. Analiza las carpetas actuales, dependencias instaladas, configuración de Tailwind,
integración con Supabase y convenciones del repositorio. Luego propone y aplica una reorganización mínima
siguiendo Clean Architecture sin romper lo existente. Usa una estructura como:
- /app para rutas
- /components para UI reutilizable
- /lib para utilidades compartidas
- /lib/supabase para clientes y helpers de Supabase
- /domain para entidades y reglas de negocio
- /application para casos de uso
- /infrastructure para acceso a datos y adaptadores
- /types para tipos globales
No implementes funcionalidades todavía; solo ordena y documenta la base del proyecto actual."

**Prompt 2**
"Audita la integración actual entre Next.js y Supabase. Verifica que existan clientes separados para browser y server,
manejo correcto de variables de entorno, middleware para refresco de sesión si aplica, y utilidades compatibles con
App Router. Corrige o estandariza la integración sin cambiar el objetivo funcional de la app."

**Prompt 3**
"Revisa el sistema de estilos actual del proyecto ya creado. Si Tailwind CSS ya está configurado, valida que esté bien
estructurado para escalabilidad: tokens de color, espaciado, tipografía, responsive y componentes reutilizables.
No diseñes todavía la UI completa, pero deja lista una base sólida para una web turística visualmente atractiva."

---

## FASE 1 — Arquitectura Full-Stack en Next.js

**Prompt 4**
"Convierte la arquitectura del proyecto a un enfoque full-stack con Next.js. No uses NestJS ni ningún backend externo.
Define claramente qué lógica irá en Server Components, qué flujos usarán Server Actions y qué endpoints deben existir
como Route Handlers (`route.ts`) dentro de `/app/api`. Documenta esta decisión dentro del proyecto."

**Prompt 5**
"Implementa una capa de acceso a datos sobre Supabase para que la aplicación no consulte Supabase directamente desde
cualquier componente. Crea servicios/repositorios reutilizables para destinos, paquetes, perfiles de cliente y viajes.
La meta es mantener separación entre UI, lógica de negocio y acceso a datos dentro del mismo proyecto Next.js."

---

## FASE 2 — Modelo de Datos en Supabase

**Prompt 6**
"A partir del archivo historias_de_usuario.md y del propósito descrito en AGENTS.md, diseña o ajusta el esquema de base
de datos en Supabase para soportar el MVP. Incluye al menos estas entidades:
- profiles (extensión del usuario autenticado)
- roles o mecanismo equivalente para distinguir admin/cliente
- destinations
- travel_packages
- package_images
- client_trips
- referral_codes (o campo equivalente preparado para fase futura)
Genera SQL/migrations idempotentes si es posible y documenta relaciones, índices, soft delete y timestamps."

**Prompt 7**
"Implementa y documenta las políticas de Row Level Security (RLS) en Supabase para que:
- el admin tenga control completo de gestión,
- el cliente solo vea y edite su propio perfil,
- el cliente solo vea sus propios viajes,
- el catálogo público pueda leerse sin autenticación donde corresponda.
Incluye ejemplos de prueba para validar estas políticas."

---

## FASE 3 — Autenticación y Autorización

**Prompt 8**
"Implementa autenticación con Supabase Auth dentro de Next.js App Router, sin backend externo. Crea flujo de login,
registro de clientes, cierre de sesión y recuperación de sesión server-side. Usa middleware y utilidades server-only
según las mejores prácticas actuales de Next.js + Supabase."

**Prompt 9**
"Implementa control de acceso por rol dentro de Next.js para proteger rutas como `/admin/*` y `/mi-cuenta/*`.
El acceso admin debe estar restringido solo a usuarios con rol administrador; el panel de cliente solo a usuarios
autenticados con rol cliente o equivalente."

---

## FASE 4 — Catálogo Público y SEO

**Prompt 10**
"Construye el módulo público del catálogo de paquetes turísticos usando Next.js App Router. Implementa el listado
público de paquetes (HU-01) como una página optimizada para SEO con Server Components y fetching server-side.
Debe mostrar imagen principal, nombre, destino, tipo (nacional/internacional) y CTA de WhatsApp."

**Prompt 11**
"Implementa filtros por tipo y destino (HU-02) en el catálogo, priorizando una UX fluida. Decide si conviene usar
search params, Server Components y/o client components aislados para la interacción, manteniendo SEO y rendimiento."

**Prompt 12**
"Implementa la página de detalle de cada paquete (HU-03) con slug amigable, galería de imágenes, incluye/no incluye,
itinerario, contenido enriquecido y metadatos dinámicos. Agrega datos estructurados schema.org relevantes para turismo."

**Prompt 13**
"Implementa las páginas por destino (HU-05), por ejemplo `/destinos/cartagena`, reutilizando el modelo de datos y
priorizando indexación SEO. Cada página debe listar los paquetes del destino y tener metadata específica."

**Prompt 14**
"Implementa el CTA de WhatsApp (HU-04) en listado y detalle de paquete, generando mensajes predefinidos consistentes.
No desarrollar todavía automatización ni chatbot; solo el enlace limpio y reutilizable."

---

## FASE 5 — Panel de Administración Dentro de Next.js

**Prompt 15**
"Construye el panel de administración dentro del mismo proyecto Next.js, en rutas bajo `/admin`. Implementa vistas
para listar, crear, editar y desactivar paquetes turísticos (HU-07, HU-08, HU-09). Usa Server Actions o Route Handlers
según convenga, con validación robusta de inputs."

**Prompt 16**
"Implementa la gestión de destinos en el panel admin (HU-10): listado, creación, edición y desactivación/eliminación
controlada. Evita acciones destructivas que rompan relaciones con paquetes existentes."

**Prompt 17**
"Implementa carga y gestión de imágenes de paquetes usando Supabase Storage o la estrategia de almacenamiento ya conectada
en el proyecto. Asegura nombres consistentes, metadatos útiles y render eficiente en frontend."

---

## FASE 6 — Panel de Cliente

**Prompt 18**
"Construye el panel de cliente en `/mi-cuenta`, dentro del mismo proyecto Next.js. Implementa la vista de perfil editable
(HU-13) y la vista de recap/historial de viajes (HU-12), con una presentación clara y visualmente atractiva."

**Prompt 19**
"Dentro del panel admin, agrega la funcionalidad para asociar manualmente viajes realizados a un cliente específico,
alimentando la tabla `client_trips`. Este flujo debe servir como base del recap del cliente en el MVP."

---

## FASE 7 — Preparación para Referidos (Sin Automatización Aún)

**Prompt 20**
"Prepara el modelo de datos y la lógica mínima para que cada cliente tenga un código único de referido almacenado,
sin activar todavía automatización por WhatsApp. Si conviene, genera el código al crear el perfil del cliente y
muéstralo solo en admin o déjalo interno según lo más seguro para esta fase."

---

## FASE 8 — Calidad, Testing y Endurecimiento Técnico

**Prompt 21**
"Implementa validación consistente de formularios y entradas del sistema. Usa un enfoque unificado entre cliente y servidor
(zod o equivalente si ya existe en el proyecto) para evitar duplicación y mejorar seguridad."

**Prompt 22**
"Crea pruebas para los flujos críticos del proyecto actual con foco en Next.js full-stack: catálogo público, login,
protección de rutas, CRUD admin y recap del cliente. Si el proyecto aún no tiene framework de testing, propón el stack
mínimo razonable y configúralo."

**Prompt 23**
"Realiza una auditoría de rendimiento y SEO técnico sobre la implementación actual: imágenes, metadata, sitemap,
robots.txt, caching, revalidación y Core Web Vitals. Propón y aplica mejoras concretas."

**Prompt 24**
"Realiza una auditoría de seguridad sobre la app actual: variables de entorno, exposición de claves, validación server-side,
RLS, autorización por rol y rutas sensibles del panel administrativo. Corrige hallazgos importantes."

---

## FASE 9 — Producción y Despliegue

**Prompt 25**
"Prepara el proyecto Next.js full-stack para producción en Vercel. Configura variables de entorno, dominios,
revalidación/caché, protección básica de rutas y cualquier ajuste necesario para operar correctamente con Supabase."

**Prompt 26**
"Configura sitemap.xml, robots.txt, metadata base y Open Graph para mejorar indexación en buscadores y presencia
social de L&A Viajes y Aventuras."

**Prompt 27**
"Ejecuta una revisión final de checklist de producción del proyecto existente: autenticación, roles, SEO, rendimiento,
accesibilidad, estabilidad del panel admin y experiencia móvil. Documenta pendientes reales antes de lanzamiento."

---

## FASE 10 — Futuro (No ejecutar aún)

**Prompt 28**
"Diseña la siguiente fase de automatización de referidos y contacto por WhatsApp, sin implementarla todavía. Limítate a
proponer arquitectura futura compatible con la app actual en Next.js + Supabase."

**Prompt 29**
"Diseña la fase futura de chatbot con IA para WhatsApp y/o atención web, sin implementarla todavía. Propón una arquitectura
que no rompa la estructura actual del proyecto."
