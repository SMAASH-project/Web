import { type ReactNode, useState, useEffect } from "react";
import { ColorContext, type CustomTheme } from "./ColorContext";
import { type AnimationKey, type EffectLayerConfig } from "@/lib/animationTypes";

export function ColorProvider({ children }: { children: ReactNode }) {
  const STORAGE_KEY = "color-settings";
  const defaults = {
    colorLeft: "#616161",
    colorMiddle: "#000000",
    colorRight: "#616161",
    animationKey: null as AnimationKey | null,
    effectMix: null as EffectLayerConfig | null,
    customTheme: null as CustomTheme | null,
  };

  // Lazy initializer reads localStorage synchronously on first render
  const initial = (() => {
    try {
      if (typeof window === "undefined") return defaults;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      return {
        colorLeft: parsed?.colorLeft ?? defaults.colorLeft,
        colorMiddle: parsed?.colorMiddle ?? defaults.colorMiddle,
        colorRight: parsed?.colorRight ?? defaults.colorRight,
        animationKey: (parsed?.animationKey ?? null) as AnimationKey | null,
        effectMix: (parsed?.effectMix ?? null) as EffectLayerConfig | null,
        customTheme: (parsed?.customTheme ?? null) as CustomTheme | null,
      };
    } catch {
      return defaults;
    }
  })();

  const [colorLeft, setColorLeft] = useState(initial.colorLeft);
  const [colorMiddle, setColorMiddle] = useState(initial.colorMiddle);
  const [colorRight, setColorRight] = useState(initial.colorRight);
  const [animationKey, setAnimationKey] = useState<AnimationKey | null>(
    initial.animationKey,
  );
  const [effectMix, setEffectMix] = useState<EffectLayerConfig | null>(
    initial.effectMix,
  );
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(
    initial.customTheme,
  );

  // Persist changes to localStorage across sessions
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const payload = JSON.stringify({
        colorLeft,
        colorMiddle,
        colorRight,
        animationKey,
        effectMix,
        customTheme,
      });
      localStorage.setItem(STORAGE_KEY, payload);
    } catch {
      // ignore write errors
    }
  }, [colorLeft, colorMiddle, colorRight, animationKey, effectMix, customTheme]);

  return (
    <ColorContext.Provider
      value={{
        colorLeft,
        colorMiddle,
        colorRight,
        animationKey,
        effectMix,
        customTheme,
        setColorLeft,
        setColorMiddle,
        setColorRight,
        setAnimationKey,
        setEffectMix,
        setCustomTheme,
      }}
    >
      {children}
    </ColorContext.Provider>
  );
}
