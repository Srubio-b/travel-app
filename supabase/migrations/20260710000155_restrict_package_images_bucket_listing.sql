-- Replace the broad SELECT policy on storage.objects for the package-images
-- bucket (which allowed listing every object in the bucket) with a policy
-- scoped to only the images that belong to a published, active travel
-- package. This prevents anonymous enumeration/listing of arbitrary files
-- while still allowing public reads of legitimate catalog images.
drop policy if exists "public_read_package_images" on storage.objects;

create policy "select_published_package_images"
on storage.objects
for select
to anon
using (
  bucket_id = 'package-images'
  and exists (
    select 1
    from public.package_images pi
    join public.travel_packages tp on tp.id = pi.package_id
    where pi.url = storage.objects.name
      and tp.is_active = true
      and tp.published_at is not null
      and tp.published_at <= now()
      and tp.deleted_at is null
  )
);
