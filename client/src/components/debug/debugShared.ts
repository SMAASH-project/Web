export const INSPECTOR_PROPS = [
  "display",
  "position",
  "width",
  "height",
  "color",
  "backgroundColor",
  "fontSize",
  "fontWeight",
  "zIndex",
  "opacity",
  "borderRadius",
] as const;

export type InspectorProp = (typeof INSPECTOR_PROPS)[number];

export interface HoverTarget {
  tag: string;
  id: string;
  classes: string[];
  css: Record<InspectorProp, string>;
  width: number;
  height: number;
  clickTargetPass: boolean;
  layers: Array<{ label: string; z: string }>;
  x: number;
  y: number;
}

export const CARD_W = 240;
export const CARD_H = 300;
export const CARD_OFFSET = 14;

export const SPEED_TO_CSS: Record<number, number> = {
  0.25: 3,
  0.5: 1.5,
  2: 0.075,
  4: 0.03,
};

export function hexLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

let restoreViewportOverride: null | (() => void) = null;

function evaluateMediaQueryForViewport(query: string, width: number, height: number): boolean {
  const q = query.toLowerCase();

  for (const m of q.matchAll(/min-width\s*:\s*(\d+)px/g)) {
    if (width < Number(m[1])) return false;
  }
  for (const m of q.matchAll(/max-width\s*:\s*(\d+)px/g)) {
    if (width > Number(m[1])) return false;
  }
  for (const m of q.matchAll(/min-height\s*:\s*(\d+)px/g)) {
    if (height < Number(m[1])) return false;
  }
  for (const m of q.matchAll(/max-height\s*:\s*(\d+)px/g)) {
    if (height > Number(m[1])) return false;
  }

  if (q.includes("orientation: portrait") && width > height) return false;
  if (q.includes("orientation: landscape") && width < height) return false;

  return true;
}

export function applyViewportOverride(width: number, height: number) {
  if (restoreViewportOverride) restoreViewportOverride();

  const restoreFns: Array<() => void> = [];
  const patchWindowDimension = (
    key: "innerWidth" | "innerHeight" | "outerWidth" | "outerHeight",
    value: number,
  ) => {
    const original = Object.getOwnPropertyDescriptor(window, key);
    Object.defineProperty(window, key, {
      configurable: true,
      get: () => value,
    });
    restoreFns.push(() => {
      if (original) Object.defineProperty(window, key, original);
      else delete (window as unknown as Record<string, unknown>)[key];
    });
  };

  patchWindowDimension("innerWidth", width);
  patchWindowDimension("innerHeight", height);
  patchWindowDimension("outerWidth", width);
  patchWindowDimension("outerHeight", height);

  const originalMatchMedia = window.matchMedia.bind(window);
  window.matchMedia = ((query: string) => {
    const listeners = new Set<(e: MediaQueryListEvent) => void>();
    const matches = evaluateMediaQueryForViewport(query, width, height);

    const mql = {
      media: query,
      matches,
      onchange: null as ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null,
      addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
        if (type !== "change") return;
        if (typeof listener === "function") {
          listeners.add(listener as (e: MediaQueryListEvent) => void);
        }
      },
      removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
        if (type !== "change") return;
        if (typeof listener === "function") {
          listeners.delete(listener as (e: MediaQueryListEvent) => void);
        }
      },
      addListener: (listener: (e: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
      removeListener: (listener: (e: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
      dispatchEvent: () => true,
    } as MediaQueryList;

    return mql;
  }) as typeof window.matchMedia;

  restoreFns.push(() => {
    window.matchMedia = originalMatchMedia;
  });

  window.dispatchEvent(new Event("resize"));
  window.dispatchEvent(new CustomEvent("viewport-override"));

  restoreViewportOverride = () => {
    for (const fn of restoreFns.reverse()) fn();
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new CustomEvent("viewport-override"));
  };
}

export function clearViewportOverride() {
  if (restoreViewportOverride) {
    restoreViewportOverride();
    restoreViewportOverride = null;
  }
}
