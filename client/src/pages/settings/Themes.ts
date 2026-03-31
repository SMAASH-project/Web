import { type ColorContextType } from "./ColorContext";
import { type AnimationKey } from "@/lib/animationTypes";

export interface Theme {
  name: string;
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  animationKey?: AnimationKey;
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
    animationKey: "storm",
  },
  {
    name: "Emerald",
    colorLeft: "#065f46",
    colorMiddle: "#047857",
    colorRight: "#10b981",
    animationKey: "sakura",
  },
  {
    name: "Amethyst",
    colorLeft: "#6b21a8",
    colorMiddle: "#9333ea",
    colorRight: "#a855f7",
    animationKey: "lavalamp",
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
    animationKey: "sakura",
  },
  {
    name: "Ocean",
    colorLeft: "#2e3192",
    colorMiddle: "#1bffff",
    colorRight: "#1e9600",
    animationKey: "fishtank",
  },
  {
    name: "Lavender",
    colorLeft: "#b497bd",
    colorMiddle: "#c9a0dc",
    colorRight: "#d8b4fe",
    animationKey: "aurora",
  },
  {
    name: "Midnight",
    colorLeft: "#232526",
    colorMiddle: "#414345",
    colorRight: "#000000",
    animationKey: "deepspace",
  },
  {
    name: "Fire",
    colorLeft: "#f12711",
    colorMiddle: "#f5af19",
    colorRight: "#f12711",
    animationKey: "lavalamp",
  },
  {
    name: "Aurora",
    colorLeft: "#0f766e",
    colorMiddle: "#22d3ee",
    colorRight: "#a3e635",
    animationKey: "aurora",
  },
  {
    name: "Neon Noir",
    colorLeft: "#0b1020",
    colorMiddle: "#7c3aed",
    colorRight: "#06b6d4",
    animationKey: "synthwave",
  },
  {
    name: "Rose Gold",
    colorLeft: "#7c2d5a",
    colorMiddle: "#d977a8",
    colorRight: "#f5c2a6",
    animationKey: "sakura",
  },
  {
    name: "Monsoon",
    colorLeft: "#1a2a3a",
    colorMiddle: "#2d4a6a",
    colorRight: "#4a7a9b",
    animationKey: "puddleripples",
  },
  {
    name: "Nebula",
    colorLeft: "#1a1040",
    colorMiddle: "#6d28d9",
    colorRight: "#06b6d4",
    animationKey: "particleweb",
  },
  {
    name: "Abyss",
    colorLeft: "#000d1a",
    colorMiddle: "#001a2e",
    colorRight: "#003322",
    animationKey: "bioluminescence",
  },
  {
    name: "Starmap",
    colorLeft: "#050510",
    colorMiddle: "#0a0a20",
    colorRight: "#10103a",
    animationKey: "constellation",
  },
  {
    name: "Void",
    colorLeft: "#000a12",
    colorMiddle: "#00121f",
    colorRight: "#001a10",
    animationKey: "void",
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
    context.setAnimationKey(theme.animationKey ?? null);
  }
};
