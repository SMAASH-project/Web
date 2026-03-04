import Navbar from "@/components/nav/Navbar";
import { WithOnloadAnimation } from "@/lib/miscAnimations/OnloadAnimationNavbar";
import { CardAnimation } from "@/lib/miscAnimations/OnloadAnimationCard";
import { useSettings } from "./settingsLogic/SettingsContext";
import { SettingsPageContent } from "./settingsComponenets/SettingsPageContent";

export function SettingsPage() {
  const AnimatedNavbar = WithOnloadAnimation(Navbar);
  const { settings } = useSettings();

  return (
    <div className="min-h-screen w-full self-start flex flex-col items-center text-white">
      <div className="-mt-2 w-full">
        {settings.useAnimations ? <AnimatedNavbar /> : <Navbar />}
      </div>
      {settings.useAnimations ? (
        <CardAnimation className="z-0 flex-1 w-full px-4 sm:px-6 lg:px-10 flex items-center justify-center">
          <SettingsPageContent />
        </CardAnimation>
      ) : (
        <div className="z-0 flex-1 w-full px-4 sm:px-6 lg:px-10 flex items-center justify-center">
          <SettingsPageContent />
        </div>
      )}
    </div>
  );
}
