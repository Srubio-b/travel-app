# Product

## Register

brand

## Platform

web

## Users

- **Visitante público** (superficie primaria): explora el catálogo de destinos y paquetes turísticos, mayoría móvil (>30% del tráfico), decide en segundos si el viaje le interesa. El objetivo de negocio es que contacte a la agencia por WhatsApp — la conversión NO ocurre online.
- **Cliente registrado**: inicia sesión y consulta su perfil e historial de viajes.
- **Administrador**: gestiona el catálogo (CRUD de destinos y paquetes). Superficie de registro `product`, fuera del scope del rediseño editorial; se mantiene funcional sin redesign visual.

## Product Purpose

Plataforma web de la agencia de turismo **L&A Viajes y Aventuras**. Resuelve dos problemas de negocio: (1) baja presencia digital y en buscadores — el SEO técnico es requisito de primer nivel; (2) falta de un catálogo digital claro y atractivo de planes turísticos nacionales e internacionales.

El éxito se mide en un visitante que recorre el catálogo con placer visual y termina escribiendo al WhatsApp de la agencia.

## Brand Personality

Cálida, experta, auténtica. Dirección confirmada por el dueño: **"editorial claro estilo Apple"** — la disciplina y el aire de una revista premium, con el calor de la aventura llevado por la terracota y la fotografía real de destinos. Emociones objetivo: confianza ("esta agencia sabe lo que hace"), deseo de viaje ("quiero estar ahí"), claridad ("entiendo todo sin esfuerzo").

## Anti-references

- Plantilla genérica de agencia de viajes: grillas de cards idénticas, stock fotográfico genérico, azul corporativo.
- "AI slop" 2026: glassmorphism decorativo, gradient text, eyebrows en mayúsculas sobre cada sección, bordes laterales de acento, sombras fantasma (borde 1px + sombra ≥16px).
- Espectáculo por el espectáculo: WebGL que retrasa el contenido. La emoción de la portada vive en la fotografía real, no en humo técnico.

## Design Principles

1. **La fotografía es el producto**: el diseño le construye marco, nunca la compite. Todo lo demás es tipografía y aire.
2. **Un solo CTA por vista**: el camino (al catálogo o al WhatsApp) siempre es único y evidente.
3. **Motion con propósito**: cada animación explica una relación — entrar, sumergirse, volver. Nada se mueve por reflejo.
4. **Rápido es una feature**: SEO y Core Web Vitals son requisitos no funcionales de primer nivel; la emoción nunca justifica un LCP pobre.
5. **La inmersión es técnica de capas, no de peso**: el efecto 3D de destino se logra con fotografía + parallax por capas (diorama 2.5D), no con WebGL pesado.

## Accessibility & Inclusion

- Contraste WCAG AA (4.5:1 texto normal, 3:1 texto grande) en ambos temas.
- `prefers-reduced-motion`: TODA animación tiene fallback estático o crossfade. No negociable.
- Mobile-first real: touch targets ≥44px, sin scroll horizontal, `min-h-dvh` en vistas inmersivas.
- Navegación por teclado con focus rings visibles; el SkipLink existente se conserva.
