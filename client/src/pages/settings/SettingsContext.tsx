import React, { createContext, useContext, useState, useEffect } from "react";
import i18n from "@/lib/i18n";
import { type AnimationKey } from "@/lib/animationTypes";

export type Language = "en" | "hu";

// null  = use the theme's own animationKey (default)
// 'none' = force no animation even if theme has one
// AnimationKey = force a specific animation regardless of theme
export type AnimationOverride = AnimationKey | "none" | null;

export interface SettingsState {
  useAnimations: boolean;
  useLiquidGlass: boolean;
  useDarkMode: boolean;
  language: Language;
  animationOverride: AnimationOverride;
}

interface SettingsContextType {
  settings: SettingsState;
  updateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(() => {
    const saved = localStorage.getItem("settings");
    const parsed = saved ? JSON.parse(saved) : null;
    return {
      useAnimations: parsed?.useAnimations ?? true,
      useLiquidGlass: parsed?.useLiquidGlass ?? true,
      useDarkMode: parsed?.useDarkMode ?? false,
      language: parsed?.language ?? "en",
      animationOverride: (parsed?.animationOverride ??
        null) as AnimationOverride,
    };
  });

  // Persist to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  // Keep i18next in sync with the stored language on mount and on change
  useEffect(() => {
    if (i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language]);

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}
