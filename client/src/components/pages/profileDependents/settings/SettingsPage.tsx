import Navbar from "@/components/nav/Navbar";
import { WithOnloadAnimation } from "@/lib/OnloadAnimationNavbar";
import { CardAnimation } from "@/lib/OnloadAnimationCard";
import { useSettings } from "./settingsLogic/SettingsContext";
import { SettingsPageContent } from "./settings-componenets/SettingsPageContent";

export function SettingsPage() {
  const AnimatedNavbar = WithOnloadAnimation(Navbar);
  const { settings } = useSettings();

  return (
    <div className="max-w-full w-full h-full relative flex flex-col items-center justify-start pt-10 text-white">
      {settings.useAnimations ? <AnimatedNavbar /> : <Navbar />}
      {settings.useAnimations ? (
        <CardAnimation className="z-0 mt-20">
          <SettingsPageContent />
        </CardAnimation>
      ) : (
        <div className="z-0 mt-20">
          <SettingsPageContent />
        </div>
      )}
    </div>
  );
}
