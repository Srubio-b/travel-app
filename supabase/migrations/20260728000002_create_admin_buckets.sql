-- Migration: Create admin Storage buckets for destino & paquete images
--
-- What:
--   1. Create 'destinos' and 'paquetes' public buckets
--   2. RLS policies: anon/authenticated SELECT, authenticated INSERT/UPDATE/DELETE
--      scoped to own path (for admin uploads via service_role)

-- ============================================================
-- 1. Create buckets
-- ============================================================
insert into storage.buckets (id, name, public)
values ('destinos', 'destinos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('paquetes', 'paquetes', true)
on conflict (id) do nothing;

-- ============================================================
-- 2. RLS Policies on storage.objects — destinos bucket
-- ============================================================

create policy "destinos_select_public"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'destinos');

create policy "destinos_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'destinos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "destinos_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'destinos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "destinos_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'destinos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================
-- 3. RLS Policies on storage.objects — paquetes bucket
-- ============================================================

create policy "paquetes_select_public"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'paquetes');

create policy "paquetes_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'paquetes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "paquetes_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'paquetes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "paquetes_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'paquetes'
  and (storage.foldername(name))[1] = auth.uid()::text
);
