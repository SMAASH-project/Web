import { useState, useCallback } from "react";
import Navbar from "@/components/nav/Navbar";
import { useSettings } from "@/pages/settings/SettingsContext";
import {
  getBackgroundClasses,
  getTextColor,
  getSubtextColor,
  getTextShadow,
  sectionStyle,
} from "@/lib/utils";
import {
  useTopItemsQuery,
  useTopPlayersQuery,
  useTopLevelsQuery,
  useLeaderboardQuery,
} from "@/hooks/useDebug";
import {
  Trophy,
  Users,
  BarChart3,
  ShoppingBag,
  Loader2,
  Coins,
  Medal,
} from "lucide-react";
import { CardAnimation } from "@/animations/CardAnimation";
import { LoadPost } from "@/animations/LoadPost";

// ─── Animated stat panel ──────────────────────────────────────────────────────

function StatPanel({
  title,
  icon,
  isLoading,
  children,
  panelBg,
  subtextColor,
  animReady,
  delayMs,
}: {
  title: string;
  icon: React.ReactNode;
  isLoading: boolean;
  children: React.ReactNode;
  panelBg: string;
  subtextColor: string;
  animReady: boolean;
  delayMs: number;
}) {
  return (
    <div
      className={`rounded-xl p-5 flex flex-col gap-4 ${panelBg}`}
      style={sectionStyle(animReady, delayMs)}
    >
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
  return "opacity-40";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LeaderboardPage() {
  const { settings } = useSettings();
  const { useLiquidGlass, useDarkMode, useAnimations } = settings;

  const [animDone, setAnimDone] = useState(false);
  const handleAnimationComplete = useCallback(() => setAnimDone(true), []);

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

  // animReady is either driven by CardAnimation completing (useAnimations=true)
  // or immediately true (useAnimations=false)
  const ready = useAnimations ? animDone : true;

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

  // Wrap a row list in LoadPost stagger — only when animations are on
  const animatedRows = <T extends { id: number }>(
    rows: T[],
    render: (item: T, i: number) => React.ReactNode,
  ) =>
    rows.map((item, i) =>
      useAnimations ? (
        <LoadPost key={item.id} index={i}>
          {render(item, i)}
        </LoadPost>
      ) : (
        <div key={item.id}>{render(item, i)}</div>
      ),
    );

  const inner = (
    <div className="mt-20 z-0 flex flex-col items-center justify-start gap-6 w-full max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div
        className="flex flex-col gap-1 w-full"
        style={sectionStyle(ready, 0)}
      >
        <h1
          className={`text-2xl font-bold ${textColor} tracking-tight ${textShadow}`}
        >
          Leaderboard
        </h1>
        <p className={`text-sm ${subtextColor}`}>
          Community stats and top performers
        </p>
      </div>

      {/* 2×2 panel grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Win leaderboard */}
        <StatPanel
          title="Win Leaderboard"
          icon={<Trophy size={13} />}
          isLoading={leaderboardLoading}
          panelBg={panelBg}
          subtextColor={subtextColor}
          animReady={ready}
          delayMs={80}
        >
          {leaderboard.length === 0 ? (
            emptyMsg
          ) : (
            <div className="flex flex-col gap-1.5">
              {animatedRows(leaderboard.slice(0, 10), (p, i) => (
                <div className={rowCard}>
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
          animReady={ready}
          delayMs={160}
        >
          {topPlayers.length === 0 ? (
            emptyMsg
          ) : (
            <div className="flex flex-col gap-1.5">
              {animatedRows(topPlayers.slice(0, 10), (p, i) => (
                <div className={rowCard}>
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
          animReady={ready}
          delayMs={240}
        >
          {topLevels.length === 0 ? (
            emptyMsg
          ) : (
            <div className="flex flex-col gap-1.5">
              {animatedRows(topLevels.slice(0, 10), (l, i) => (
                <div className={rowCard}>
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
          animReady={ready}
          delayMs={320}
        >
          {topItems.length === 0 ? (
            emptyMsg
          ) : (
            <div className="flex flex-col gap-1.5">
              {animatedRows(topItems.slice(0, 10), (item, i) => (
                <div className={rowCard}>
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
  );

  return (
    <div
      className={`p-4 min-h-screen w-full self-start flex flex-col ${textColor}`}
    >
      <Navbar />
      {useAnimations ? (
        <CardAnimation
          className="flex-1 w-full"
          onAnimationComplete={handleAnimationComplete}
        >
          {inner}
        </CardAnimation>
      ) : (
        inner
      )}
    </div>
  );
}
