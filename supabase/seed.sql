-- Seed data: L&A Viajes y Aventuras — catálogo público
-- 3 destinos, 3 paquetes (2 nacionales, 1 internacional), con imágenes y relaciones.
-- Corresponde a la data ya aplicada en el proyecto Supabase yqrqebfflyhqmonjaiwg.

-- ── Destinos ────────────────────────────────────────────────────
INSERT INTO destinations (id, slug, name, country, region, description, is_active, created_at)
VALUES
  (
    'c929c2d1-b59a-450d-83aa-0434126a019f',
    'cartagena',
    'Cartagena',
    'Colombia',
    'Caribe',
    'Ciudad amurallada con playas espectaculares, historia colonial y vibrante vida nocturna.',
    true,
    '2026-07-09 23:48:23.365574+00'
  ),
  (
    '8bac6cf0-0723-47d9-b9f9-867cea6bfba9',
    'san-andres',
    'San Andrés',
    'Colombia',
    'Caribe',
    'Isla de aguas cristalinas de siete colores, ideal para buceo y descanso.',
    true,
    '2026-07-09 23:48:23.365574+00'
  ),
  (
    'cd7c5b24-a8e2-4dc0-af31-0f2de88fb968',
    'cancun',
    'Cancún',
    'México',
    'Quintana Roo',
    'Caribe mexicano con ruinas mayas, hoteles frente al mar y arrecifes de coral.',
    true,
    '2026-07-09 23:48:23.365574+00'
  );

-- ── Paquetes ────────────────────────────────────────────────────
INSERT INTO travel_packages (id, title, slug, description, price, duration_days, is_national, is_active, what_includes, what_excludes, published_at, created_at)
VALUES
  (
    '444664c6-c6da-462f-8e3f-f49ea956bdfd',
    'Cartagena de Vacaciones',
    'cartagena-de-vacaciones',
    'Escapada de 4 días por la ciudad amurallada, playas y vida nocturna cartagenera.',
    1850000.00,
    4,
    true,
    true,
    'Alojamiento, desayunos, tour ciudad amurallada',
    'Vuelos, gastos personales',
    '2026-07-09 23:48:23.365574+00',
    '2026-07-09 23:48:23.365574+00'
  ),
  (
    '39780770-df26-4c69-9545-83f5f39a2891',
    'San Andrés Todo Incluido',
    'san-andres-todo-incluido',
    '5 días de sol y playa en la isla, con paseos en lancha y snorkel.',
    2450000.00,
    5,
    true,
    true,
    'Alojamiento, todo incluido, tour por la isla',
    'Vuelos',
    '2026-07-09 23:48:23.365574+00',
    '2026-07-09 23:48:23.365574+00'
  ),
  (
    'f10096bd-e08f-44bf-b1c0-dd03eb77b9e4',
    'Cancún Internacional',
    'cancun-internacional',
    '6 días en el Caribe mexicano, hoteles frente al mar y excursiones a ruinas mayas.',
    4200000.00,
    6,
    false,
    true,
    'Vuelos internacionales, alojamiento, desayunos, una excursión',
    'Gastos personales, propinas',
    '2026-07-09 23:48:23.365574+00',
    '2026-07-09 23:48:23.365574+00'
  );

-- ── Relaciones paquete-destino ──────────────────────────────────
INSERT INTO package_destinations (package_id, destination_id, display_order)
VALUES
  ('444664c6-c6da-462f-8e3f-f49ea956bdfd', 'c929c2d1-b59a-450d-83aa-0434126a019f', 1),
  ('39780770-df26-4c69-9545-83f5f39a2891', '8bac6cf0-0723-47d9-b9f9-867cea6bfba9', 1),
  ('f10096bd-e08f-44bf-b1c0-dd03eb77b9e4', 'cd7c5b24-a8e2-4dc0-af31-0f2de88fb968', 1);

-- ── Imágenes de paquetes ────────────────────────────────────────
INSERT INTO package_images (id, package_id, url, alt_text, is_primary, display_order)
VALUES
  (
    'b92a142a-fa9c-44b9-a068-a00a576c5c92',
    '444664c6-c6da-462f-8e3f-f49ea956bdfd',
    'paquetes/cartagena-1.jpg',
    'Vista de la ciudad amurallada de Cartagena',
    true,
    1
  ),
  (
    '5ba0d960-cb3d-43cd-ab54-7ce8bca372ef',
    '39780770-df26-4c69-9545-83f5f39a2891',
    'paquetes/san-andres-1.jpg',
    'Playa de aguas turquesa en San Andrés',
    true,
    1
  ),
  (
    '6b2dd18c-eebb-4de1-9e0f-4de6849e1fdb',
    'f10096bd-e08f-44bf-b1c0-dd03eb77b9e4',
    'paquetes/cancun-1.jpg',
    'Playa de arena blanca en Cancún',
    true,
    1
  );
