import { cn } from "@/lib/utils";
import { useSettings } from "../pages/profileDependents/settings/settingsLogic/SettingsContext";
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup } from "../ui/avatar";
import { Label } from "../ui/label";
import { Plus } from "lucide-react";
import { Profiles } from "@/lib/Profile";

export function ProfileSelectorForm() {
  const { settings } = useSettings();
  const profiles = Profiles;
  const profileCount = profiles.length;
  const activeProfile = profiles[0];
  const username = activeProfile?.name ?? "Add Profile";

  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-5">
      <div className="mb-4 z-1">
        <Label
          className={`text-white ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""}`}
        >
          Select a Profile
        </Label>
        <div className="text-sm text-white/80 mt-1">
          {profileCount} profile{profileCount === 1 ? "" : "s"} available
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center flex-col gap-5">
        <div className="relative" />
        <div className="flex flex-row items-center gap-4">
          <AvatarGroup>
            {profiles.map((p) => (
              <Avatar
                key={p.name}
                size="lg"
                className={`text-white cursor-pointer ${settings.useLiquidGlass ? "bg-white/30 backdrop-blur-lg border-white/30 border-2 shadow-sm shadow-white/20[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : "border-green-500 border-2 bg-amber-200"} `}
              >
                <AvatarImage src={p.avatar} alt={p.name} />
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-0 flex items-center justify-center rounded-full bg-gray-700/70 opacity-0 transition-opacity duration-150 pointer-events-none",
                    "group-hover/avatar:opacity-100",
                  )}
                >
                  <Plus className={cn("size-10 text-white opacity-100")} />
                </span>
                <AvatarFallback>
                  {p.name
                    ? p.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                    : "NA"}
                </AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </div>
        <div className="mb-4 z-1 ">
          <Label
            className={`items-center justify-center text-white ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""}`}
          >
            {username}
          </Label>
        </div>
      </div>
    </div>
  );
}
