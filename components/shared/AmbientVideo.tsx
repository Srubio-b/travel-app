"use client";

import { useEffect, useRef, useState } from "react";

type AmbientVideoProps = {
  src: string;
  className?: string;
};

/**
 * Ambient loop video: plays muted and infinite, and fades in ONLY when it is
 * actually playing — no flash of a dead frame. Reduced-motion users never see
 * playback; whatever static surface is behind it stays in charge.
 */
export function AmbientVideo({ src, className }: AmbientVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {
      // Autoplay policies or a transient failure: keep it hidden.
    });
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      onPlaying={() => setPlaying(true)}
      className={`${className ?? ""} transition-opacity duration-[560ms] ease-out-expo ${
        playing ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
