import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { AdminPageLogic } from "@/components/pages/profileDependents/admin/adminLogic/useAdminPageLogic";
import { getButtonClasses } from "@/lib/utils";

export default function ProfilesPanel({ logic }: { logic: AdminPageLogic }) {
  const {
    profiles,
    profilesLoading,
    selectedUser,
    selectedProfileIdx,
    setSelectedProfileIdx,
    profileBtnClass,
    subtextColor,
    countBadge,
    panelBg,
  } = logic;

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl p-3 w-full xl:w-60 xl:shrink-0 ${panelBg}`}
    >
      <div className="flex items-center gap-2 px-1">
        <div
          className={`text-xs font-semibold uppercase tracking-wider ${subtextColor}`}
        >
          Profiles
        </div>
        {profiles.length > 0 && (
          <span className={countBadge}>{profiles.length}</span>
        )}
      </div>

      <Separator className={logic.sepClass} />

      <div className="flex flex-col gap-2 overflow-y-auto max-h-75 xl:max-h-none xl:flex-1 xl:min-h-0">
        {!selectedUser ? (
          <p className={`text-xs text-center py-4 ${subtextColor}`}>
            No user selected
          </p>
        ) : profilesLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current opacity-40" />
          </div>
        ) : profiles.length === 0 ? (
          <p className={`text-xs text-center py-4 ${subtextColor}`}>
            No profiles
          </p>
        ) : (
          profiles.map((profile, idx) => {
            const isSelected = idx === selectedProfileIdx;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => setSelectedProfileIdx(idx)}
                className={profileBtnClass(isSelected)}
              >
                <Avatar size="sm" className="shrink-0">
                  <AvatarImage
                    src={`/api/profiles/${profile.id}/pfp`}
                    alt={profile.display_name}
                  />
                  <AvatarFallback
                    className={`text-xs ${getButtonClasses(logic.useLiquidGlass, logic.useDarkMode, "secondary")}`}
                  >
                    {profile.display_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${logic.textColor} ${logic.textShadow}`}
                  >
                    {profile.display_name}
                  </p>
                  <p className={`text-xs ${subtextColor}`}>
                    {profile.coins ?? 0} coins
                  </p>
                </div>
                {isSelected && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${logic.useLiquidGlass ? "bg-white/70" : "bg-(--theme-accent)"}`}
                  />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
