import { cn } from "@/lib/utils";
import { useSettings } from "../pages/profileDependents/settings/settingsLogic/SettingsContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Label } from "../ui/label";
import { Plus } from "lucide-react";

export function ProfileSelectorForm() {
  const { settings } = useSettings();
  const avatarSrc = "";
  const username = "PlaceholderUserName";

  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-5">
      <div className="mb-4 z-1">
        <Label
          className={`text-white ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""}`}
        >
          Select a Profile
        </Label>
      </div>
      <div className="flex-1 flex items-center justify-center flex-col gap-5">
        <div className="relative"></div>
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
            <Plus className={cn("size-10 text-white opacity-100")} />
          </span>
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="mb-4 z-1 ">
          <Label
            className={`items-center justify-center text-white ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""}`}
          >
            Profile Name
          </Label>
        </div>
      </div>
    </div>
  );
}
