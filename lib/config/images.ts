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
