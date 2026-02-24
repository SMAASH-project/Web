import { cn } from "@/lib/utils";
import { useSettings } from "../pages/profileDependents/settings/settingsLogic/SettingsContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Label } from "../ui/label";
import { Plus, Trash2, Play } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddNewProfile } from "./addNewProfile/AddNewProfile";
import { useProfiles } from "./addNewProfile/useProfiles";

export function ProfileSelectorForm() {
  const { settings } = useSettings();
  const { profiles, removeProfile, selectProfile } = useProfiles();
  const profileCount = profiles.length;
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = (name: string) => {
    if (isManaging) {
      removeProfile(name);
      return;
    }
    // set the selected profile in context so other pages can render it
    selectProfile(name);
    navigate("/app/releases");
  };

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
      <div className="flex-1 flex items-center justify-center flex-col gap-10">
        <div className="flex flex-row items-center justify-center gap-6 z-1 flex-wrap">
          <div className="flex flex-row items-center gap-6">
            {profiles.map((p) => (
              <div
                key={p.name}
                className="flex flex-col items-center gap-2"
                onClick={() => handleProfileClick(p.name)}
              >
                <Avatar
                  size="lg"
                  className={`text-white cursor-pointer ${settings.useLiquidGlass ? `bg-white/30 backdrop-blur-lg border-2 shadow-sm shadow-white/20[text-shadow:0_2px_4px_rgba(163,163,163,0.8)] ${isManaging ? "border-red-400" : "border-white/30"}` : `${isManaging ? "border-red-500" : "border-green-500"} border-2 bg-amber-200`} `}
                >
                  <AvatarImage src={p.avatar} alt={p.name} />
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-0 flex items-center justify-center rounded-full bg-gray-700/70 opacity-0 transition-opacity duration-150 pointer-events-none",
                      "group-hover/avatar:opacity-100",
                    )}
                  >
                    {isManaging ? (
                      <Trash2
                        className={cn("size-10 text-white opacity-100")}
                      />
                    ) : (
                      <Play className={cn("size-10 text-white opacity-100")} />
                    )}
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
                <span className="text-white text-sm text-center">{p.name}</span>
              </div>
            ))}
            {profileCount < 5 && (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setShowAddProfile(true)}
                  className="w-12 h-12 rounded-full bg-gray-600 border-2 border-gray-500 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
                >
                  <Plus className="size-6 text-white" />
                </button>
                <span className="text-white text-sm text-center">Add New</span>
              </div>
            )}
          </div>
        </div>
        <div className="mb-4 z-1 ">
          <Button
            onClick={() => setIsManaging((prev) => !prev)}
            className={`text-white ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)] rounded-lg bg-white/30" : ""} cursor-pointer`}
          >
            {isManaging ? "Done" : "Manage Profiles"}
          </Button>
        </div>
      </div>
      <AddNewProfile open={showAddProfile} onOpenChange={setShowAddProfile} />
    </div>
  );
}
