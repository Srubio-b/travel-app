// Domain entities — business-semantic types, enums, and value objects
// Wraps the raw DB types with domain meaning

// ── Enums ──────────────────────────────────────────────────

export enum RoleName {
  Admin = 'admin',
  Cliente = 'cliente',
}

export enum TripStatus {
  Upcoming = 'upcoming',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

// ── Value Object Type Aliases ──────────────────────────────
// Wraps primitives with business meaning — use these to self-document signatures

export type Slug = string; // URL-safe unique identifier
export type Email = string; // citext-backed, case-insensitive
export type UUID = string; // Postgres UUID primary / foreign key
export type CurrencyAmount = number; // numeric(10,2) — two decimal places
export type Days = number; // positive integer duration
export type DisplayOrder = number; // smallint ordering

// ── Soft-Delete Metadata ───────────────────────────────────

export interface SoftDeletable {
  deleted_at: string | null;
}

// ── Timestamped Entity ─────────────────────────────────────

export interface Timestamped {
  created_at: string;
  updated_at: string;
}

// ── Business Enrichment Helpers ─────────────────────────────

/** Extracts a human-readable label for a TripStatus value */
export function tripStatusLabel(status: TripStatus): string {
  const labels: Record<TripStatus, string> = {
    [TripStatus.Upcoming]: 'Próximo',
    [TripStatus.Completed]: 'Completado',
    [TripStatus.Cancelled]: 'Cancelado',
  };
  return labels[status];
}

/** Checks whether a timestamped entity was soft-deleted */
export function isDeleted(entity: SoftDeletable): boolean {
  return entity.deleted_at !== null;
}

/** Returns true if the package is published (has a published_at date) */
export function isPublished(pkg: { published_at: string | null }): boolean {
  return pkg.published_at !== null && new Date(pkg.published_at) <= new Date();
}
