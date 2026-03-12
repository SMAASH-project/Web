import { type ReactNode, useState, useEffect } from "react";
import { ColorContext } from "./ColorContext";

export function ColorProvider({ children }: { children: ReactNode }) {
  const STORAGE_KEY = "color-settings";
  const defaults = {
    colorLeft: "#616161",
    colorMiddle: "#000000",
    colorRight: "#616161",
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
      };
    } catch {
      return defaults;
    }
  })();

  const [colorLeft, setColorLeft] = useState(initial.colorLeft);
  const [colorMiddle, setColorMiddle] = useState(initial.colorMiddle);
  const [colorRight, setColorRight] = useState(initial.colorRight);

  // Persist changes to localStorage across sessions
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const payload = JSON.stringify({ colorLeft, colorMiddle, colorRight });
      localStorage.setItem(STORAGE_KEY, payload);
    } catch {
      // ignore write errors
    }
  }, [colorLeft, colorMiddle, colorRight]);

  return (
    <ColorContext.Provider
      value={{
        colorLeft,
        colorMiddle,
        colorRight,
        setColorLeft,
        setColorMiddle,
        setColorRight,
      }}
    >
      {children}
    </ColorContext.Provider>
  );
}
