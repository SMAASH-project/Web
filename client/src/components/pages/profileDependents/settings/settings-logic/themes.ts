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
    name: "Gummy",
    colorLeft: "#000000",
    colorMiddle: "#314438",
    colorRight: "#563e3e",
  },
  {
    name: "Coral",
    colorLeft: "#764627",
    colorMiddle: "#6e1670",
    colorRight: "#2b4c78",
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
