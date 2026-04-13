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
    <div className={`flex min-h-dvh w-full flex-col items-center self-start ${textColor}`}>
      <Navbar />
      {settings.useAnimations ? (
        <CardAnimation
          className="z-0 flex w-full flex-1 items-center justify-center px-4 pt-20 sm:px-6 lg:px-10"
          onAnimationComplete={handleAnimationComplete}
        >
          <ProfilePageContent animReady={animDone} />
        </CardAnimation>
      ) : (
        <div className="z-0 flex w-full flex-1 items-center justify-center px-4 pt-20 sm:px-6 lg:px-10">
          <ProfilePageContent animReady={true} />
        </div>
      )}
    </div>
  );
}
