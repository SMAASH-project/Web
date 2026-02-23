import { useRef, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { useSettings } from "../settings/settingsLogic/SettingsContext";
import { UpdateSheet } from "./UpdateSheet";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const username = "PlaceholderUserName";

export function ProfilePageContent() {
  const pfpinputRef = useRef<HTMLInputElement>(null);
  const [avatarSrc, setAvatarSrc] = useState<string>(
    "./src/assets/SlimeArt.png",
  );
  const { settings } = useSettings();

  useEffect(() => {
    return () => {
      if (avatarSrc && avatarSrc.startsWith("blob:"))
        URL.revokeObjectURL(avatarSrc);
    };
  }, [avatarSrc]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarSrc((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
  };

  return (
    <Card
      className={`z-0 flex flex-row w-350 h-150 p-10 max-w-full max-h-lg ${settings.useLiquidGlass ? "bg-white/30 backdrop-blur-lg border-white/30 shadow-sm shadow-white/20" : "bg-gray-600 border-2 border-green-400"}`}
    >
      {/* Left Section */}
      <div className="flex-1 flex items-center justify-center flex-col gap-30">
        <div>
          {/*top area */}
          <input
            type="file"
            ref={pfpinputRef}
            hidden
            accept="image/*"
            onChange={onFileChange}
          />
          <div onClick={() => pfpinputRef.current?.click()}>
            <Avatar
              size="lg"
              className={`text-white cursor-pointer ${settings.useLiquidGlass ? "bg-white/30 backdrop-blur-lg border-white/30 border-2 shadow-sm shadow-white/20[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : "border-green-500 border-2 bg-amber-200"} `}
            >
              <AvatarImage src={avatarSrc} alt={username} />
              <span
                aria-hidden
                className={cn(
                  "absolute inset-0 flex items-center justify-center rounded-full bg-gray-700/70 opacity-0 transition-opacity duration-150 pointer-events-none",
                  "group-hover/avatar:opacity-100",
                )}
              >
                <ExternalLink className={cn("size-4 text-white opacity-100")} />
              </span>
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div>
          {/*middle area */}
          <Label>{username}</Label>
        </div>
        <div>
          {/*bottom area */}
          <UpdateSheet />
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
  );
}
