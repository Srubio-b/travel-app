-- Migration: polish_infra
-- Fase 1 — DB & Infrastructure del change polish-and-refactor.
-- Idempotente y seguro para proyectos con o sin datos históricos.

-- ============================================================
-- 0. Asegurar que el bucket unificado existe
-- ============================================================
insert into storage.buckets (id, name, public)
values ('package-images', 'package-images', true)
on conflict (id) do nothing;

-- ============================================================
-- 1. Completar updated_at en package_images
-- ============================================================
alter table public.package_images
  add column if not exists updated_at timestamptz not null default now();

-- ============================================================
-- 2. Enum trip_status y aplicación a client_trips.status
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'trip_status' and typtype = 'e'
  ) then
    create type trip_status as enum ('upcoming', 'completed', 'cancelled');
  end if;
end $$;

alter table public.client_trips
  alter column status type trip_status using status::trip_status,
  alter column status set default 'upcoming';

-- ============================================================
-- 3. CHECK constraints en travel_packages
-- ============================================================
alter table public.travel_packages
  add constraint if not exists chk_travel_packages_price_non_negative
    check (price >= 0),
  add constraint if not exists chk_travel_packages_duration_min_1
    check (duration_days >= 1);

-- ============================================================
-- 4. Índices frecuentes
-- ============================================================
create index if not exists idx_travel_packages_published_at
  on public.travel_packages (published_at);

create index if not exists idx_travel_packages_deleted_at
  on public.travel_packages (deleted_at);

create index if not exists idx_destinations_deleted_at
  on public.destinations (deleted_at);

create index if not exists idx_destinations_name
  on public.destinations (name);

create index if not exists idx_package_destinations_package_id
  on public.package_destinations (package_id);

-- ============================================================
-- 5. Triggers updated_at
-- ============================================================
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_destinations on public.destinations;
create trigger set_updated_at_destinations
  before update on public.destinations
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists set_updated_at_travel_packages on public.travel_packages;
create trigger set_updated_at_travel_packages
  before update on public.travel_packages
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists set_updated_at_package_images on public.package_images;
create trigger set_updated_at_package_images
  before update on public.package_images
  for each row
  execute function public.update_updated_at_column();

-- ============================================================
-- 6. Normalizar paths almacenados a paths relativos .webp
--    Ejecutar ESTO solo después de migrar los objetos físicos
--    con scripts/migrate-storage.ts.
-- ============================================================
update public.destinations
set image_url = 'destinations/' || id || '.webp'
where image_url is not null;

update public.package_images
set url = 'packages/' || package_id || '/' || display_order || '.webp'
where url is not null;

-- ============================================================
-- 7. Depurar buckets y políticas de Storage obsoletos
--    Ejecutar ESTO solo después de verificar que los objetos
--    activos fueron migrados a package-images.
-- ============================================================

-- Eliminar objetos de los buckets viejos (ya migrados o huérfanos).
delete from storage.objects where bucket_id in ('destinos', 'paquetes');

-- Eliminar políticas obsoletas.
drop policy if exists destinos_select_public on storage.objects;
drop policy if exists destinos_insert_own on storage.objects;
drop policy if exists destinos_update_own on storage.objects;
drop policy if exists destinos_delete_own on storage.objects;

drop policy if exists paquetes_select_public on storage.objects;
drop policy if exists paquetes_insert_own on storage.objects;
drop policy if exists paquetes_update_own on storage.objects;
drop policy if exists paquetes_delete_own on storage.objects;

-- Eliminar los buckets viejos.
delete from storage.buckets where id in ('destinos', 'paquetes');
