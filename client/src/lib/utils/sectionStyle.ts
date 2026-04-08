import type { CSSProperties } from "react";

/**
 * Returns inline styles that fade + slide a content section in once
 * `animReady` flips to true.
 *
 * While `animReady` is false the section renders at opacity 0 / translateY 10px
 * so the browser skips compositing it during the card entry spring animation.
 * That's the main perf win — the card is an invisible shell while scaling up.
 *
 * Once the card spring completes, `animReady` flips true and each section
 * fades in with a 200 ms CSS transition, staggered by `delayMs`.
 */
export function sectionStyle(animReady: boolean, delayMs: number): CSSProperties {
  return {
    opacity: animReady ? 1 : 0,
    transform: animReady ? "translateY(0px)" : "translateY(10px)",
    transition: animReady
      ? `opacity 200ms ease-out ${delayMs}ms, transform 200ms ease-out ${delayMs}ms`
      : "none",
    willChange: "opacity, transform",
  };
}
