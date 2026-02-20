import Navbar from "@/components/navbar";
import { WithOnloadAnimation } from "@/lib/OnloadAnimationNavbar";
import CardAnimation from "@/lib/OnloadAnimationCard";
import { useSettings } from "../Settings/settings-logic/SettingsContext";
import { ProfilePageContent } from "./profie-page-content";

export function ProfilePage() {
  const AnimatedNavbar = WithOnloadAnimation(Navbar);
  const { settings } = useSettings();

  return (
    <div className="max-w-full w-full h-full relative flex flex-col items-center justify-start pt-10 bg-linear-to-r from-gray-700 via-black to-gray-700 text-white">
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
