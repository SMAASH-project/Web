import { useContext, useState, useMemo } from "react";
import { Coins, RefreshCw, Search, Check, Loader2, User } from "lucide-react";
import { useSettings } from "@/components/pages/profileDependents/settings/settingsLogic/SettingsContext";
import {
  getBackgroundClasses,
  getTextColor,
  getSubtextColor,
  getTextShadow,
  getInputClasses,
  sectionStyle,
} from "@/lib/utils";
import {
  useAllProfilesQuery,
  useUpdateCoinsMutation,
  type AdminProfileDTO,
} from "@/hooks/useDebugHooks";
import { useQueryClient } from "@tanstack/react-query";
import { debugQueryKeys } from "@/hooks/useDebugHooks";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/AuthContext";

// ─── Inline coin editor row ───────────────────────────────────────────────────

function ProfileCoinRow({
  profile,
  textColor,
  subtextColor,
  statCard,
  inputClass,
}: {
  profile: AdminProfileDTO;
  textColor: string;
  subtextColor: string;
  statCard: string;
  inputClass: string;
}) {
  const [draft, setDraft] = useState(String(profile.coins));
  const [saved, setSaved] = useState(false);
  const updateCoins = useUpdateCoinsMutation();

  const isDirty = draft !== String(profile.coins);
  const parsed = parseInt(draft, 10);
  const isValid = !isNaN(parsed) && parsed >= 0;

  const handleSave = async () => {
    if (!isValid || !isDirty) return;
    await updateCoins.mutateAsync({
      id: profile.id,
      display_name: profile.display_name,
      coins: parsed,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className={`${statCard} flex items-center gap-3`}>
      <User size={13} className={`shrink-0 ${subtextColor}`} />
      <span className={`flex-1 text-sm font-medium truncate ${textColor}`}>
        {profile.display_name}
      </span>
      <span className={`text-xs font-mono ${subtextColor} shrink-0`}>
        #{profile.id}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        <Coins size={12} className="text-amber-400 shrink-0" />
        <input
          type="number"
          min={0}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setSaved(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className={`w-24 text-xs px-2 py-1 rounded-md ${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isDirty || !isValid || updateCoins.isPending}
          className={`h-6 px-2 text-xs transition-all duration-150 ${
            saved
              ? "bg-green-600 hover:bg-green-600 text-white border-green-700"
              : isDirty && isValid
                ? "bg-amber-500 hover:bg-amber-400 text-black border-amber-600"
                : "opacity-40 cursor-not-allowed bg-gray-500 text-white border-gray-600"
          }`}
        >
          {updateCoins.isPending ? (
            <Loader2 size={10} className="animate-spin" />
          ) : saved ? (
            <Check size={10} />
          ) : (
            "Set"
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DebugPageContent({
  animReady = true,
}: {
  animReady?: boolean;
}) {
  const { settings } = useSettings();
  const { useLiquidGlass, useDarkMode } = settings;
  const { isAdmin } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading: profilesLoading } =
    useAllProfilesQuery();

  const [search, setSearch] = useState("");

  const filteredProfiles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter(
      (p) =>
        p.display_name.toLowerCase().includes(q) || String(p.id).includes(q),
    );
  }, [profiles, search]);

  const cardBg = getBackgroundClasses(useLiquidGlass, useDarkMode);
  const panelBg = getBackgroundClasses(useLiquidGlass, useDarkMode, "light");
  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const subtextColor = getSubtextColor(useLiquidGlass, useDarkMode);
  const textShadow = getTextShadow(useLiquidGlass, useDarkMode);
  const inputClass = getInputClasses(useLiquidGlass, useDarkMode);

  const statCard = `rounded-lg p-2.5 ${
    useLiquidGlass
      ? useDarkMode
        ? "bg-white/10 border border-white/10"
        : "bg-black/10 border border-black/10"
      : useDarkMode
        ? "bg-gray-800 border border-gray-700"
        : "bg-gray-50 border border-gray-200"
  }`;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: debugQueryKeys.allProfiles });
  };

  return (
    <div
      className={`z-0 flex flex-col w-full max-w-5xl p-4 sm:p-6 gap-4 sm:gap-6 rounded-xl ${
        animReady ? cardBg : cardBg.replace(/backdrop-blur-\S+/g, "")
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={sectionStyle(animReady, 0)}
      >
        <div>
          <h2 className={`text-lg font-bold ${textColor} ${textShadow}`}>
            Debug Panel
          </h2>
          <p className={`text-xs mt-0.5 ${subtextColor}`}>
            {isAdmin ? "Admin — full access" : "Support — read-only access"}
          </p>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            onClick={handleRefresh}
            className={`text-xs flex items-center gap-1.5 ${
              useLiquidGlass
                ? useDarkMode
                  ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                  : "bg-black/10 hover:bg-black/15 border-black/20 text-black"
                : useDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-800"
            }`}
          >
            <RefreshCw size={13} />
            Refresh
          </Button>
        )}
      </div>

      {/* Coin editor — admin only */}
      {isAdmin ? (
        <div
          className={`rounded-xl p-4 flex flex-col gap-3 ${panelBg}`}
          style={sectionStyle(animReady, 80)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins size={13} className={subtextColor} />
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${subtextColor}`}
              >
                Profile Coin Editor
              </p>
              {!profilesLoading && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    useLiquidGlass
                      ? useDarkMode
                        ? "bg-white/15 text-white/70"
                        : "bg-black/10 text-white/70"
                      : useDarkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {filteredProfiles.length}
                </span>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={13}
              className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${subtextColor}`}
            />
            <input
              type="text"
              placeholder="Search by name or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-8 pr-3 py-2 text-sm rounded-xl ${inputClass}`}
            />
          </div>

          {/* Profile list */}
          {profilesLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className={`w-5 h-5 animate-spin ${subtextColor}`} />
            </div>
          ) : filteredProfiles.length === 0 ? (
            <p className={`text-xs text-center py-6 ${subtextColor}`}>
              No profiles found
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-[28rem] overflow-y-auto pr-1">
              {filteredProfiles.map((profile) => (
                <ProfileCoinRow
                  key={profile.id}
                  profile={profile}
                  textColor={textColor}
                  subtextColor={subtextColor}
                  statCard={statCard}
                  inputClass={inputClass}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Support: read-only notice */
        <div
          className={`rounded-xl p-6 flex flex-col items-center gap-3 ${panelBg}`}
          style={sectionStyle(animReady, 80)}
        >
          <Coins size={28} className={`opacity-30 ${subtextColor}`} />
          <p className={`text-sm font-medium opacity-60 ${subtextColor}`}>
            Coin editor is admin-only
          </p>
          <p
            className={`text-xs text-center max-w-xs opacity-40 ${subtextColor}`}
          >
            Support accounts have read-only access. Contact an admin to adjust
            player coins.
          </p>
        </div>
      )}
    </div>
  );
}
