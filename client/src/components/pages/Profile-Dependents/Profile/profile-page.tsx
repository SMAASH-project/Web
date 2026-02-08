import Navbar from "@/components/navbar";
import { WithOnloadAnimation } from "@/lib/OnloadAnimation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { UpdateSheet } from "./Update-profile-sheet";
import { Label } from "@/components/ui/label";
// import {
//   Alert,
//   AlertAction,
//   AlertDescription,
//   AlertTitle,
// } from "@/components/ui/alert";
// import { InfoIcon } from "lucide-react";
// import { Button } from "@/components/ui/button";

const username = "PlaceholderUserName";

export function ProfilePage() {
  const AnimatedNavbar = WithOnloadAnimation(Navbar);

  return (
    <div className="max-w-full w-full h-full relative flex flex-col items-center justify-start pt-10 bg-linear-to-r from-gray-700 via-black to-gray-700 text-white">
      {
        // Animated navbar: shows on load, then hides to -top-17
      }

      <AnimatedNavbar />
      <Card className="z-0 flex flex-row w-350 h-150 p-10 max-w-full max-h-lg bg-gray-600 border-2 border-green-400">
        {/* Left Section */}
        <div className="flex-1 flex items-center justify-center flex-col gap-30">
          <div>
            <Avatar size="lg">
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt="@shadcn"
                className="grayscale"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <Label>{username}</Label>
          </div>
          <div>
            <UpdateSheet />
            {/* <Alert>
              <InfoIcon />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                You can add components and dependencies to your app using the
                cli.
              </AlertDescription>
              <AlertAction>
                <Button>Enable</Button>
              </AlertAction>
            </Alert> */}
          </div>
        </div>

        {/* Middle Section */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold">Stats</h2>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm">Match History</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
