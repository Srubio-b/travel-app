"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRouter } from "@/lib/i18n/navigation";

gsap.registerPlugin(useGSAP);

type TravelRequest = {
  href: string;
  src: string;
  alt: string;
  rect: { left: number; top: number; width: number; height: number };
};

type DestinationTravelContextValue = {
  startTravel: (request: TravelRequest) => void;
  notifyArrival: () => void;
};

const DestinationTravelContext = createContext<DestinationTravelContextValue | null>(null);

/** Access the travel choreography. Throws outside the provider. */
export function useDestinationTravel(): DestinationTravelContextValue {
  const ctx = useContext(DestinationTravelContext);

  if (!ctx) {
    throw new Error("useDestinationTravel must be used inside DestinationTravelProvider");
  }

  return ctx;
}

/**
 * The destination journey — a three-act cover transition.
 *
 * Act 1 (descend): the card's photograph grows from its exact on-screen rect
 * to a full-viewport cover while the camera keeps sinking into it (slow
 * zoom + cinematic dim). The page — header and footer included — swaps
 * underneath, hidden by the cover.
 *
 * Act 2 (arrive): when the destination page mounts, its hero — a DIFFERENT
 * photograph (golden hour, standing in the place) — cross-fades in beneath
 * the cover: the view changes as the traveler lands.
 *
 * Act 3 (settle): the cover fades out and the page — header and footer
 * back in place — emerges softly on top of it.
 *
 * `prefers-reduced-motion` skips the whole choreography: plain navigation.
 * The choreography is driven imperatively (refs + direct functions) so GSAP
 * contexts never revert mid-sequence.
 */
export function DestinationTravelProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [travel, setTravel] = useState<TravelRequest | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const arriveRef = useRef<(() => void) | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    },
    [],
  );

  const startTravel = useCallback(
    (request: TravelRequest) => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion || !request.src) {
        router.push(request.href);
        return;
      }

      setTravel(request);
    },
    [router],
  );

  const notifyArrival = useCallback(() => {
    arriveRef.current?.();
  }, []);

  useGSAP(
    () => {
      if (!travel) return;

      const root = rootRef.current;
      const box = boxRef.current;
      const zoom = zoomRef.current;
      const scrim = scrimRef.current;

      if (!root || !box || !zoom || !scrim) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Cover appears exactly over the card (FLIP-style: GPU transforms only).
      root.style.pointerEvents = "auto";
      gsap.set(root, { autoAlpha: 1 });
      gsap.set(box, {
        x: travel.rect.left,
        y: travel.rect.top,
        scaleX: travel.rect.width / vw,
        scaleY: travel.rect.height / vh,
        transformOrigin: "0 0",
      });
      gsap.set(zoom, { scale: 1 });
      gsap.set(scrim, { autoAlpha: 0 });

      let arrived = false;

      const arrive = () => {
        if (arrived) return;
        arrived = true;

        // Act 2 + 3 — the view changes: cover cross-fades out over the
        // arrival hero while settling its zoom; the page (header and
        // footer included) emerges softly on top.
        root.style.pointerEvents = "none";

        gsap
          .timeline({ onComplete: () => setTravel(null) })
          .to(zoom, { scale: 1.14, duration: 0.9, ease: "power2.out" }, 0)
          .to(root, { autoAlpha: 0, duration: 0.8, ease: "power2.inOut" }, 0.1);
      };

      arriveRef.current = arrive;

      // Act 1 — the descent: the card grows to fill the viewport while the
      // camera keeps sinking toward the ground.
      gsap
        .timeline({
          onComplete: () => {
            // Fully covered — swap the page underneath the tunnel.
            router.push(travel.href);

            // Safety: if the arrival signal never fires, reveal anyway.
            safetyTimerRef.current = setTimeout(arrive, 4000);
          },
        })
        .to(box, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.85, ease: "power3.inOut" }, 0)
        .to(zoom, { scale: 1.3, duration: 2.2, ease: "none" }, 0)
        .to(scrim, { autoAlpha: 0.35, duration: 1.3, ease: "power1.inOut" }, 0.3);

      return () => {
        if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
        arriveRef.current = null;
      };
    },
    { dependencies: [travel], scope: rootRef },
  );

  return (
    <DestinationTravelContext.Provider value={{ startTravel, notifyArrival }}>
      {children}
      {travel && (
        <div
          ref={rootRef}
          aria-hidden="true"
          className="fixed inset-0 z-[60] opacity-0"
          style={{ pointerEvents: "none" }}
        >
          <div ref={boxRef} className="absolute inset-0 overflow-hidden will-change-transform">
            <div ref={zoomRef} className="absolute inset-0 will-change-transform">
              <Image
                src={travel.src}
                alt={travel.alt}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <div ref={scrimRef} className="absolute inset-0 bg-black" style={{ opacity: 0 }} />
          </div>
        </div>
      )}
    </DestinationTravelContext.Provider>
  );
}
