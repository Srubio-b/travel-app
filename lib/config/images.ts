/**
 * Fallback image URLs for sections that have no real image yet.
 * Uses curated Unsplash photos. Replace with real images when available.
 *
 * All photos are under Unsplash License (free for commercial use, no attribution required).
 */

export const FALLBACK_IMAGES = {
  /** Homepage hero background — mountain landscape */
  hero: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",

  /** Destination hero background — tropical beach */
  destinationHero: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80",

  /** Package/destination card placeholder */
  card: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80",

  /** Generic travel fallback */
  travel: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
} as const;

export type FallbackImageKey = keyof typeof FALLBACK_IMAGES;

/**
 * Arrival imagery — the "you have landed" view for each destination page.
 *
 * The destination journey (components/transitions/DestinationTravel.tsx)
 * dives into the card's overview photograph and lands on this different one:
 * the story reads as traveling from the far/aerial view (card) to standing
 * in the place at golden hour. Curated Unsplash photos (same license as
 * FALLBACK_IMAGES: free for commercial use, no attribution required).
 *
 * Replace with DB-driven imagery when the content model supports a second
 * destination photo.
 */
export const ARRIVAL_HERO_IMAGES: Record<string, string> = {
  cancun: "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=1600&q=80",
  cartagena: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1600&q=80",
  "san-andres": "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1600&q=80",
} as const;
