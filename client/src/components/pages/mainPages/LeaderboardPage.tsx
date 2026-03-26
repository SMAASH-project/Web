import Navbar from "@/components/nav/Navbar";
import { useSettings } from "@/components/pages/profileDependents/settings/settingsLogic/SettingsContext";
import {
  getBackgroundClasses,
  getTextColor,
  getSubtextColor,
  getTextShadow,
} from "@/lib/utils";
import {
  useTopItemsQuery,
  useTopPlayersQuery,
  useTopLevelsQuery,
  useLeaderboardQuery,
} from "@/hooks/useDebugHooks";
import {
  Trophy,
  Users,
  BarChart3,
  ShoppingBag,
  Loader2,
  Coins,
  Medal,
} from "lucide-react";

// ─── Shared stat panel shell ──────────────────────────────────────────────────

function StatPanel({
  title,
  icon,
  isLoading,
  children,
  panelBg,
  subtextColor,
}: {
  title: string;
  icon: React.ReactNode;
  isLoading: boolean;
  children: React.ReactNode;
  panelBg: string;
  subtextColor: string;
}) {
  return (
    <div className={`rounded-xl p-5 flex flex-col gap-4 ${panelBg}`}>
      <div className="flex items-center gap-2">
        <span className={subtextColor}>{icon}</span>
        <p
          className={`text-xs font-semibold uppercase tracking-wider ${subtextColor}`}
        >
          {title}
        </p>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className={`w-5 h-5 animate-spin ${subtextColor}`} />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// ─── Rank medal colours ───────────────────────────────────────────────────────

function rankColor(i: number) {
  if (i === 0) return "text-amber-400";
  if (i === 1) return "text-slate-300";
  if (i === 2) return "text-amber-600";
  return "opacity-50";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LeaderboardPage() {
  const { settings } = useSettings();
  const { useLiquidGlass, useDarkMode } = settings;

  const { data: topItems = [], isLoading: itemsLoading } = useTopItemsQuery();
  const { data: topPlayers = [], isLoading: playersLoading } =
    useTopPlayersQuery();
  const { data: topLevels = [], isLoading: levelsLoading } =
    useTopLevelsQuery();
  const { data: leaderboard = [], isLoading: leaderboardLoading } =
    useLeaderboardQuery();

  const panelBg = getBackgroundClasses(useLiquidGlass, useDarkMode, "light");
  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const subtextColor = getSubtextColor(useLiquidGlass, useDarkMode);
  const textShadow = getTextShadow(useLiquidGlass, useDarkMode);

  const rowCard = `flex items-center gap-3 rounded-lg px-3 py-2 ${
    useLiquidGlass
      ? useDarkMode
        ? "bg-white/5 hover:bg-white/10"
        : "bg-black/5 hover:bg-black/8"
      : useDarkMode
        ? "bg-gray-800/60 hover:bg-gray-800"
        : "bg-gray-50 hover:bg-gray-100"
  } transition-colors duration-150`;

  const emptyMsg = (
    <p className={`text-xs text-center py-6 opacity-50 ${subtextColor}`}>
      No data yet
    </p>
  );

  return (
    <div className="p-4 min-h-screen w-full self-start flex flex-col">
      <Navbar />
      <div className="mt-20 z-0 flex flex-col items-center justify-start gap-6 w-full max-w-6xl mx-auto pb-8">
        {/* Header */}
        <div className="flex flex-col gap-1 w-full">
          <h1
            className={`text-2xl font-bold ${textColor} tracking-tight ${textShadow}`}
          >
            Leaderboard
          </h1>
          <p className={`text-sm ${subtextColor}`}>
            Community stats and top performers
          </p>
        </div>

        {/* 2×2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* Win leaderboard */}
          <StatPanel
            title="Win Leaderboard"
            icon={<Trophy size={13} />}
            isLoading={leaderboardLoading}
            panelBg={panelBg}
            subtextColor={subtextColor}
          >
            {leaderboard.length === 0 ? (
              emptyMsg
            ) : (
              <div className="flex flex-col gap-1.5">
                {leaderboard.slice(0, 10).map((p, i) => (
                  <div key={p.id} className={rowCard}>
                    <Medal size={14} className={rankColor(i)} />
                    <span
                      className={`flex-1 text-sm font-medium truncate ${textColor}`}
                    >
                      {p.display_name}
                    </span>
                    <span
                      className={`text-xs font-semibold flex items-center gap-1 ${subtextColor}`}
                    >
                      <Trophy size={10} className="text-amber-400" />
                      {p.count_of_wins.toLocaleString()} W
                    </span>
                    <span
                      className={`text-xs flex items-center gap-1 ${subtextColor}`}
                    >
                      <Coins size={10} className="text-amber-400" />
                      {p.coins.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </StatPanel>

          {/* Most active players */}
          <StatPanel
            title="Most Active Players"
            icon={<Users size={13} />}
            isLoading={playersLoading}
            panelBg={panelBg}
            subtextColor={subtextColor}
          >
            {topPlayers.length === 0 ? (
              emptyMsg
            ) : (
              <div className="flex flex-col gap-1.5">
                {topPlayers.slice(0, 10).map((p, i) => (
                  <div key={p.id} className={rowCard}>
                    <Medal size={14} className={rankColor(i)} />
                    <span
                      className={`flex-1 text-sm font-medium truncate ${textColor}`}
                    >
                      {p.display_name}
                    </span>
                    <span className={`text-xs font-semibold ${subtextColor}`}>
                      {p.count_of_matches.toLocaleString()} matches
                    </span>
                  </div>
                ))}
              </div>
            )}
          </StatPanel>

          {/* Most played levels */}
          <StatPanel
            title="Most Played Levels"
            icon={<BarChart3 size={13} />}
            isLoading={levelsLoading}
            panelBg={panelBg}
            subtextColor={subtextColor}
          >
            {topLevels.length === 0 ? (
              emptyMsg
            ) : (
              <div className="flex flex-col gap-1.5">
                {topLevels.slice(0, 10).map((l, i) => (
                  <div key={l.id} className={rowCard}>
                    <Medal size={14} className={rankColor(i)} />
                    <span
                      className={`flex-1 text-sm font-medium truncate ${textColor}`}
                    >
                      {l.name}
                    </span>
                    <span className={`text-xs font-semibold ${subtextColor}`}>
                      {l.count_of_plays.toLocaleString()} plays
                    </span>
                  </div>
                ))}
              </div>
            )}
          </StatPanel>

          {/* Most purchased items */}
          <StatPanel
            title="Most Purchased Items"
            icon={<ShoppingBag size={13} />}
            isLoading={itemsLoading}
            panelBg={panelBg}
            subtextColor={subtextColor}
          >
            {topItems.length === 0 ? (
              emptyMsg
            ) : (
              <div className="flex flex-col gap-1.5">
                {topItems.slice(0, 10).map((item, i) => (
                  <div key={item.id} className={rowCard}>
                    <Medal size={14} className={rankColor(i)} />
                    <span
                      className={`flex-1 text-sm font-medium truncate ${textColor}`}
                    >
                      {item.name}
                    </span>
                    <span className={`text-xs font-semibold ${subtextColor}`}>
                      {item.count_of_purchases.toLocaleString()} sales
                    </span>
                  </div>
                ))}
              </div>
            )}
          </StatPanel>
        </div>
      </div>
    </div>
  );
}
