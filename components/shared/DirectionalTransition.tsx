import { ViewTransition } from "react";
import type { ReactNode } from "react";

/**
 * Type-keyed page transition — directional slides for hierarchical navigation
 * (catalog → detail). Fires only when a navigation is tagged with a
 * transitionType; everything else stays static (`default: "none"`).
 */
export function DirectionalTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      exit={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
