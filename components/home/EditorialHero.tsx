"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { Link } from "@/lib/i18n/navigation";
import { FALLBACK_IMAGES } from "@/lib/config/images";

gsap.registerPlugin(useGSAP, SplitText);

type EditorialHeroProps = {
  title: string;
  subtitle: string;
  cta: string;
  ctaHref: string;
};

/**
 * Portada editorial — full-bleed cover with masked SplitText reveal.
 *
 * Motion contract (DESIGN.md): the reveal choreography runs only when the user
 * has no reduced-motion preference; content is fully visible by default
 * (progressive enhancement — no visibility is gated on the animation).
 */
export function EditorialHero({ title, subtitle, cta, ctaHref }: EditorialHeroProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Reveal choreography — only for users without reduced-motion preference.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        SplitText.create("[data-hero-title]", {
          type: "lines,words",
          mask: "lines",
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.words, {
              yPercent: 110,
              duration: 0.9,
              ease: "expo.out",
              stagger: 0.04,
            });
          },
        });

        gsap.from("[data-hero-subtitle]", {
          y: 24,
          opacity: 0,
          duration: 0.6,
          ease: "expo.out",
          delay: 0.55,
        });

        gsap.from("[data-hero-cta]", {
          y: 16,
          opacity: 0,
          duration: 0.5,
          ease: "expo.out",
          delay: 0.7,
        });
      });
    },
    { scope: containerRef },
  );

  return (
    <section ref={containerRef} className="relative flex min-h-dvh items-end overflow-hidden">
      {/* Fallback background image — reemplazar con foto real del destino destacado */}
      <Image
        src={FALLBACK_IMAGES.hero}
        alt=""
        fill
        priority
        sizes="100vw"
        className="animate-ken-burns object-cover"
      />
      {/* Editorial scrim — keeps photography vivid while anchoring the type */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />

      <div className="relative z-10 mx-auto w-full max-w-[72rem] px-6 pb-24 pt-40 sm:px-8 lg:px-12">
        {/* No text-balance on split headings — SplitText owns the line logic. */}
        <h1
          data-hero-title
          className="max-w-4xl font-display text-[clamp(2.75rem,6vw,6rem)] leading-display tracking-[-0.02em] text-white"
        >
          {title}
        </h1>
        <p
          data-hero-subtitle
          className="mt-6 max-w-xl text-balance text-lg text-white/80 sm:text-xl"
        >
          {subtitle}
        </p>
        <div className="mt-10" data-hero-cta>
          <Link
            href={ctaHref}
            className="inline-block rounded-sm bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors duration-[150ms] ease-out-expo hover:bg-primary-deep"
          >
            {cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
