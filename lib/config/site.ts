/**
 * Canonical public site URL, used for metadata, robots.txt, and sitemap.xml.
 * Falls back to the production domain when NEXT_PUBLIC_SITE_URL is not set.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://laviajesyaventuras.com";
