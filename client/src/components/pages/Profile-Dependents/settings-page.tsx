import Navbar from "@/components/navbar";
import { WithOnloadAnimation } from "@/lib/OnloadAnimationNavbar";
import { Card } from "@/components/ui/card";
import { CardAnimation } from "@/lib/OnloadAnimationCard";
import { Label } from "@/components/ui/label";
export function SettingsPage() {
  const AnimatedNavbar = WithOnloadAnimation(Navbar);

  return (
    <div className="max-w-full w-full h-full relative flex flex-col items-center justify-start pt-10 bg-linear-to-r from-gray-700 via-black to-gray-700 text-white">
      {
        // Animated navbar: shows on load, then hides to -top-17
      }

      <AnimatedNavbar />
      <CardAnimation className="z-0 mt-20">
        <Card className="flex flex-row w-350 h-150 p-10 max-w-full max-h-lg bg-gray-600 border-2 border-green-400">
          {/* Left Section */}
          <div className="flex-1 flex items-center justify-center flex-col gap-50">
            <div>
              <Label>Visual</Label>
            </div>
            <div></div>
            <div></div>
          </div>

          {/* Middle Section */}
          <div className="flex-1 flex items-center justify-center"></div>

          {/* Right Section */}
          <div className="flex-1 flex items-center justify-center"></div>
        </Card>
      </CardAnimation>
    </div>
  );
}
