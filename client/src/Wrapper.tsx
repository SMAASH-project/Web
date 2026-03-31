import { useContext, useMemo } from "react";
import { ColorContext } from "@/pages/settings/ColorContext";
import { useSettings } from "@/pages/settings/SettingsContext";
import {
  getAverageHexColor,
  getTextColor,
  lightenHexColor,
  toRgbaColor,
} from "./lib/utils";

import { type AnimationKey, hasEnabledEffects } from "@/lib/animationTypes";
import { AnimatedBackground } from "@/backgrounds/AnimatedBackground";
import { CompositeBackground } from "@/backgrounds/CompositeBackground";

interface WrapperProps {
  children: React.ReactNode;
}

export function Wrapper({ children }: WrapperProps) {
  const context = useContext(ColorContext);
  const { settings } = useSettings();

  const colorLeft = context?.colorLeft || "#616161";
  const colorMiddle = context?.colorMiddle || "#000000";
  const colorRight = context?.colorRight || "#616161";

  // Memoised — only recompute when the three gradient colours or darkMode change
  const { currentGradient, cssVars } = useMemo(() => {
    const themeAverage = getAverageHexColor([
      colorLeft,
      colorMiddle,
      colorRight,
    ]);
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
    return {
      currentGradient: `linear-gradient(to right, ${colorLeft}, ${colorMiddle}, ${colorRight})`,
      cssVars: {
        ["--theme-accent" as string]: themeAccent,
        ["--theme-accent-hover" as string]: themeAccentHover,
        ["--theme-accent-soft" as string]: themeAccentSoft,
        ["--theme-nav-border" as string]: themeNavBorder,
        ["--theme-nav-shadow" as string]: themeNavShadow,
      },
    };
  }, [colorLeft, colorMiddle, colorRight, settings.useDarkMode]);

  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);

  // Resolve which animation to show.
  // We always resolve (even when useAnimations is false) so the static
  // background still renders. paused={true} freezes it.
  //   animationOverride === null    → use the theme's animationKey
  //   animationOverride === 'none'  → no background at all
  //   animationOverride === <key>   → pin to that animation
  let resolvedAnimation: AnimationKey | null = null;
  if (settings.animationOverride === null) {
    resolvedAnimation = context?.animationKey ?? null;
  } else if (
    settings.animationOverride !== "none" &&
    settings.animationOverride !== "custom"
  ) {
    resolvedAnimation = settings.animationOverride as AnimationKey;
  }

  const effectMix = context?.effectMix ?? null;
  const useComposite =
    settings.animationOverride === "custom" &&
    effectMix !== null &&
    hasEnabledEffects(effectMix);

  return (
    <div
      className={`${textColor} w-screen min-h-screen absolute top-0 left-0 flex items-center justify-center transition-[background-image] duration-600 ease-in-out`}
      style={{ backgroundImage: currentGradient, ...cssVars }}
    >
      {useComposite ? (
        <CompositeBackground
          effectMix={effectMix}
          colorLeft={colorLeft}
          colorMiddle={colorMiddle}
          colorRight={colorRight}
          paused={!settings.useAnimations}
        />
      ) : (
        resolvedAnimation && (
          <AnimatedBackground
            animationKey={resolvedAnimation}
            colorLeft={colorLeft}
            colorMiddle={colorMiddle}
            colorRight={colorRight}
            paused={!settings.useAnimations}
          />
        )
      )}
      {children}
    </div>
  );
}
