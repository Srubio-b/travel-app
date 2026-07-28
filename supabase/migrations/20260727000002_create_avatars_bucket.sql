-- Migration: Create avatars storage bucket with RLS policies
-- 
-- What:
--   1. Create 'avatars' public bucket
--   2. RLS policies: anon/authenticated SELECT, authenticated INSERT/UPDATE/DELETE scoped to own path

-- ============================================================
-- 1. Create bucket
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- ============================================================
-- 2. RLS Policies on storage.objects for avatars bucket
-- ============================================================

-- Allow anyone to view avatars (needed for public profile display)
create policy "avatars_select_public"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars in their own folder
create policy "avatars_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own avatars
create policy "avatars_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own avatars
create policy "avatars_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
