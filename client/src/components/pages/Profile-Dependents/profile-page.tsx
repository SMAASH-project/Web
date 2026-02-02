import Navbar from "@/components/navbar";
import { WithOnloadAnimation } from "@/lib/OnloadAnimation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

export function ProfilePage() {
  const AnimatedNavbar = WithOnloadAnimation(Navbar);

  return (
    <div className="max-w-full w-full h-full relative flex flex-col items-center justify-start pt-10 bg-linear-to-r from-gray-700 via-black to-gray-700 text-white">
      {
        // Animated navbar: shows on load, then hides to -top-17
      }
      <AnimatedNavbar />
      <Card className="z-0 flex w-350 h-150 p-10 max-w-full max-h-lg">
        <Avatar>
          <AvatarImage
            src="https://github.com/shadcn.png"
            alt="@shadcn"
            className="grayscale"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </Card>
    </div>
  );
}
