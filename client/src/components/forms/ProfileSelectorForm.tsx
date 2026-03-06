import {
  cn,
  getLiquidGlassClasses,
  getLiquidGlassTextShadow,
} from "@/lib/utils";
import { useSettings } from "../pages/profileDependents/settings/settingsLogic/SettingsContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Label } from "../ui/label";
import { Plus, Trash2, Play } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddNewProfile } from "./addNewProfile/AddNewProfile";
import { useProfiles } from "./addNewProfile/useProfiles";
import * as motion from "motion/react-client";

export function ProfileSelectorForm() {
  const { settings } = useSettings();
  const { profiles, removeProfile, selectProfile } = useProfiles();
  const profileCount = profiles.length;
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = async (name: string) => {
    if (isManaging) {
      try {
        await removeProfile(name);
      } catch (error) {
        console.error("Failed to delete profile:", error);
      }
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
          className={`text-white ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
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
              <div key={p.name} className="flex flex-col items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer"
                >
                  <Avatar
                    size="lg"
                    onClick={() => handleProfileClick(p.name)}
                    className={`text-white cursor-pointer ${settings.useLiquidGlass ? `${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode)} border-2 ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)} ${isManaging ? "border-red-400" : settings.useDarkMode ? "border-black/40" : "border-white/30"}` : `${isManaging ? "border-red-500" : "border-(--theme-accent)"} border-2 bg-amber-200`}`}
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
                        <Play
                          className={cn("size-10 text-white opacity-100")}
                        />
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
                  <span
                    className={`text-white ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
                  >
                    {p.name}
                  </span>
                </motion.div>
              </div>
            ))}
            {profileCount < 5 && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setShowAddProfile(true)}
                    className="w-12 h-12 rounded-full bg-gray-600 border-2 border-gray-500 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="size-6 text-white" />
                  </button>

                  <span
                    className={`text-white text-sm ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
                  >
                    Add New
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
        <div className="mb-4 z-1 ">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setIsManaging((prev) => !prev)}
              className={`text-white ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode)} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)} rounded-lg cursor-pointer`}
            >
              {isManaging ? "Done" : "Manage Profiles"}
            </Button>
          </motion.div>
        </div>
      </div>
      <AddNewProfile open={showAddProfile} onOpenChange={setShowAddProfile} />
    </div>
  );
}
