import { useState, useEffect } from "react";

/**
 * A hook that listens to a CSS media query and returns whether it matches.
 * @param query - A valid CSS media query string, e.g. "(min-width: 768px)"
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);

    const handler = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
