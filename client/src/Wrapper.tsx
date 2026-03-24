import { useContext } from "react";
import { ColorContext } from "./components/pages/profileDependents/settings/settingsLogic/color/ColorContext";
import { useSettings } from "./components/pages/profileDependents/settings/settingsLogic/SettingsContext";
import {
  getAverageHexColor,
  getTextColor,
  lightenHexColor,
  toRgbaColor,
} from "./lib/utils";

import { type AnimationKey } from "@/lib/animationTypes";
import { AnimatedBackground } from "./directory/AnimatedBackground";

interface WrapperProps {
  children: React.ReactNode;
}

export function Wrapper({ children }: WrapperProps) {
  const context = useContext(ColorContext);
  const { settings } = useSettings();

  const colorLeft = context?.colorLeft || "#616161";
  const colorMiddle = context?.colorMiddle || "#000000";
  const colorRight = context?.colorRight || "#616161";

  const currentGradient = `linear-gradient(to right, ${colorLeft}, ${colorMiddle}, ${colorRight})`;
  const themeAverage = getAverageHexColor([colorLeft, colorMiddle, colorRight]);
  const themeAccent = lightenHexColor(
    themeAverage,
    settings.useDarkMode ? 0.08 : 0.02,
  );
  const themeAccentHover = lightenHexColor(
    themeAverage,
    settings.useDarkMode ? 0.22 : 0.14,
  );
  const themeAccentSoft = toRgbaColor(
    themeAverage,
    settings.useDarkMode ? 0.32 : 0.25,
  );
  const themeNavBorder = themeAverage;
  const themeNavShadow = toRgbaColor(
    lightenHexColor(themeAverage, settings.useDarkMode ? 0.25 : 0.16),
    settings.useDarkMode ? 0.42 : 0.34,
  );

  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);

  // Resolve which animation to show:
  //   animationOverride === null    → use the theme's animationKey
  //   animationOverride === 'none'  → no animation
  //   animationOverride === <key>   → use that specific animation
  let resolvedAnimation: AnimationKey | null = null;
  if (settings.useAnimations) {
    if (settings.animationOverride === null) {
      resolvedAnimation = context?.animationKey ?? null;
    } else if (settings.animationOverride !== "none") {
      resolvedAnimation = settings.animationOverride as AnimationKey;
    }
  }

  return (
    <div
      className={`${textColor} w-screen min-h-screen absolute top-0 left-0 flex items-center justify-center transition-[background-image] duration-600 ease-in-out`}
      style={{
        backgroundImage: currentGradient,
        ["--theme-accent" as string]: themeAccent,
        ["--theme-accent-hover" as string]: themeAccentHover,
        ["--theme-accent-soft" as string]: themeAccentSoft,
        ["--theme-nav-border" as string]: themeNavBorder,
        ["--theme-nav-shadow" as string]: themeNavShadow,
      }}
    >
      {resolvedAnimation && (
        <AnimatedBackground
          animationKey={resolvedAnimation}
          colorLeft={colorLeft}
          colorMiddle={colorMiddle}
          colorRight={colorRight}
        />
      )}
      {children}
    </div>
  );
}
