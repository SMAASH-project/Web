import { type ColorContextType } from "./color/ColorContext";

export interface Theme {
  name: string;
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
}

export const THEMES: Theme[] = [
  {
    name: "Azure",
    colorLeft: "#375867",
    colorMiddle: "#1c6973",
    colorRight: "#4f6e7d",
  },
  {
    name: "Slate",
    colorLeft: "#1e293b",
    colorMiddle: "#0f172a",
    colorRight: "#334155",
  },
  {
    name: "Emerald",
    colorLeft: "#065f46",
    colorMiddle: "#047857",
    colorRight: "#10b981",
  },
  {
    name: "Amethyst",
    colorLeft: "#6b21a8",
    colorMiddle: "#9333ea",
    colorRight: "#a855f7",
  },
  {
    name: "Coral",
    colorLeft: "#764627",
    colorMiddle: "#6e1670",
    colorRight: "#2b4c78",
  },
  {
    name: "Sunset",
    colorLeft: "#ff7e5f",
    colorMiddle: "#feb47b",
    colorRight: "#ff6a88",
  },
  {
    name: "Ocean",
    colorLeft: "#2e3192",
    colorMiddle: "#1bffff",
    colorRight: "#1e9600",
  },
  {
    name: "Lavender",
    colorLeft: "#b497bd",
    colorMiddle: "#c9a0dc",
    colorRight: "#d8b4fe",
  },
  {
    name: "Midnight",
    colorLeft: "#232526",
    colorMiddle: "#414345",
    colorRight: "#000000",
  },
  {
    name: "Fire",
    colorLeft: "#f12711",
    colorMiddle: "#f5af19",
    colorRight: "#f12711",
  },
  {
    name: "Aurora",
    colorLeft: "#0f766e",
    colorMiddle: "#22d3ee",
    colorRight: "#a3e635",
  },
  {
    name: "Neon Noir",
    colorLeft: "#0b1020",
    colorMiddle: "#7c3aed",
    colorRight: "#06b6d4",
  },
  {
    name: "Rose Gold",
    colorLeft: "#7c2d5a",
    colorMiddle: "#d977a8",
    colorRight: "#f5c2a6",
  },
];

export const applyTheme = (
  theme: Theme,
  context: ColorContextType | undefined,
) => {
  if (context) {
    context.setColorLeft(theme.colorLeft);
    context.setColorMiddle(theme.colorMiddle);
    context.setColorRight(theme.colorRight);
  }
};
