import { useRef, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { useSettings } from "../settings/settingsLogic/SettingsContext";
import { UpdateSheet } from "./UpdateSheet";
import { ExternalLink } from "lucide-react";
import {
  cn,
  getLiquidGlassClasses,
  getLiquidGlassTextShadow,
  getBackgroundClasses,
  getTextColor,
} from "@/lib/utils";
import { useProfiles } from "@/components/forms/addNewProfile/useProfiles";
import { useUploadProfilePictureMutation } from "@/hooks/useQueryHooks";

export function ProfilePageContent() {
  const pfpinputRef = useRef<HTMLInputElement>(null);
  const { selectedProfile } = useProfiles();
  const uploadProfilePictureMutation = useUploadProfilePictureMutation();
  // local avatarSrc is only used when the user picks a local file (blob)
  // otherwise we display the selectedProfile.avatar
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const username = selectedProfile?.name ?? "PlaceholderUserName";
  const { settings } = useSettings();

  useEffect(() => {
    return () => {
      if (avatarSrc && avatarSrc.startsWith("blob:"))
        URL.revokeObjectURL(avatarSrc);
    };
  }, [avatarSrc]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedProfile?.id) {
      return;
    }

    try {
      await uploadProfilePictureMutation.mutateAsync({
        profileId: selectedProfile.id,
        file,
      });
      const url = URL.createObjectURL(file);
      setAvatarSrc((prev) => {
        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return url;
      });

    } catch (error) {
      console.error("Failed to upload profile picture:", error);
    }
  };

  const bgClass = getBackgroundClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const cardClasses = settings.useLiquidGlass
    ? getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode)
    : bgClass;

  return (
    <Card
      className={`z-0 flex flex-col lg:flex-row w-full max-w-6xl p-6 sm:p-8 lg:p-10 gap-8 lg:gap-10 ${cardClasses}`}
    >
      {/* Profile Section */}
      <div className="flex-1 flex items-center justify-center flex-col gap-6">
        <div>
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
              className={`text-white cursor-pointer ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode)} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
            >
              <AvatarImage
                src={
                  avatarSrc ??
                  selectedProfile?.avatar ??
                  "./src/assets/SlimeArt.png"
                }
                alt={username}
              />
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
          <Label
            className={`font-semibold text-lg ${textColor} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
          >
            {username}
          </Label>
        </div>
        <div>
          <UpdateSheet />
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold">Stats</h2>
        </div>
      </div>

      {/* Match History Section */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm">Match History</p>
        </div>
      </div>
    </Card>
  );
}
