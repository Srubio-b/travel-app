-- Enable RLS on the public catalog tables and allow anonymous (public
-- website visitors) read access scoped to active/published records only.
-- This backs the public catalog (destinations, travel packages, package
-- images, and the destinations<->packages join table).

alter table public.destinations enable row level security;
alter table public.travel_packages enable row level security;
alter table public.package_images enable row level security;
alter table public.package_destinations enable row level security;

create policy "anon_select_active_destinations"
on public.destinations
for select
to anon
using (
  is_active = true
  and deleted_at is null
);

create policy "anon_select_published_travel_packages"
on public.travel_packages
for select
to anon
using (
  is_active = true
  and published_at is not null
  and published_at <= now()
  and deleted_at is null
);

create policy "anon_select_package_images"
on public.package_images
for select
to anon
using (
  exists (
    select 1
    from public.travel_packages tp
    where tp.id = package_images.package_id
      and tp.is_active = true
      and tp.published_at is not null
      and tp.published_at <= now()
      and tp.deleted_at is null
  )
);

create policy "anon_select_package_destinations"
on public.package_destinations
for select
to anon
using (
  exists (
    select 1
    from public.travel_packages tp
    where tp.id = package_destinations.package_id
      and tp.is_active = true
      and tp.published_at is not null
      and tp.published_at <= now()
      and tp.deleted_at is null
  )
);
