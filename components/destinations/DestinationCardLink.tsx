"use client";

import { useRef, type MouseEvent } from "react";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { FALLBACK_IMAGES } from "@/lib/config/images";
import { useDestinationTravel } from "@/components/transitions/DestinationTravel";

type DestinationCardLinkProps = {
  href: string;
  name: string;
  regionLine: string;
  description: string | null;
  imageSrc: string | null;
};

/**
 * Catalog card that starts the destination journey instead of navigating
 * directly. On click it hands the card image's exact viewport rect and the
 * browser-selected source to the travel overlay, which dives into the
 * photograph and lands on the destination page. Keyboard activation
 * follows the same path (Enter triggers click on links).
 */
export function DestinationCardLink({
  href,
  name,
  regionLine,
  description,
  imageSrc,
}: DestinationCardLinkProps) {
  const { startTravel } = useDestinationTravel();
  const figureRef = useRef<HTMLDivElement>(null);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const figure = figureRef.current;
    if (!figure) return;

    const rect = figure.getBoundingClientRect();
    const img = figure.querySelector("img");
    const src = img?.currentSrc || imageSrc || FALLBACK_IMAGES.card;

    startTravel({
      href,
      src,
      alt: name,
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
    });
  };

  return (
    <Link href={href} onClick={handleClick} className="group block">
      <article>
        <div
          ref={figureRef}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-surface"
        >
          <Image
            src={imageSrc ?? FALLBACK_IMAGES.card}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            className="object-cover transition-all duration-500 group-hover:scale-105"
          />
        </div>
        <div className="mt-4 space-y-1">
          <h2 className="font-display text-xl leading-display tracking-tight">{name}</h2>
          <p className="text-sm text-muted">{regionLine}</p>
        </div>
        {description && <p className="mt-2 line-clamp-2 text-sm text-muted/80">{description}</p>}
      </article>
    </Link>
  );
}
