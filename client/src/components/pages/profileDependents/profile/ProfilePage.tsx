import Navbar from "@/components/nav/Navbar";
import { WithOnloadAnimation } from "@/lib/OnloadAnimationNavbar";
import CardAnimation from "@/lib/OnloadAnimationCard";
import { useSettings } from "../settings/settingsLogic/SettingsContext";
import { ProfilePageContent } from "./ProfilePageConent";

export function ProfilePage() {
  const AnimatedNavbar = WithOnloadAnimation(Navbar);
  const { settings } = useSettings();

  return (
    <div className="max-w-full w-full h-full relative flex flex-col items-center justify-start pt-10 text-white">
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
