import React, { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Coins, Plus, Minus, Check, Loader2 } from "lucide-react";
import type { AdminPageLogic } from "@/pages/admin/useAdminPageLogic";
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
  }, [selectedProfile]);

  const parsedCoins = parseInt(coinDraft, 10);
  const isValid = !isNaN(parsedCoins) && parsedCoins >= 0;
  const isDirty = selectedProfile && isValid && parsedCoins !== (selectedProfile.coins ?? 0);

  const handleSave = async () => {
    if (!selectedProfile || !isDirty || !isValid) return;
    await handleUpdateCoins(selectedProfile.id!, selectedProfile.display_name, parsedCoins);
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
    <div className={`flex w-full flex-col gap-3 rounded-xl p-3 xl:w-60 xl:shrink-0 ${panelBg}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <div className={`text-xs font-semibold tracking-wider uppercase ${subtextColor}`}>
          Profiles
        </div>
        {profiles.length > 0 && <span className={countBadge}>{profiles.length}</span>}
      </div>

      <Separator className={logic.sepClass} />

      {/* Profile list */}
      <div className="flex max-h-48 flex-col gap-2 overflow-y-auto xl:max-h-none xl:min-h-0 xl:flex-1">
        {!selectedUser ? (
          <p className={`py-4 text-center text-xs ${subtextColor}`}>No user selected</p>
        ) : profilesLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-current opacity-40" />
          </div>
        ) : profiles.length === 0 ? (
          <p className={`py-4 text-center text-xs ${subtextColor}`}>No profiles</p>
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
                  <AvatarImage src={`/api/profiles/${profile.id}/pfp`} alt={profile.display_name} />
                  <AvatarFallback
                    className={`text-xs ${getButtonClasses(useLiquidGlass, useDarkMode, "secondary")}`}
                  >
                    {profile.display_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${textColor} ${textShadow}`}>
                    {profile.display_name}
                  </p>
                  <p className={`text-xs ${subtextColor}`}>
                    {(profile.coins ?? 0).toLocaleString()} coins
                  </p>
                </div>
                {isSelected && (
                  <div
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${useLiquidGlass ? "bg-white/70" : "bg-(--theme-accent)"}`}
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
              <Coins size={11} className="shrink-0 text-amber-400" />
              <p className={`text-xs font-semibold tracking-wider uppercase ${subtextColor}`}>
                Coins
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Decrement */}
              <Button
                size="sm"
                onClick={() => adjust(-100)}
                className={`h-7 w-7 shrink-0 p-0 text-xs ${getButtonClasses(useLiquidGlass, useDarkMode, "secondary")}`}
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
                className={`min-w-0 flex-1 rounded-md px-2 py-1.5 text-center text-xs ${inputClass} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
              />

              {/* Increment */}
              <Button
                size="sm"
                onClick={() => adjust(100)}
                className={`h-7 w-7 shrink-0 p-0 text-xs ${getButtonClasses(useLiquidGlass, useDarkMode, "secondary")}`}
              >
                <Plus size={11} />
              </Button>
            </div>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-1">
              {[1000, 5000, 10000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setCoinDraft(String(v));
                    setSaved(false);
                  }}
                  className={`rounded-full border px-2 py-0.5 text-[10px] transition-colors duration-150 ${getButtonClasses(useLiquidGlass, useDarkMode, "secondary")} ${subtextColor}`}
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
              className={`h-7 w-full text-xs transition-all duration-150 ${
                saved
                  ? "border-green-700 bg-green-600 text-white hover:bg-green-600"
                  : isDirty && isValid
                    ? "border-amber-600 bg-amber-500 text-black hover:bg-amber-400"
                    : "cursor-not-allowed border-gray-600 bg-gray-500 text-white opacity-40"
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
