import Navbar from "@/components/nav/Navbar";
// import { WithOnloadAnimation } from "@/animations/NavbarAnimation";
import { CardAnimation } from "@/animations/CardAnimation";
import { useSettings } from "@/pages/settings/SettingsContext";
import { SettingsPageContent } from "./components/SettingsPageContent";
import { getTextColor } from "@/lib/utils";
import { useState, useCallback } from "react";

export function SettingsPage() {
  // const AnimatedNavbar = WithOnloadAnimation(Navbar);
  const { settings } = useSettings();
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);

  // Defer backdrop-blur on the card until after the entry animation finishes.
  // During the scale-up spring the card has no blur, eliminating the
  // "growing blur region resampled every frame" cost that causes the choppiness.
  const [animDone, setAnimDone] = useState(false);
  const handleAnimationComplete = useCallback(() => setAnimDone(true), []);

  return (
    <div
      className={`min-h-screen w-full self-start flex flex-col items-center ${textColor}`}
    >
      <Navbar />
      {settings.useAnimations ? (
        <CardAnimation
          className="z-0 flex-1 w-full px-4 sm:px-6 lg:px-10 pt-20 flex items-center justify-center"
          onAnimationComplete={handleAnimationComplete}
        >
          {/* Pass animDone so SettingsPageContent can skip backdrop-blur during animation */}
          <SettingsPageContent animReady={animDone} />
        </CardAnimation>
      ) : (
        <div className="z-0 flex-1 w-full px-4 sm:px-6 lg:px-10 pt-20 flex items-center justify-center">
          <SettingsPageContent animReady={true} />
        </div>
      )}
    </div>
  );
}
