-- Create the public storage bucket used to host travel package images.
insert into storage.buckets (id, name, public)
values ('package-images', 'package-images', true)
on conflict (id) do nothing;

-- NOTE: the original public-read policy created here
-- ("public_read_package_images") allowed listing every object in the
-- bucket. It has since been replaced by a scoped policy in the
-- restrict_package_images_bucket_listing migration below.
create policy "public_read_package_images"
on storage.objects
for select
to anon
using (bucket_id = 'package-images');
