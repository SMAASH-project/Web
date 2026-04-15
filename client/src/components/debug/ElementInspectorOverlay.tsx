import { useCallback, useEffect, useRef, useState } from "react";
import { useDebugSettings } from "@/hooks/useDebugSettings";
import { useSettings } from "@/pages/settings/SettingsContext";
import { getBackgroundClasses } from "@/lib/utils";
import { CARD_H, CARD_OFFSET, CARD_W, INSPECTOR_PROPS } from "./debugShared";
import type { HoverTarget, InspectorProp } from "./debugShared";

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
        css[prop] = cs.getPropertyValue(prop.replace(/([A-Z])/g, "-$1").toLowerCase());
      }

      const layers = debug.zIndexInspector
        ? document
            .elementsFromPoint(e.clientX, e.clientY)
            .filter((n) => !overlayRef.current?.contains(n))
            .slice(0, 6)
            .map((n) => {
              const style = window.getComputedStyle(n);
              const klass = n.classList.length > 0 ? `.${Array.from(n.classList)[0]}` : "";
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
      className="pointer-events-none fixed z-9999"
      style={{ left, top }}
    >
      <div className={`flex w-60 flex-col gap-1.5 rounded-xl p-3 ${cardBg}`}>
        <div className={`flex items-baseline gap-1.5 border-b ${divider} pb-1.5`}>
          <span className={`font-mono text-[11px] font-bold ${tagColor}`}>
            &lt;{target.tag}&gt;
          </span>
          {target.id && (
            <span className={`font-mono text-[10px] ${idColor} truncate`}>#{target.id}</span>
          )}
        </div>
        {target.classes.length > 0 && (
          <div className={`flex flex-wrap gap-1 border-b ${divider} pb-1.5`}>
            {target.classes.map((c) => (
              <span
                key={c}
                className={`max-w-40 truncate rounded px-1 py-0.5 font-mono text-[9px] ${badgeStyle}`}
              >
                .{c}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          {INSPECTOR_PROPS.map((prop) => (
            <div key={prop} className="flex items-baseline justify-between gap-2">
              <span className={`shrink-0 text-[9px] ${propLabel}`}>
                {prop.replace(/([A-Z])/g, "-$1").toLowerCase()}
              </span>
              <span className={`max-w-30 truncate text-right font-mono text-[9px] ${propValue}`}>
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
                className={`font-mono text-[9px] ${target.clickTargetPass ? "text-green-400" : "text-amber-400"}`}
              >
                {target.width}×{target.height}px {target.clickTargetPass ? "✓" : "<44"}
              </span>
            </div>
          </div>
        )}

        {debug.zIndexInspector && target.layers.length > 0 && (
          <div className={`border-t ${divider} flex flex-col gap-1 pt-1.5`}>
            <span className={`text-[9px] ${propLabel}`}>z-stack</span>
            {target.layers.map((layer, idx) => (
              <div
                key={`${layer.label}-${idx}`}
                className="flex items-center justify-between gap-2"
              >
                <span className={`truncate text-[9px] ${propValue}`}>{layer.label}</span>
                <span className={`shrink-0 font-mono text-[9px] ${propLabel}`}>{layer.z}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
