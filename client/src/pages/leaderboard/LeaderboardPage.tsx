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
import { Trophy, Users, BarChart3, ShoppingBag, Coins, Medal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
      className={`flex flex-col gap-4 rounded-xl p-5 ${panelBg}`}
      style={sectionStyle(animReady, delayMs)}
    >
      <div className="flex items-center gap-2">
        <span className={subtextColor}>{icon}</span>
        <p className={`text-xs font-semibold tracking-wider uppercase ${subtextColor}`}>{title}</p>
      </div>
      {isLoading ? (
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <Skeleton className="h-3.5 w-3.5 shrink-0 rounded-full" />
              <Skeleton className="h-3 flex-1 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          ))}
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
  const { data: topPlayers = [], isLoading: playersLoading } = useTopPlayersQuery();
  const { data: topLevels = [], isLoading: levelsLoading } = useTopLevelsQuery();
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useLeaderboardQuery();

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
    <p className={`py-6 text-center text-xs opacity-50 ${subtextColor}`}>No data yet</p>
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
    <div className="z-0 mx-auto mt-20 flex w-full max-w-6xl flex-col items-center justify-start gap-6 pb-8">
      {/* Header */}
      <div className="flex w-full flex-col gap-1" style={sectionStyle(ready, 0)}>
        <h1 className={`text-2xl font-bold ${textColor} tracking-tight ${textShadow}`}>
          Leaderboard
        </h1>
        <p className={`text-sm ${subtextColor}`}>Community stats and top performers</p>
      </div>

      {/* 2×2 panel grid */}
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        {/* Win leaderboard */}
        <StatPanel
          title="Win Leaderboard"
          icon={<Trophy size={13} />}
          isLoading={leaderboardLoading}
          panelBg={panelBg}
          subtextColor={subtextColor}
          animReady={ready}
          delayMs={40}
        >
          {leaderboard.length === 0 ? (
            emptyMsg
          ) : (
            <div className="flex flex-col gap-1.5">
              {animatedRows(leaderboard.slice(0, 10), (p, i) => (
                <div className={rowCard}>
                  <Medal size={14} className={rankColor(i)} />
                  <span className={`flex-1 truncate text-sm font-medium ${textColor}`}>
                    {p.display_name}
                  </span>
                  <span className={`flex items-center gap-1 text-xs font-semibold ${subtextColor}`}>
                    <Trophy size={10} className="text-amber-400" />
                    {p.count_of_wins.toLocaleString()} W
                  </span>
                  <span className={`flex items-center gap-1 text-xs ${subtextColor}`}>
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
          delayMs={80}
        >
          {topPlayers.length === 0 ? (
            emptyMsg
          ) : (
            <div className="flex flex-col gap-1.5">
              {animatedRows(topPlayers.slice(0, 10), (p, i) => (
                <div className={rowCard}>
                  <Medal size={14} className={rankColor(i)} />
                  <span className={`flex-1 truncate text-sm font-medium ${textColor}`}>
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
          delayMs={120}
        >
          {topLevels.length === 0 ? (
            emptyMsg
          ) : (
            <div className="flex flex-col gap-1.5">
              {animatedRows(topLevels.slice(0, 10), (l, i) => (
                <div className={rowCard}>
                  <Medal size={14} className={rankColor(i)} />
                  <span className={`flex-1 truncate text-sm font-medium ${textColor}`}>
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
          delayMs={160}
        >
          {topItems.length === 0 ? (
            emptyMsg
          ) : (
            <div className="flex flex-col gap-1.5">
              {animatedRows(topItems.slice(0, 10), (item, i) => (
                <div className={rowCard}>
                  <Medal size={14} className={rankColor(i)} />
                  <span className={`flex-1 truncate text-sm font-medium ${textColor}`}>
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
    <div className={`flex min-h-screen w-full flex-col self-start p-4 ${textColor}`}>
      <Navbar />
      {useAnimations ? (
        <CardAnimation className="w-full flex-1" onAnimationComplete={handleAnimationComplete}>
          {inner}
        </CardAnimation>
      ) : (
        inner
      )}
    </div>
  );
}
