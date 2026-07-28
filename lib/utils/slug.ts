/**
 * Converts text into a URL-friendly slug.
 *
 * 1. Lowercases the input
 * 2. Removes Unicode combining diacritical marks (accents)
 * 3. Replaces any non-alphanumeric character with a hyphen
 * 4. Collapses multiple consecutive hyphens into one
 * 5. Trims leading/trailing hyphens
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // strip accents
    .replace(/[^a-z0-9]+/g, "-")        // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, "")            // trim leading/trailing hyphens
    .replace(/-+/g, "-");               // collapse multiple hyphens
}
