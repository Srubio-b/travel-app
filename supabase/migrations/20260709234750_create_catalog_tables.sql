-- Schema: Catálogo público de L&A Viajes y Aventuras
-- 4 tablas para destinos, paquetes turísticos, sus relaciones e imágenes.
-- Aplicada inicialmente vía dashboard / direct SQL; se migra al sistema
-- de migraciones para reproducibilidad.

-- ── Destinations ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS destinations (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       varchar(255) NOT NULL,
  slug       varchar(255) NOT NULL UNIQUE,
  description text,
  country    varchar(100) NOT NULL,
  region     varchar(100),
  image_url  text,
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- ── Travel Packages ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS travel_packages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           varchar(255) NOT NULL,
  slug            varchar(255) NOT NULL UNIQUE,
  description     text         NOT NULL,
  price           numeric      NOT NULL,
  duration_days   integer      NOT NULL,
  what_includes   text,
  what_excludes   text,
  is_national     boolean      NOT NULL,
  is_active       boolean      NOT NULL DEFAULT true,
  published_at    timestamptz,
  created_at      timestamptz  NOT NULL DEFAULT now(),
  updated_at      timestamptz  NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

-- ── Package ↔ Destination (M:N) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS package_destinations (
  package_id     uuid     NOT NULL REFERENCES travel_packages(id) ON DELETE CASCADE,
  destination_id uuid     NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  display_order  smallint NOT NULL DEFAULT 0,
  PRIMARY KEY (package_id, destination_id)
);

-- ── Package Images ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS package_images (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id    uuid         NOT NULL REFERENCES travel_packages(id) ON DELETE CASCADE,
  url           text         NOT NULL,
  alt_text      varchar(255),
  is_primary    boolean      NOT NULL DEFAULT false,
  display_order smallint     NOT NULL DEFAULT 0,
  created_at    timestamptz  NOT NULL DEFAULT now()
);

-- ── Indexes ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_travel_packages_is_active
  ON travel_packages (is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_travel_packages_is_national
  ON travel_packages (is_national);

CREATE INDEX IF NOT EXISTS idx_travel_packages_slug_active
  ON travel_packages (slug) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_package_images_package
  ON package_images (package_id, display_order);

CREATE INDEX IF NOT EXISTS idx_destinations_is_active
  ON destinations (is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_destinations_slug_active
  ON destinations (slug) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_package_destinations_join
  ON package_destinations (destination_id, package_id);
