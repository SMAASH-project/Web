import { createContext } from "react";

export interface ColorContextType {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  setColorLeft: (color: string) => void;
  setColorMiddle: (color: string) => void;
  setColorRight: (color: string) => void;
}

export const ColorContext = createContext<ColorContextType | undefined>(
  undefined,
);
