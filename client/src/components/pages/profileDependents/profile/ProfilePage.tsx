import Navbar from "@/components/nav/Navbar";
import { WithOnloadAnimation } from "@/lib/miscAnimations/OnloadAnimationNavbar";
import CardAnimation from "@/lib/miscAnimations/OnloadAnimationCard";
import { useSettings } from "../settings/settingsLogic/SettingsContext";
import { ProfilePageContent } from "./ProfilePageConent";

export function ProfilePage() {
  const AnimatedNavbar = WithOnloadAnimation(Navbar);
  const { settings } = useSettings();

  return (
    <div className="max-w-full w-full h-full flex flex-col items-center justify-start text-white">
      {settings.useAnimations ? <AnimatedNavbar /> : <Navbar />}
      {settings.useAnimations ? (
        <CardAnimation className="z-0 mt-20">
          <ProfilePageContent />
        </CardAnimation>
      ) : (
        <div className="z-0 mt-20">
          <ProfilePageContent />
        </div>
      )}
    </div>
  );
}
