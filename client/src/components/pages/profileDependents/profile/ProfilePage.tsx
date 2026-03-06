import Navbar from "@/components/nav/Navbar";
// import { WithOnloadAnimation } from "@/lib/miscAnimations/OnloadAnimationNavbar";
import CardAnimation from "@/lib/miscAnimations/OnloadAnimationCard";
import { useSettings } from "../settings/settingsLogic/SettingsContext";
import { ProfilePageContent } from "./ProfilePageConent";
import { getTextColor } from "@/lib/utils";

export function ProfilePage() {
  // const AnimatedNavbar = WithOnloadAnimation(Navbar);
  const { settings } = useSettings();
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);

  return (
    <div
      className={`min-h-screen w-full self-start flex flex-col items-center ${textColor}`}
    >
      <div className="w-full ">
        {/* {settings.useAnimations ? <AnimatedNavbar /> : <Navbar />} */}
        <Navbar />
      </div>
      {settings.useAnimations ? (
        <CardAnimation className="z-0 flex-1 w-full px-4 sm:px-6 lg:px-10 flex items-center justify-center">
          <ProfilePageContent />
        </CardAnimation>
      ) : (
        <div className="z-0 flex-1 w-full px-4 sm:px-6 lg:px-10 flex items-center justify-center">
          <ProfilePageContent />
        </div>
      )}
    </div>
  );
}
