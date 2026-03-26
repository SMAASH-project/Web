import React, { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Coins, Plus, Minus, Check, Loader2 } from "lucide-react";
import type { AdminPageLogic } from "@/components/pages/profileDependents/admin/adminLogic/useAdminPageLogic";
import { getButtonClasses, getInputClasses } from "@/lib/utils";

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
    textColor,
    textShadow,
    useLiquidGlass,
    useDarkMode,
    handleUpdateCoins,
    updateProfileMutation,
  } = logic;

  const selectedProfile = profiles[selectedProfileIdx] ?? null;

  // ── Coin editor state ──────────────────────────────────────────────────────
  const [coinDraft, setCoinDraft] = useState("");
  const [saved, setSaved] = useState(false);

  // Sync draft when selected profile changes
  useEffect(() => {
    if (selectedProfile) {
      setCoinDraft(String(selectedProfile.coins ?? 0));
      setSaved(false);
    }
  }, [selectedProfile?.id, selectedProfile?.coins]);

  const parsedCoins = parseInt(coinDraft, 10);
  const isValid = !isNaN(parsedCoins) && parsedCoins >= 0;
  const isDirty =
    selectedProfile && isValid && parsedCoins !== (selectedProfile.coins ?? 0);

  const handleSave = async () => {
    if (!selectedProfile || !isDirty || !isValid) return;
    await handleUpdateCoins(
      selectedProfile.id!,
      selectedProfile.display_name,
      parsedCoins,
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const adjust = (delta: number) => {
    const current = parseInt(coinDraft, 10) || 0;
    setCoinDraft(String(Math.max(0, current + delta)));
    setSaved(false);
  };

  const inputClass = getInputClasses(useLiquidGlass, useDarkMode);

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl p-3 w-full xl:w-60 xl:shrink-0 ${panelBg}`}
    >
      {/* Header */}
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

      {/* Profile list */}
      <div className="flex flex-col gap-2 overflow-y-auto max-h-48 xl:max-h-none xl:flex-1 xl:min-h-0">
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
                    className={`text-xs ${getButtonClasses(useLiquidGlass, useDarkMode, "secondary")}`}
                  >
                    {profile.display_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${textColor} ${textShadow}`}
                  >
                    {profile.display_name}
                  </p>
                  <p className={`text-xs ${subtextColor}`}>
                    {(profile.coins ?? 0).toLocaleString()} coins
                  </p>
                </div>
                {isSelected && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${useLiquidGlass ? "bg-white/70" : "bg-(--theme-accent)"}`}
                  />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Coin editor — shown when a profile is selected */}
      {selectedProfile && (
        <>
          <Separator className={logic.sepClass} />
          <div className="flex flex-col gap-2 px-1">
            <div className="flex items-center gap-1.5">
              <Coins size={11} className="text-amber-400 shrink-0" />
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${subtextColor}`}
              >
                Coins
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Decrement */}
              <Button
                size="sm"
                onClick={() => adjust(-100)}
                className={`h-7 w-7 p-0 text-xs shrink-0 ${getButtonClasses(useLiquidGlass, useDarkMode, "secondary")}`}
              >
                <Minus size={11} />
              </Button>

              {/* Input */}
              <input
                type="number"
                min={0}
                value={coinDraft}
                onChange={(e) => {
                  setCoinDraft(e.target.value);
                  setSaved(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                className={`flex-1 min-w-0 text-xs px-2 py-1.5 rounded-md text-center ${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              />

              {/* Increment */}
              <Button
                size="sm"
                onClick={() => adjust(100)}
                className={`h-7 w-7 p-0 text-xs shrink-0 ${getButtonClasses(useLiquidGlass, useDarkMode, "secondary")}`}
              >
                <Plus size={11} />
              </Button>
            </div>

            {/* Quick presets */}
            <div className="flex gap-1 flex-wrap">
              {[1000, 5000, 10000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setCoinDraft(String(v));
                    setSaved(false);
                  }}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors duration-150 ${getButtonClasses(useLiquidGlass, useDarkMode, "secondary")} ${subtextColor}`}
                >
                  {v.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Save button */}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isDirty || !isValid || updateProfileMutation.isPending}
              className={`w-full h-7 text-xs transition-all duration-150 ${
                saved
                  ? "bg-green-600 hover:bg-green-600 text-white border-green-700"
                  : isDirty && isValid
                    ? "bg-amber-500 hover:bg-amber-400 text-black border-amber-600"
                    : "opacity-40 cursor-not-allowed bg-gray-500 text-white border-gray-600"
              }`}
            >
              {updateProfileMutation.isPending ? (
                <Loader2 size={11} className="animate-spin" />
              ) : saved ? (
                <>
                  <Check size={11} /> Saved
                </>
              ) : (
                "Set Coins"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
