import React, { createContext, useContext, useState, useEffect } from "react";

interface SettingsState {
  useAnimations: boolean;
  useLiquidGlass: boolean;
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
    return saved
      ? JSON.parse(saved)
      : {
          useAnimations: true,
          useLiquidGlass: true,
        };
  });

  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

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
