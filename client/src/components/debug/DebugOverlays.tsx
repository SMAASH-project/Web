import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDebugSettings } from "@/hooks/useDebugSettings";
import { useSettings } from "@/pages/settings/SettingsContext";
import { ColorContext } from "@/pages/settings/ColorContext";
import { getAverageHexColor, getBackgroundClasses } from "@/lib/utils";

const INSPECTOR_PROPS = [
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

type InspectorProp = (typeof INSPECTOR_PROPS)[number];

interface HoverTarget {
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

const CARD_W = 240;
const CARD_H = 300;
const CARD_OFFSET = 14;

function hexLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

const SPEED_TO_CSS: Record<number, number> = {
  0.25: 3,
  0.5: 1.5,
  2: 0.075,
  4: 0.03,
};

let restoreViewportOverride: null | (() => void) = null;

function evaluateMediaQueryForViewport(
  query: string,
  width: number,
  height: number,
): boolean {
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

function applyViewportOverride(width: number, height: number) {
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
      onchange: null as
        | ((this: MediaQueryList, ev: MediaQueryListEvent) => any)
        | null,
      addEventListener: (
        type: string,
        listener: EventListenerOrEventListenerObject,
      ) => {
        if (type !== "change") return;
        if (typeof listener === "function") {
          listeners.add(listener as (e: MediaQueryListEvent) => void);
        }
      },
      removeEventListener: (
        type: string,
        listener: EventListenerOrEventListenerObject,
      ) => {
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

export function DebugEffects() {
  const { settings } = useDebugSettings();
  const colorCtx = useContext(ColorContext);
  const colorLeft = colorCtx?.colorLeft ?? "#616161";
  const colorMiddle = colorCtx?.colorMiddle ?? "#000000";
  const colorRight = colorCtx?.colorRight ?? "#616161";

  useEffect(() => {
    document.body.classList.toggle(
      "debug-reduced-motion",
      settings.forceReducedMotion,
    );
  }, [settings.forceReducedMotion]);

  useEffect(() => {
    document.body.classList.toggle("debug-compact", settings.compactDensity);
  }, [settings.compactDensity]);

  useEffect(() => {
    document.body.classList.toggle(
      "debug-safe-area",
      settings.safeAreaOutlines,
    );
  }, [settings.safeAreaOutlines]);

  useEffect(() => {
    if (!settings.forceViewportEnabled) {
      if (restoreViewportOverride) {
        restoreViewportOverride();
        restoreViewportOverride = null;
      }
      return;
    }

    const w = Math.max(320, Math.round(settings.forceViewportWidth || 1280));
    const h = Math.max(320, Math.round(settings.forceViewportHeight || 720));
    applyViewportOverride(w, h);

    return () => {
      if (!settings.forceViewportEnabled && restoreViewportOverride) {
        restoreViewportOverride();
        restoreViewportOverride = null;
      }
    };
  }, [
    settings.forceViewportEnabled,
    settings.forceViewportWidth,
    settings.forceViewportHeight,
  ]);

  useEffect(() => {
    return () => {
      if (restoreViewportOverride) {
        restoreViewportOverride();
        restoreViewportOverride = null;
      }
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("debug-no-blur", settings.noBackdropBlur);
  }, [settings.noBackdropBlur]);

  useEffect(() => {
    document.body.classList.toggle("debug-layout", settings.layoutBorders);
    if (!settings.layoutBorders) return;
    const avg = getAverageHexColor([colorLeft, colorMiddle, colorRight]);
    const lum = hexLuminance(avg);
    // High luminance (light background) → dark indigo outline; dark background → bright cyan
    const color =
      lum > 0.45
        ? "rgba(67, 56, 202, 0.80)" // indigo-700 — contrasts on light
        : "rgba(34, 211, 238, 0.75)"; // cyan-400   — contrasts on dark
    document.documentElement.style.setProperty("--debug-layout-color", color);
  }, [settings.layoutBorders, colorLeft, colorMiddle, colorRight]);

  useEffect(() => {
    const tag = document.getElementById("debug-speed");
    const duration = SPEED_TO_CSS[settings.animationSpeed];
    if (!duration) {
      tag?.remove();
      return;
    }
    const style = tag ?? document.createElement("style");
    style.id = "debug-speed";
    style.textContent = `* { transition-duration: ${duration}s !important; }`;
    if (!tag) document.head.appendChild(style);
  }, [settings.animationSpeed]);

  return null;
}

export function DebugOverlay() {
  const { settings } = useDebugSettings();
  const [fps, setFps] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const lastTime = useRef<number>(performance.now());
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!settings.showFps) return;
    const loop = (now: number) => {
      const delta = now - lastTime.current;
      if (delta > 0) setFps(Math.round(1000 / delta));
      lastTime.current = now;
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [settings.showFps]);

  useEffect(() => {
    if (!settings.showScrollPos) return;
    const onScroll = () => setScrollY(Math.round(window.scrollY));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [settings.showScrollPos]);

  if (!settings.showFps && !settings.showScrollPos) return null;

  return (
    <div className="fixed bottom-4 left-4 z-9999 flex flex-col gap-1.5 pointer-events-none">
      {settings.showFps && fps !== null && (
        <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full backdrop-blur-md bg-black/50 text-green-400">
          {fps} fps
        </span>
      )}
      {settings.showScrollPos && (
        <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full backdrop-blur-md bg-black/50 text-blue-400">
          Y: {scrollY}px
        </span>
      )}
    </div>
  );
}

export function BreakpointOverlay() {
  const { settings } = useDebugSettings();
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    if (!settings.showBreakpointBadge) return;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [settings.showBreakpointBadge]);

  if (!settings.showBreakpointBadge) return null;

  const label =
    width >= 1536
      ? "2xl"
      : width >= 1280
        ? "xl"
        : width >= 1024
          ? "lg"
          : width >= 768
            ? "md"
            : width >= 640
              ? "sm"
              : "xs";

  return (
    <div className="fixed bottom-4 right-4 z-9999 pointer-events-none">
      <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full backdrop-blur-md bg-black/50 text-violet-300">
        {label} · {width}px
      </span>
    </div>
  );
}

export function ElementInspectorOverlay() {
  const { settings: debug } = useDebugSettings();
  const { settings } = useSettings();
  const { useLiquidGlass, useDarkMode } = settings;
  const overlayRef = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<HoverTarget | null>(null);

  // ── Theme-aware style tokens ───────────────────────────────────────────────
  const cardBg = getBackgroundClasses(useLiquidGlass, useDarkMode, "strong");
  const tagColor = useLiquidGlass
    ? useDarkMode
      ? "text-violet-300"
      : "text-violet-200"
    : useDarkMode
      ? "text-violet-400"
      : "text-violet-700";
  const idColor = useLiquidGlass
    ? useDarkMode
      ? "text-amber-300"
      : "text-amber-200"
    : useDarkMode
      ? "text-amber-400"
      : "text-amber-700";
  const badgeStyle = useLiquidGlass
    ? useDarkMode
      ? "bg-white/10 text-white/70"
      : "bg-white/20 text-white/80"
    : useDarkMode
      ? "bg-white/10 text-gray-300"
      : "bg-gray-100 text-gray-600";
  const divider = useLiquidGlass
    ? useDarkMode
      ? "border-white/10"
      : "border-white/25"
    : useDarkMode
      ? "border-gray-700"
      : "border-gray-200";
  const propLabel = useLiquidGlass
    ? useDarkMode
      ? "text-white/40"
      : "text-white/50"
    : useDarkMode
      ? "text-gray-500"
      : "text-gray-400";
  const propValue = useLiquidGlass
    ? useDarkMode
      ? "text-white/80"
      : "text-white/90"
    : useDarkMode
      ? "text-gray-100"
      : "text-gray-800";

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const el = e.target as Element;
      if (overlayRef.current?.contains(el) || el === overlayRef.current) return;

      const cs = window.getComputedStyle(el);
      const rect = (el as HTMLElement).getBoundingClientRect();
      const css = {} as Record<InspectorProp, string>;
      for (const prop of INSPECTOR_PROPS) {
        css[prop] = cs.getPropertyValue(
          prop.replace(/([A-Z])/g, "-$1").toLowerCase(),
        );
      }

      const layers = debug.zIndexInspector
        ? document
            .elementsFromPoint(e.clientX, e.clientY)
            .filter((n) => !overlayRef.current?.contains(n))
            .slice(0, 6)
            .map((n) => {
              const style = window.getComputedStyle(n);
              const klass =
                n.classList.length > 0 ? `.${Array.from(n.classList)[0]}` : "";
              return {
                label: `${n.tagName.toLowerCase()}${n.id ? `#${n.id}` : ""}${klass}`,
                z: style.zIndex || "auto",
              };
            })
        : [];

      setTarget({
        tag: el.tagName.toLowerCase(),
        id: el.id,
        classes: Array.from(el.classList).slice(0, 6),
        css,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        clickTargetPass: rect.width >= 44 && rect.height >= 44,
        layers,
        x: e.clientX,
        y: e.clientY,
      });
    },
    [debug.zIndexInspector],
  );

  const handleMouseLeave = useCallback(() => setTarget(null), []);

  useEffect(() => {
    if (!debug.elementInspector) {
      setTarget(null);
      return;
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [debug.elementInspector, handleMouseMove, handleMouseLeave]);

  if (!debug.elementInspector || !target) return null;

  const flipX = target.x + CARD_OFFSET + CARD_W > window.innerWidth;
  const flipY = target.y + CARD_OFFSET + CARD_H > window.innerHeight;
  const left = flipX ? target.x - CARD_W - CARD_OFFSET : target.x + CARD_OFFSET;
  const top = flipY ? target.y - CARD_H - CARD_OFFSET : target.y + CARD_OFFSET;

  return (
    <div
      ref={overlayRef}
      data-element-inspector="true"
      className="fixed z-9999 pointer-events-none"
      style={{ left, top }}
    >
      <div className={`rounded-xl p-3 w-60 flex flex-col gap-1.5 ${cardBg}`}>
        <div
          className={`flex items-baseline gap-1.5 border-b ${divider} pb-1.5`}
        >
          <span className={`text-[11px] font-mono font-bold ${tagColor}`}>
            &lt;{target.tag}&gt;
          </span>
          {target.id && (
            <span className={`text-[10px] font-mono ${idColor} truncate`}>
              #{target.id}
            </span>
          )}
        </div>
        {target.classes.length > 0 && (
          <div className={`flex flex-wrap gap-1 border-b ${divider} pb-1.5`}>
            {target.classes.map((c) => (
              <span
                key={c}
                className={`text-[9px] font-mono px-1 py-0.5 rounded truncate max-w-40 ${badgeStyle}`}
              >
                .{c}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          {INSPECTOR_PROPS.map((prop) => (
            <div
              key={prop}
              className="flex justify-between gap-2 items-baseline"
            >
              <span className={`text-[9px] shrink-0 ${propLabel}`}>
                {prop.replace(/([A-Z])/g, "-$1").toLowerCase()}
              </span>
              <span
                className={`text-[9px] font-mono truncate text-right max-w-30 ${propValue}`}
              >
                {target.css[prop] || "—"}
              </span>
            </div>
          ))}
        </div>

        {debug.clickTargetChecker && (
          <div className={`border-t ${divider} pt-1.5`}>
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[9px] ${propLabel}`}>click target</span>
              <span
                className={`text-[9px] font-mono ${target.clickTargetPass ? "text-green-400" : "text-amber-400"}`}
              >
                {target.width}×{target.height}px{" "}
                {target.clickTargetPass ? "✓" : "<44"}
              </span>
            </div>
          </div>
        )}

        {debug.zIndexInspector && target.layers.length > 0 && (
          <div className={`border-t ${divider} pt-1.5 flex flex-col gap-1`}>
            <span className={`text-[9px] ${propLabel}`}>z-stack</span>
            {target.layers.map((layer, idx) => (
              <div
                key={`${layer.label}-${idx}`}
                className="flex items-center justify-between gap-2"
              >
                <span className={`text-[9px] truncate ${propValue}`}>
                  {layer.label}
                </span>
                <span className={`text-[9px] font-mono shrink-0 ${propLabel}`}>
                  {layer.z}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
