import { createContext } from "react";
import { type AnimationKey } from "@/lib/animationTypes";

export interface ColorContextType {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  animationKey: AnimationKey | null;
  setColorLeft: (color: string) => void;
  setColorMiddle: (color: string) => void;
  setColorRight: (color: string) => void;
  setAnimationKey: (key: AnimationKey | null) => void;
}

export const ColorContext = createContext<ColorContextType | undefined>(
  undefined,
);
