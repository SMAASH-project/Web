import { useTranslation } from "react-i18next";
import { cn, getLiquidGlassClasses, getLiquidGlassTextShadow } from "@/lib/utils";
import { useSettings } from "@/pages/settings/SettingsContext";
import type { SettingsState } from "@/pages/settings/SettingsContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Play, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback, memo, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AddNewProfileDialog } from "./AddNewProfileDialog";
import { useProfiles } from "./useProfiles";
import * as motion from "motion/react-client";
import { useLogoutMutation } from "@/hooks/useQueryHooks";
import { AnimatedPress } from "@/animations/AnimatedPress";
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
  const avatarContent = (
    <>
      <Avatar
        size="lg"
        onClick={() => onProfileClick(profile.name)}
        className={`cursor-pointer text-white ${settings.useLiquidGlass ? `${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode)} border-2 ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)} ${isManaging ? "border-red-400" : settings.useDarkMode ? "border-black/40" : "border-white/30"}` : `${isManaging ? "border-red-500" : "border-(--theme-accent)"} border-2 bg-amber-200`}`}
      >
        <AvatarImage src={profile.avatar} alt={profile.name} />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-gray-700/70 opacity-0 transition-opacity duration-150",
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
    </>
  );

  return (
    <div className="flex flex-col items-center gap-2">
      {settings.useAnimations ? (
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="group/avatar cursor-pointer"
        >
          {avatarContent}
        </motion.div>
      ) : (
        <div className="group/avatar cursor-pointer">{avatarContent}</div>
      )}
    </div>
  );
});

export function ProfileSelectorPage() {
  const { settings } = useSettings();
  const { profiles, removeProfile, selectProfile } = useProfiles();
  const { t } = useTranslation("profile");
  const profileCount = profiles.length;
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const { userId, setIsLoggedIn, setUserId, setIsAdmin } = useContext(AuthContext);
  const logoutMutation = useLogoutMutation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (location.state?.change) {
      setChecking(false);
      return;
    }
    if (!userId) {
      setChecking(false);
      return;
    }
    const stored = localStorage.getItem(`selected_profile_${String(userId)}`);
    if (stored) {
      navigate(location.state?.from ?? "/app/releases", { replace: true });
    } else {
      setChecking(false);
    }
  }, [userId, location.state, navigate]);

  const handleLogout = async () => {
    try {
      if (userId) localStorage.removeItem(`selected_profile_${String(userId)}`);
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
      navigate(location.state?.from ?? "/app/releases");
    },
    [isManaging, removeProfile, selectProfile, navigate, location.state],
  );

  if (checking) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5">
      <div className="z-1 mb-4">
        <Label
          className={`text-white ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
        >
          {t("selector.title")}
        </Label>
        <div className="mt-1 text-sm text-white/80">
          {t("selector.profilesAvailable", { count: profileCount })}
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-10">
        <div className="z-1 flex flex-row flex-wrap items-center justify-center gap-6">
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
              <AnimatedPress>
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setShowAddProfile(true)}
                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-gray-500 bg-gray-600 transition-colors hover:bg-gray-700"
                  >
                    <Plus className="size-6 text-white" />
                  </button>
                  <span
                    className={`text-sm text-white ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
                  >
                    {t("selector.addNew")}
                  </span>
                </div>
              </AnimatedPress>
            )}
          </div>
        </div>
        <div className="z-1 mb-4 flex gap-3">
          <AnimatedPress>
            <Button
              onClick={() => setIsManaging((prev) => !prev)}
              className={`text-white ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode)} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)} cursor-pointer rounded-lg`}
            >
              {isManaging ? t("selector.done") : t("selector.manage")}
            </Button>
          </AnimatedPress>
          <AnimatedPress>
            <Button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className={`text-white ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode)} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)} cursor-pointer rounded-lg`}
            >
              <LogOut className="size-4" />
              {logoutMutation.isPending ? "..." : t("selector.logout")}
            </Button>
          </AnimatedPress>
        </div>
      </div>
      <AddNewProfileDialog open={showAddProfile} onOpenChange={setShowAddProfile} />
    </div>
  );
}
