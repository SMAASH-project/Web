import { createContext } from "react";
import { type AnimationKey, type EffectLayerConfig } from "@/lib/animationTypes";

export interface CustomTheme {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
}

export interface ColorContextType {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  animationKey: AnimationKey | null;
  effectMix: EffectLayerConfig | null;
  customTheme: CustomTheme | null;
  setColorLeft: (color: string) => void;
  setColorMiddle: (color: string) => void;
  setColorRight: (color: string) => void;
  setAnimationKey: (key: AnimationKey | null) => void;
  setEffectMix: (mix: EffectLayerConfig | null) => void;
  setCustomTheme: (theme: CustomTheme | null) => void;
}

export const ColorContext = createContext<ColorContextType | undefined>(
  undefined,
);
