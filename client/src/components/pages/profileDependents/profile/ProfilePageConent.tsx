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

  // Local blob URL for an instant preview while the upload is in-flight.
  // The shared cache is updated (with a versioned URL) by the mutation's onSuccess.
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const username = selectedProfile?.name ?? "PlaceholderUserName";
  const { settings } = useSettings();

  // Revoke the blob URL when it changes or on unmount to avoid memory leaks.
  useEffect(() => {
    return () => {
      if (localPreview?.startsWith("blob:")) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProfile?.id) return;

    // Show a local preview immediately while the upload happens in the background.
    const blobUrl = URL.createObjectURL(file);
    setLocalPreview(blobUrl);

    try {
      await uploadProfilePictureMutation.mutateAsync({
        profileId: selectedProfile.id,
        file,
      });
      // On success the mutation's onSuccess updates the shared cache with a
      // versioned URL — no manual cache manipulation needed here.
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
      // Revert the local preview if the upload failed.
      setLocalPreview(null);
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

  // Prefer the local blob preview while uploading; otherwise use the cached URL.
  const avatarSrc =
    localPreview ?? selectedProfile?.avatar ?? "./src/assets/SlimeArt.png";

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
