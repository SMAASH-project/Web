import Navbar from "@/components/nav/Navbar";
// import { WithOnloadAnimation } from "@/animations/NavbarAnimation";
import CardAnimation from "@/animations/CardAnimation";
import { useSettings } from "@/pages/settings/SettingsContext";
import { ProfilePageContent } from "./ProfilePageContent";
import { getTextColor } from "@/lib/utils";
import { useState, useCallback } from "react";

export function ProfilePage() {
  // const AnimatedNavbar = WithOnloadAnimation(Navbar);
  const { settings } = useSettings();
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);

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
          <ProfilePageContent animReady={animDone} />
        </CardAnimation>
      ) : (
        <div className="z-0 flex-1 w-full px-4 sm:px-6 lg:px-10 pt-20 flex items-center justify-center">
          <ProfilePageContent animReady={true} />
        </div>
      )}
    </div>
  );
}
