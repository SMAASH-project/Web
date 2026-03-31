import { useState, useEffect } from "react";

export interface DebugSettings {
  animationSpeed: number;        // 0.25 | 0.5 | 1 | 2 | 4
  noBackdropBlur: boolean;
  layoutBorders: boolean;
  navbarOverride: "auto" | "show" | "hide";
  showFps: boolean;
  showScrollPos: boolean;
  elementInspector: boolean;
}

const KEY = "debug-settings";
const DEFAULTS: DebugSettings = {
  animationSpeed: 1,
  noBackdropBlur: false,
  layoutBorders: false,
  navbarOverride: "auto",
  showFps: false,
  showScrollPos: false,
  elementInspector: false,
};

export function getDebugSettings(): DebugSettings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return { ...DEFAULTS };
  }
}

export function useDebugSettings() {
  const [settings, setSettings] = useState<DebugSettings>(getDebugSettings);

  const update = (patch: Partial<DebugSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("debug-settings", { detail: next }));
  };

  useEffect(() => {
    const h = (e: Event) => setSettings((e as CustomEvent<DebugSettings>).detail);
    window.addEventListener("debug-settings", h);
    return () => window.removeEventListener("debug-settings", h);
  }, []);

  return { settings, update };
}
