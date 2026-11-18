"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type RevealOnScrollProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Reveals direct children as they enter the viewport — batched with a stagger
 * (40-80ms per item, expo-out arrival per DESIGN.md's motion doctrine).
 * Content is fully visible by default; the reveal only runs for users
 * without a reduced-motion preference.
 */
export function RevealOnScroll({ children, className }: RevealOnScrollProps) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = Array.from(scopeRef.current?.children ?? []) as HTMLElement[];
        if (items.length === 0) return;

        gsap.set(items, { y: 24, opacity: 0 });

        ScrollTrigger.batch(items, {
          start: "top 88%",
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: "expo.out",
              stagger: 0.06,
              overwrite: true,
            });
          },
        });
      });
    },
    { scope: scopeRef },
  );

  return (
    <div ref={scopeRef} className={className}>
      {children}
    </div>
  );
}
