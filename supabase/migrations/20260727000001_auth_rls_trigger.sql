-- Migration: Auth RLS + Trigger + FK
-- 
-- What:
--   0. Create auth tables (idempotent — IF NOT EXISTS) + seed roles
--   1. Drop and recreate profiles_id_fkey with ON DELETE CASCADE
--   2. Enable RLS on auth tables (profiles, user_roles, client_trips, referral_codes)
--   3. RLS policies for each table
--   4. handle_new_user() trigger function
--   5. Trigger on_auth_user_created on auth.users
--   6. Updated_at triggers on profiles and client_trips

-- ============================================================
-- 0. Extensions + Auth tables (idempotent for fresh & existing projects)
-- ============================================================

create extension if not exists citext with schema extensions;

-- ── roles ─────────────────────────────────────────────────────
create table if not exists public.roles (
  id          smallint     primary key,
  name        varchar(50)  not null unique,
  description text
);

insert into public.roles (id, name, description)
values
  (1, 'admin',   'Administrador'),
  (2, 'cliente', 'Cliente registrado')
on conflict (id) do nothing;

-- ── profiles ──────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid         primary key references auth.users(id) on delete cascade,
  full_name  varchar(255) not null,
  email      citext       not null unique,
  phone      varchar(50),
  avatar_url text,
  created_at timestamptz  not null default now(),
  updated_at timestamptz  not null default now(),
  deleted_at timestamptz
);

-- ── user_roles ────────────────────────────────────────────────
create table if not exists public.user_roles (
  user_id     uuid        not null references auth.users(id) on delete cascade,
  role_id     smallint    not null references public.roles(id),
  assigned_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

-- ── client_trips ──────────────────────────────────────────────
create table if not exists public.client_trips (
  id           uuid         primary key default gen_random_uuid(),
  client_id    uuid         not null references public.profiles(id),
  package_id   uuid         not null references public.travel_packages(id),
  booking_date date         not null,
  trip_start   date         not null,
  trip_end     date,
  status       varchar(50)  not null default 'upcoming',
  notes        text,
  created_at   timestamptz  not null default now(),
  updated_at   timestamptz  not null default now(),
  deleted_at   timestamptz
);

-- ── referral_codes ────────────────────────────────────────────
create table if not exists public.referral_codes (
  id         uuid        primary key default gen_random_uuid(),
  client_id  uuid        not null references public.profiles(id),
  code       varchar(50) not null unique,
  created_at timestamptz not null default now(),
  used_count integer     not null default 0,
  max_uses   integer     default 1,
  is_active  boolean     not null default true,
  deleted_at timestamptz
);

-- ============================================================
-- 1. FK constraint: profiles.id → auth.users.id ON DELETE CASCADE
-- ============================================================
-- The FK already exists (from initial schema), but may not have CASCADE.
-- Drop and recreate to ensure CASCADE behavior.
alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users(id)
  on delete cascade;

-- ============================================================
-- 2. Enable Row Level Security on auth tables
-- ============================================================
-- roles is intentionally excluded — it's a read-only reference table (2 rows).

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.client_trips enable row level security;
alter table public.referral_codes enable row level security;

-- ============================================================
-- 3. RLS Policies
-- ============================================================

-- Profiles: users see / update only their own profile
create policy "profiles_user_select_own"
  on public.profiles for select
  to authenticated
  using ( (select auth.uid()) = id );

create policy "profiles_user_update_own"
  on public.profiles for update
  to authenticated
  using ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

-- User_roles: users see only their own role assignment
create policy "user_roles_user_select_own"
  on public.user_roles for select
  to authenticated
  using ( (select auth.uid()) = user_id );

-- Client_trips: users see / insert / update only their own trips
create policy "client_trips_user_select_own"
  on public.client_trips for select
  to authenticated
  using ( (select auth.uid()) = client_id );

create policy "client_trips_user_insert_own"
  on public.client_trips for insert
  to authenticated
  with check ( (select auth.uid()) = client_id );

create policy "client_trips_user_update_own"
  on public.client_trips for update
  to authenticated
  using ( (select auth.uid()) = client_id )
  with check ( (select auth.uid()) = client_id );

-- Referral_codes: users see only their own referral codes
create policy "referral_codes_user_select_own"
  on public.referral_codes for select
  to authenticated
  using ( (select auth.uid()) = client_id );

-- ============================================================
-- 4. Trigger function: handle_new_user()
-- ============================================================
-- Atomic: creates profile + user_roles (role_id=2 = cliente) on signup.
-- If either insert fails, the entire auth.users insert is rolled back.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1)
    )
  );

  insert into public.user_roles (user_id, role_id)
  values (new.id, 2); -- role_id=2 = cliente

  return new;
end;
$$;

-- ============================================================
-- 5. Trigger: on_auth_user_created
-- ============================================================
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================
-- 6. Updated_at triggers (profiles, client_trips)
-- ============================================================

create function public.update_updated_at_column()
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

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();

create trigger set_updated_at_client_trips
  before update on public.client_trips
  for each row
  execute function public.update_updated_at_column();
