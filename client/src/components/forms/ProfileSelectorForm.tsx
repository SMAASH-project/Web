import { useTranslation } from "react-i18next";
import {
  cn,
  getLiquidGlassClasses,
  getLiquidGlassTextShadow,
} from "@/lib/utils";
import { useSettings } from "../pages/profileDependents/settings/settingsLogic/SettingsContext";
import type { SettingsState } from "../pages/profileDependents/settings/settingsLogic/SettingsContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Label } from "../ui/label";
import { Plus, Trash2, Play, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useCallback, memo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AddNewProfile } from "./addNewProfile/AddNewProfile";
import { useProfiles } from "./addNewProfile/useProfiles";
import * as motion from "motion/react-client";
import { useLogoutMutation } from "@/hooks/useQueryHooks";
import { AuthContext } from "@/context/AuthContext";

const ProfileAvatar = memo(function ProfileAvatar({
  profile,
  isManaging,
  settings,
  onProfileClick,
}: {
  profile: { id?: number; name: string; avatar: string };
  isManaging: boolean;
  settings: SettingsState;
  onProfileClick: (name: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="cursor-pointer"
      >
        <Avatar
          size="lg"
          onClick={() => onProfileClick(profile.name)}
          className={`text-white cursor-pointer ${settings.useLiquidGlass ? `${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode)} border-2 ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)} ${isManaging ? "border-red-400" : settings.useDarkMode ? "border-black/40" : "border-white/30"}` : `${isManaging ? "border-red-500" : "border-(--theme-accent)"} border-2 bg-amber-200`}`}
        >
          <AvatarImage src={profile.avatar} alt={profile.name} />
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-full bg-gray-700/70 opacity-0 transition-opacity duration-150 pointer-events-none",
              "group-hover/avatar:opacity-100",
            )}
          >
            {isManaging ? (
              <Trash2 className={cn("size-10 text-white opacity-100")} />
            ) : (
              <Play className={cn("size-10 text-white opacity-100")} />
            )}
          </span>
          <AvatarFallback>
            {profile.name
              ? profile.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
              : "NA"}
          </AvatarFallback>
        </Avatar>
        <span
          className={`block text-center text-white ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
        >
          {profile.name}
        </span>
      </motion.div>
    </div>
  );
});

export function ProfileSelectorForm() {
  const { settings } = useSettings();
  const { profiles, removeProfile, selectProfile } = useProfiles();
  const { t } = useTranslation("profile");
  const profileCount = profiles.length;
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const navigate = useNavigate();

  const { setIsLoggedIn, setUserId, setIsAdmin } = useContext(AuthContext);
  const logoutMutation = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setIsLoggedIn(false);
      setUserId(null);
      setIsAdmin(false);
      navigate("/app/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProfileClick = useCallback(
    async (name: string) => {
      if (isManaging) {
        try {
          await removeProfile(name);
        } catch (error) {
          console.error("Failed to delete profile:", error);
        }
        return;
      }
      selectProfile(name);
      navigate("/app/releases");
    },
    [isManaging, removeProfile, selectProfile, navigate],
  );

  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-5">
      <div className="mb-4 z-1">
        <Label
          className={`text-white ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
        >
          {t("selector.title")}
        </Label>
        <div className="text-sm text-white/80 mt-1">
          {profileCount} profile{profileCount === 1 ? "" : "s"} available
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center flex-col gap-10">
        <div className="flex flex-row items-center justify-center gap-6 z-1 flex-wrap">
          <div className="flex flex-row items-center gap-6">
            {profiles.map((p) => (
              <ProfileAvatar
                key={p.id}
                profile={p}
                isManaging={isManaging}
                settings={settings}
                onProfileClick={handleProfileClick}
              />
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
        <div className="mb-4 z-1 flex gap-3">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setIsManaging((prev) => !prev)}
              className={`text-white ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode)} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)} rounded-lg cursor-pointer`}
            >
              {isManaging ? t("selector.done") : t("selector.manage")}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className={`text-white ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode)} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)} rounded-lg cursor-pointer`}
            >
              <LogOut className="size-4" />
              {logoutMutation.isPending ? "..." : t("selector.logout")}
            </Button>
          </motion.div>
        </div>
      </div>
      <AddNewProfile open={showAddProfile} onOpenChange={setShowAddProfile} />
    </div>
  );
}
