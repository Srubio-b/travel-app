"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useDestinationTravel } from "@/components/transitions/DestinationTravel";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type DestinationHeroProps = {
  name: string;
  regionLine: string;
  imageSrc: string;
  imageAlt: string;
};

/**
 * Diorama 2.5D — the arrival view. Layers move at differential speeds on
 * scroll (the photograph lags below, the copy drifts up), so the reader
 * "sinks into" the place instead of scrolling past it.
 *
 * On mount it notifies the travel overlay (DestinationTravelProvider) that
 * the arrival photograph is in place — the overlay cross-fades from the
 * card's overview into this golden-hour view, completing the journey.
 */
export function DestinationHero({ name, regionLine, imageSrc, imageAlt }: DestinationHeroProps) {
  const scopeRef = useRef<HTMLElement>(null);
  const { notifyArrival } = useDestinationTravel();

  // The journey lands here — let the cover cross-fade into this view.
  // No-op when no travel is active (direct loads, other navigations).
  useEffect(() => {
    notifyArrival();
  }, [notifyArrival]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const scroll = {
          trigger: scopeRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        };

        // Far layer — the photograph lags behind the scroll.
        gsap.to("[data-diorama-img]", {
          yPercent: 8,
          ease: "none",
          scrollTrigger: { ...scroll, id: "diorama-img" },
        });

        // Near layer — the copy drifts up faster than the page.
        gsap.to("[data-diorama-content]", {
          yPercent: -30,
          ease: "none",
          scrollTrigger: { ...scroll, id: "diorama-content" },
        });

        // Entrance — the copy emerges as the travel cover lifts.
        gsap.from("[data-diorama-content] > *", {
          y: 28,
          opacity: 0,
          duration: 0.6,
          ease: "expo.out",
          stagger: 0.08,
          delay: 0.45,
        });
      });
    },
    { scope: scopeRef },
  );

  return (
    <section ref={scopeRef} className="relative flex min-h-[70vh] items-end overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          data-diorama-img
          className="scale-[1.18] object-cover"
        />
      </div>

      {/* Editorial scrim — same treatment as the home portada */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />

      <div
        data-diorama-content
        className="relative z-10 mx-auto w-full max-w-[72rem] px-6 pb-20 pt-40 sm:px-8 lg:px-12"
      >
        <h1 className="font-display text-[clamp(2.5rem,5.5vw,5rem)] leading-display tracking-[-0.02em] text-white">
          {name}
        </h1>
        <p className="mt-3 text-lg text-white/80">{regionLine}</p>
      </div>
    </section>
  );
}
