// Global type definitions — database entity interfaces
// Mirrors the Supabase public schema 1:1

// ── Lookup / Auth ──────────────────────────────────────────

export interface Role {
  id: number; // smallint
  name: string;
  description: string | null;
}

export interface UserRole {
  user_id: string; // uuid
  role_id: number; // smallint
  assigned_at: string; // timestamptz
}

export interface Profile {
  id: string; // uuid – FK → auth.users
  full_name: string;
  email: string; // citext
  phone: string | null;
  avatar_url: string | null;
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
  deleted_at: string | null; // timestamptz – soft delete
}

// ── Destinations ───────────────────────────────────────────

export interface Destination {
  id: string; // uuid – gen_random_uuid()
  name: string;
  slug: string; // UNIQUE
  description: string | null;
  country: string;
  region: string | null;
  image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ── Shared Admin Action Result ──────────────────────────────

/**
 * Return type for all admin Server Actions.
 *
 * Mirrors the AuthResult pattern but adds an optional `data` field
 * that carries the created/updated entity's id so the caller can
 * redirect or reference it.
 */
export type ActionResult =
  | { success: true; message?: string; data?: { id: string } }
  | { success: false; error: string; field?: string };

// ── Travel Packages ────────────────────────────────────────

export interface TravelPackage {
  id: string;
  title: string;
  slug: string; // UNIQUE
  description: string;
  price: number; // numeric(10,2)
  duration_days: number;
  what_includes: string | null;
  what_excludes: string | null;
  is_national: boolean;
  is_active: boolean;
  published_at: string | null; // timestamptz
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ── M:N Junction ───────────────────────────────────────────

export interface PackageDestination {
  package_id: string; // uuid
  destination_id: string; // uuid
  display_order: number; // smallint
}

export interface PackageImage {
  id: string;
  package_id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

// ── Client History ─────────────────────────────────────────

export interface ClientTrip {
  id: string;
  client_id: string; // FK → profiles.id
  package_id: string; // FK → travel_packages.id (RESTRICT)
  booking_date: string; // date
  trip_start: string; // date
  trip_end: string | null; // date
  status: 'upcoming' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ── Referral Codes ─────────────────────────────────────────

export interface ReferralCode {
  id: string;
  client_id: string;
  code: string; // UNIQUE (varchar 20)
  created_at: string;
  used_count: number;
  max_uses: number | null; // NULL = unlimited
  is_active: boolean;
  deleted_at: string | null;
}
