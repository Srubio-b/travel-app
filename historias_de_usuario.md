# Historias de Usuario — L&A Viajes y Aventuras (MVP)

## Épica 1: Catálogo Público de Viajes

**HU-01** — Como visitante, quiero ver un listado de paquetes turísticos con foto, destino y tipo (nacional/internacional), para explorar rápidamente las opciones disponibles.
- Criterios de aceptación:
  - El listado carga en menos de 2 segundos en móvil.
  - Cada tarjeta muestra: imagen principal, nombre del paquete, destino, tipo (nacional/internacional), precio referencial (si aplica).

**HU-02** — Como visitante, quiero filtrar los paquetes por tipo (nacional/internacional) y por destino, para encontrar planes que se ajusten a mi interés.
- Criterios de aceptación:
  - Los filtros se aplican sin recargar toda la página (client-side o server components).
  - Se puede combinar más de un filtro a la vez.

**HU-03** — Como visitante, quiero ver el detalle completo de un paquete (itinerario, incluye/no incluye, galería de fotos, destino), para decidir si me interesa contactar.
- Criterios de aceptación:
  - Página con URL amigable para SEO (ej. /paquetes/cartagena-todo-incluido).
  - Incluye metadatos dinámicos (title, description, Open Graph) y schema.org tipo TouristTrip.

**HU-04** — Como visitante, quiero un botón visible de "Contactar por WhatsApp" en cada paquete, para iniciar la conversación de compra directamente.
- Criterios de aceptación:
  - El botón abre WhatsApp con un mensaje predefinido que incluye el nombre del paquete.
  - Visible tanto en la tarjeta del listado como en el detalle.

**HU-05** — Como visitante, quiero navegar por páginas de destino específicas (ej. "Viajes a Cartagena"), para encontrar contenido relevante desde buscadores.
- Criterios de aceptación:
  - Cada destino tiene su propia página indexable con listado de paquetes asociados.

---

## Épica 2: Panel de Administrador

**HU-06** — Como administrador, quiero iniciar sesión de forma segura, para acceder al panel de gestión de contenidos.
- Criterios de aceptación:
  - Autenticación vía Supabase Auth.
  - Solo usuarios con rol "admin" pueden acceder a las rutas del panel.

**HU-07** — Como administrador, quiero crear un nuevo paquete turístico con toda su información (nombre, destino, tipo, descripción, itinerario, imágenes), para publicarlo en el catálogo.
- Criterios de aceptación:
  - Formulario con validación de campos obligatorios.
  - Soporte para carga múltiple de imágenes.

**HU-08** — Como administrador, quiero editar un paquete existente, para mantener la información actualizada (precios, disponibilidad, fotos).

**HU-09** — Como administrador, quiero eliminar (o desactivar) un paquete, para retirarlo del catálogo público sin perder el historial si ya fue vendido.
- Criterios de aceptación:
  - Se recomienda "soft delete" (campo activo/inactivo) en vez de borrado físico, para no romper historiales de clientes.

**HU-10** — Como administrador, quiero gestionar los destinos disponibles (crear, editar, eliminar), para mantener organizada la taxonomía del catálogo.

---

## Épica 3: Panel de Cliente

**HU-11** — Como cliente, quiero registrarme e iniciar sesión, para acceder a mi panel personal.
- Criterios de aceptación:
  - Autenticación vía Supabase Auth con rol "cliente".

**HU-12** — Como cliente, quiero ver un recap de los viajes que he realizado con la agencia (destino, fecha, fotos si aplica), para tener un historial personal de mis experiencias.
- Criterios de aceptación:
  - La información del recap es cargada/asociada manualmente por el administrador (en el MVP no hay reservas automáticas).
  - Vista tipo timeline o galería con los viajes ordenados cronológicamente.

**HU-13** — Como cliente, quiero editar mis datos básicos de perfil (nombre, teléfono, foto), para mantener mi cuenta actualizada.

---

## Épica 4: Preparación para Fase de Referidos (solo modelo de datos, sin lógica activa en el MVP)

**HU-14** — Como sistema, quiero que cada cliente registrado tenga un código único de referido almacenado en base de datos, para habilitar en el futuro el sistema de tracking automático vía WhatsApp.
- Criterios de aceptación:
  - Se genera un código único al crear el cliente (no requiere lógica de negocio activa aún).
  - No se implementa aún la detección ni el link de WhatsApp con el código embebido.

---

## Requisitos No Funcionales Transversales

- **SEO**: metadatos dinámicos, sitemap.xml, datos estructurados (schema.org), Core Web Vitals óptimos.
- **Rendimiento**: carga inicial menor a 2.5s en conexión móvil promedio.
- **Seguridad**: Row Level Security (RLS) en Supabase separando datos de admin y cliente.
- **Responsive**: diseño mobile-first, dado que +30% del tráfico esperado es desde celular.
- **Accesibilidad**: cumplimiento básico de buenas prácticas WCAG (contraste, alt text en imágenes).
