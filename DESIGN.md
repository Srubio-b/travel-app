---
name: L&A Viajes y Aventuras
description: Catálogo editorial de viajes — portadas full-bleed, Playfair a escala y terracota precisa sobre papel real.
colors:
  terracotta: "#b84a3a"
  terracotta-deep: "oklch(0.42 0.12 28)"
  terracotta-subtle: "oklch(0.93 0.025 30)"
  on-primary: "oklch(0.99 0.005 60)"
  paper: "oklch(0.985 0.002 60)"
  ink: "oklch(0.15 0.005 60)"
  surface: "oklch(0.99 0.002 60)"
  border: "oklch(0.9 0.005 60)"
  muted-foreground: "oklch(0.55 0.01 60 / 0.7)"
  destructive: "oklch(0.58 0.18 25)"
  success: "oklch(0.45 0.15 145)"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2.75rem, 6vw, 6rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "8px"
spacing:
  section: "96px"
  card-gap: "32px"
  rhythm: "8px"
components:
  button-primary:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: "12px 32px"
  button-primary-hover:
    backgroundColor: "{colors.terracotta-deep}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: "12px 32px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.terracotta}"
    rounded: "{rounded.sm}"
    padding: "12px 32px"
---

# Design System: L&A Viajes y Aventuras

## Overview

**Creative North Star: "La Revista del Viajero"**

El sitio se lee como una revista de viajes premium: cada destino es una portada, cada sección una página editorial. La disciplina es Apple — aire, grilla, un solo CTA — y el calor es L&A — terracota y fotografía real de lugares que existen. Playfair Display da voz de magazine; Inter da voz de herramienta.

El diseño jamás compite con la fotografía: le construye marco. Papel real de fondo, tipografía a escala, y la terracota usada con la escasez de una firma. El motion es preciso y explicativo: cada animación cuenta una relación (entrar, sumergirse, volver), nunca decora por reflejo.

**Key Characteristics:**

- Portadas full-bleed con overlay editorial — la emoción vive en la foto, no en efectos.
- Playfair Display solo en display/headline; Inter en todo lo demás.
- Terracota como única voz de color de marca, con rareza deliberada.
- Flat por defecto: la profundidad viene de capas de fotografía (diorama 2.5D) y tono, no de sombras.
- Motion sutil-experto: ease-out exponencial, duraciones cortas, `prefers-reduced-motion` siempre.

## Colors

Una voz de marca sobre papel neutro real — sin paletas de moda, sin azules corporativos.

### Primary

- **Terracota editorial** (#b84a3a): CTA, estados activos, marcadores de énfasis. El color de L&A — se usa poco y donde importa.
- **Terracota profunda** (oklch(0.42 0.12 28)): hover y pressed de acciones primarias.
- **Terracota sutil** (oklch(0.93 0.025 30)): chips, tags y fondos de énfasis suaves.

### Neutral

- **Papel** (oklch(0.985 0.002 60)): fondo del cuerpo. Off-white neutro — nunca crema/beige de moda.
- **Tinta** (oklch(0.15 0.005 60)): texto principal.
- **Superficie** (oklch(0.99 0.002 60)): tarjetas y paneles.
- **Borde** (oklch(0.9 0.005 60)): líneas y divisores.
- **Texto secundario** (oklch(0.55 0.01 60 / 0.7)): metadatos y captions.

### Semantic

- **Destructive** (oklch(0.58 0.18 25)) y **Success** (oklch(0.45 0.15 145)): estados semánticos existentes; se conservan tal cual.

### Named Rules

**The One Voice Rule.** La terracota ocupa ≤10% de cualquier pantalla. Su rareza es su poder — si está en todo, no firma nada.

**The Real Paper Rule.** El fondo es off-white neutro real (chroma ≈ 0). El calor de la marca lo llevan la fotografía y el acento, jamás un fondo beige.

## Typography

**Display Font:** Playfair Display (Georgia, serif)
**Body Font:** Inter (ui-sans-serif, system-ui)

**Character:** Una revista que funciona como herramienta: serif con autoridad editorial para los titulares que emocionan, sans neutral para la UI que debe ser obvia.

### Hierarchy

- **Display** (Playfair 600, clamp(2.75rem, 6vw, 6rem), 1.1): titulares de portada — hero del home y de destinos.
- **Headline** (Playfair 600, clamp(1.75rem, 3vw, 2.5rem), 1.15): títulos de sección y páginas de catálogo.
- **Title** (Inter 600, 1.25rem, 1.3): títulos de cards y paneles.
- **Body** (Inter 400, 1rem, 1.7): prosa. Línea máxima 65–75ch (`prose-content`).
- **Label** (Inter 500, 0.875rem, 1.4): UI, botones, metadatos.

### Named Rules

**The Ceiling Rule.** El display nunca supera 6rem. Si la portada grita, no comunica.

**The Pairing Rule.** Playfair solo en display/headline. Nunca en UI, labels o formularios.

## Layout

Contenedor editorial único (`container-page`, max-w 72rem, padding 6/8/12). Secciones con ritmo generoso (py-24) y densidad baja. Móvil primero: mismo contenido, jerarquía vertical. El catálogo abandona la grilla uniforme: un destino feature + fila editorial scrollable. Vistas inmersivas usan `min-h-dvh`.

## Elevation & Depth

Flat por defecto — sin sombras en reposo. La profundidad la construyen las capas de fotografía (parallax diorama en páginas de detalle: cielo → paisaje → primer plano) y la separación tonal (papel vs superficie). El único material "vivo" permitido: la barra sticky con backdrop-blur.

### Named Rules

**The Flat-By-Default Rule.** Ninguna superficie proyecta sombra en reposo. El estado (hover/focus) responde con color y tono, no con elevación falsa.

## Shapes

Esquinas editoriales afiladas: 4px en botones e imágenes, 8px solo en superficies mayores. Las portadas full-bleed no llevan radius. Full-pill reservado a chips y badges. Bordes de 1px con el tono del papel.

## Components

### Buttons

- **Shape:** rectángulo editorial (radius 4px), padding 12px 32px, label Inter 500.
- **Primary:** fondo terracota + texto on-primary; hover → terracota profunda.
- **Ghost:** borde 1px terracota + texto terracota; hover → fondo terracota + texto on-primary. Es el CTA de portada.
- **Focus:** ring visible de 2px — nunca se elimina.

### Chips

- **Scope (nacional/internacional):** fondo terracota-sutil + texto tinta; seleccionado → terracota + on-primary.

### Cards

- **Destino/paquete:** imagen superior aspect 4/5 (radius 4px), título Playfair debajo, hover con scale 1.05 usando duration-slow + ease-out-expo. La grilla uniforme de cards idénticas está prohibida — jerarquía editorial.

### Inputs

- **Style:** fondo superficie, borde 1px, radius 4px, label visible Inter 500.
- **Focus:** borde terracota + ring suave.
- **Error:** texto destructive junto al campo, nunca solo arriba.

### Navigation

- **Header sticky** con backdrop-blur — único uso de glass permitido. Links Inter 500; estado activo en terracota. Mobile: menú lateral existente.

## Do's and Don'ts

### Do:

- **Do** dar protagonismo absoluto a la fotografía real: full-bleed, alta resolución, alt descriptivo.
- **Do** usar tokens `--color-*` siempre — jamás hex crudo en componentes.
- **Do** animar con los easings `--ease-out-*` y las duraciones de la escala motion (150/280/560ms).
- **Do** incluir fallback `prefers-reduced-motion` en cada animación.

### Don't:

- **Don't** usar glass/backdrop-blur fuera del header sticky.
- **Don't** repetir cards idénticas en grillas infinitas — jerarquía editorial o nada.
- **Don't** usar eyebrows en mayúsculas sobre cada sección, gradient text ni bordes laterales de acento.
- **Don't** justificar WebGL pesado donde el diorama por capas logra la inmersión.
- **Don't** usar Playfair en UI, labels o formularios.
