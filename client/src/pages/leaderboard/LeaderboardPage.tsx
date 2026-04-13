import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "@/components/nav/Navbar";
import { useSettings } from "@/pages/settings/SettingsContext";
import { getBackgroundClasses, getTextColor, getSubtextColor, getTextShadow } from "@/lib/utils";
import {
  useTopItemsQuery,
  useTopPlayersQuery,
  useTopLevelsQuery,
  useLeaderboardQuery,
} from "@/hooks/useDebug";
import { Trophy, Users, BarChart3, ShoppingBag, Coins, Medal, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type TabId = "all" | "wins" | "active" | "levels" | "items";

interface RankedEntry {
  id: number;
  name: string;
  stat: number;
  statLabel: string;
  sub?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rankColor(i: number) {
  if (i === 0) return "text-amber-400";
  if (i === 1) return "text-slate-300";
  if (i === 2) return "text-orange-500";
  return "opacity-30";
}

// ─── Podium ───────────────────────────────────────────────────────────────────

const PODIUM = {
  1: {
    ring: "ring-amber-400",
    avatarBg: "bg-amber-400/20",
    nameColor: "text-amber-400",
    platform: "from-amber-600 to-amber-400",
    height: "h-28",
    avatar: "w-16 h-16 text-xl",
    delay: 0,
  },
  2: {
    ring: "ring-slate-400",
    avatarBg: "bg-slate-400/20",
    nameColor: "text-slate-300",
    platform: "from-slate-600 to-slate-400",
    height: "h-20",
    avatar: "w-12 h-12 text-lg",
    delay: 0.15,
  },
  3: {
    ring: "ring-orange-500",
    avatarBg: "bg-orange-500/20",
    nameColor: "text-orange-500",
    platform: "from-orange-700 to-orange-500",
    height: "h-14",
    avatar: "w-10 h-10 text-base",
    delay: 0.3,
  },
} as const;

function PodiumSlot({
  rank,
  entry,
  textColor,
  subtextColor,
}: {
  rank: 1 | 2 | 3;
  entry: RankedEntry | undefined;
  textColor: string;
  subtextColor: string;
}) {
  const c = PODIUM[rank];
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: c.delay, ease: "easeOut" }}
    >
      {/* Info above platform */}
      <div className="flex flex-col items-center gap-1 px-2 pb-3">
        <div
          className={`${c.avatar} rounded-full ${c.avatarBg} ring-2 ${c.ring} flex items-center justify-center font-bold ${c.nameColor} shrink-0`}
        >
          {entry?.name[0]?.toUpperCase() ?? "?"}
        </div>
        <span className={`max-w-22.5 truncate text-center text-xs font-semibold ${textColor}`}>
          {entry?.name ?? "—"}
        </span>
        <span className={`text-xs font-bold ${c.nameColor}`}>
          {entry ? `${entry.stat.toLocaleString()} ${entry.statLabel}` : "—"}
        </span>
        {entry?.sub && (
          <span className={`text-[10px] ${subtextColor} opacity-60`}>{entry.sub}</span>
        )}
      </div>
      {/* Platform */}
      <div
        className={`w-24 ${c.height} bg-linear-to-t ${c.platform} flex items-start justify-center rounded-t-xl pt-2`}
      >
        <span className="text-3xl font-black text-white/20">{rank}</span>
      </div>
    </motion.div>
  );
}

// ─── Category view (podium + runners-up + search + list) ─────────────────────

function CategoryView({
  entries,
  isLoading,
  textColor,
  subtextColor,
  rowCard,
  useDarkMode,
  useLiquidGlass,
}: {
  entries: RankedEntry[];
  isLoading: boolean;
  textColor: string;
  subtextColor: string;
  rowCard: string;
  useDarkMode: boolean;
  useLiquidGlass: boolean;
}) {
  const { t } = useTranslation("leaderboard");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      entries
        .map((e, i) => ({ ...e, rank: i + 1 }))
        .filter((e) => e.name.toLowerCase().includes(search.toLowerCase())),
    [entries, search],
  );

  const inputBg = useLiquidGlass
    ? useDarkMode
      ? "bg-white/10 border-white/10 focus:border-white/30"
      : "bg-black/5 border-black/10 focus:border-black/20"
    : useDarkMode
      ? "bg-gray-800/80 border-gray-700 focus:border-gray-500"
      : "bg-gray-100 border-gray-200 focus:border-gray-400";

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-center gap-3" style={{ height: "13rem" }}>
          {[80, 112, 56].map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-3 w-16 rounded" />
              <div style={{ height: h }} className="w-24">
                <Skeleton className="h-full w-full rounded-t-xl" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return <p className={`py-16 text-center text-sm opacity-50 ${subtextColor}`}>{t("noData")}</p>;
  }

  const top3 = entries.slice(0, 3);
  const runnersUp = entries.slice(3, 5);

  return (
    <div className="flex flex-col gap-5">
      {/* Podium: order is 2nd | 1st | 3rd */}
      <div className="flex items-end justify-center gap-1 pt-2">
        <PodiumSlot rank={2} entry={top3[1]} textColor={textColor} subtextColor={subtextColor} />
        <PodiumSlot rank={1} entry={top3[0]} textColor={textColor} subtextColor={subtextColor} />
        <PodiumSlot rank={3} entry={top3[2]} textColor={textColor} subtextColor={subtextColor} />
      </div>

      {/* Runners-up */}
      {runnersUp.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.45 }}
          className="flex flex-col gap-1.5"
        >
          <p
            className={`text-[10px] font-semibold tracking-widest uppercase ${subtextColor} mb-0.5 opacity-60`}
          >
            {t("podium.runnersUp")}
          </p>
          {runnersUp.map((e, i) => (
            <div key={e.id} className={rowCard}>
              <span
                className={`w-5 shrink-0 text-center text-xs font-bold opacity-40 ${subtextColor}`}
              >
                {i + 4}
              </span>
              <span className={`flex-1 truncate text-sm font-medium ${textColor}`}>{e.name}</span>
              <span className={`text-xs font-semibold ${subtextColor}`}>
                {e.stat.toLocaleString()} {e.statLabel}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Full rankings: search + scrollable list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.55 }}
        className="flex flex-col gap-2.5"
      >
        <p
          className={`text-[10px] font-semibold tracking-widest uppercase ${subtextColor} opacity-60`}
        >
          {t("podium.fullRankings")}
        </p>
        <div className="relative">
          <Search
            size={14}
            className={`absolute top-1/2 left-3 -translate-y-1/2 ${subtextColor} pointer-events-none opacity-50`}
          />
          <input
            type="text"
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-xl py-2.5 pr-3 pl-9 text-sm ${inputBg} ${textColor} border transition-colors outline-none placeholder:opacity-30`}
          />
        </div>

        <div className="flex max-h-72 flex-col gap-1 overflow-y-auto pr-0.5">
          {filtered.length === 0 ? (
            <p className={`py-4 text-center text-xs opacity-40 ${subtextColor}`}>{t("noData")}</p>
          ) : (
            filtered.map((e) => (
              <div key={e.id} className={rowCard}>
                <span
                  className={`w-6 shrink-0 text-center text-xs font-bold ${rankColor(e.rank - 1)}`}
                >
                  {e.rank}
                </span>
                <span className={`flex-1 truncate text-sm font-medium ${textColor}`}>{e.name}</span>
                <span className={`text-xs font-semibold ${subtextColor}`}>
                  {e.stat.toLocaleString()} {e.statLabel}
                </span>
                {e.sub && (
                  <span className={`text-[10px] ${subtextColor} shrink-0 opacity-50`}>{e.sub}</span>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function LeaderboardPage() {
  const { settings } = useSettings();
  const { useLiquidGlass, useDarkMode } = settings;
  const { t } = useTranslation("leaderboard");

  const [activeTab, setActiveTab] = useState<TabId>("all");

  const { data: topItems = [], isLoading: itemsLoading } = useTopItemsQuery();
  const { data: topPlayers = [], isLoading: playersLoading } = useTopPlayersQuery();
  const { data: topLevels = [], isLoading: levelsLoading } = useTopLevelsQuery();
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useLeaderboardQuery();

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

  // Normalised entries per category
  const winsEntries: RankedEntry[] = leaderboard.map((p) => ({
    id: p.id,
    name: p.display_name,
    stat: p.count_of_wins,
    statLabel: t("stats.wins"),
    sub: `${p.coins.toLocaleString()} coins`,
  }));
  const activeEntries: RankedEntry[] = topPlayers.map((p) => ({
    id: p.id,
    name: p.display_name,
    stat: p.count_of_matches,
    statLabel: t("stats.matches"),
  }));
  const levelsEntries: RankedEntry[] = topLevels.map((l) => ({
    id: l.id,
    name: l.name,
    stat: l.count_of_plays,
    statLabel: t("stats.plays"),
  }));
  const itemsEntries: RankedEntry[] = topItems.map((i) => ({
    id: i.id,
    name: i.name,
    stat: i.count_of_purchases,
    statLabel: t("stats.sales"),
    sub: i.rarity,
  }));

  const categoryMap: Record<Exclude<TabId, "all">, { entries: RankedEntry[]; loading: boolean }> = {
    wins: { entries: winsEntries, loading: leaderboardLoading },
    active: { entries: activeEntries, loading: playersLoading },
    levels: { entries: levelsEntries, loading: levelsLoading },
    items: { entries: itemsEntries, loading: itemsLoading },
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: t("tabs.all"), icon: <BarChart3 size={13} /> },
    { id: "wins", label: t("tabs.wins"), icon: <Trophy size={13} /> },
    { id: "active", label: t("tabs.active"), icon: <Users size={13} /> },
    { id: "levels", label: t("tabs.levels"), icon: <BarChart3 size={13} /> },
    { id: "items", label: t("tabs.items"), icon: <ShoppingBag size={13} /> },
  ];

  // Stat bar highlights for "All" view
  const statChips = [
    {
      icon: <Trophy size={12} />,
      label: t("statBar.topWinner"),
      value: leaderboard[0]?.display_name ?? "—",
      sub: leaderboard[0] ? `${leaderboard[0].count_of_wins} ${t("stats.wins")}` : undefined,
    },
    {
      icon: <Users size={12} />,
      label: t("statBar.mostActive"),
      value: topPlayers[0]?.display_name ?? "—",
      sub: topPlayers[0] ? `${topPlayers[0].count_of_matches} ${t("stats.matches")}` : undefined,
    },
    {
      icon: <BarChart3 size={12} />,
      label: t("statBar.hottestLevel"),
      value: topLevels[0]?.name ?? "—",
      sub: topLevels[0] ? `${topLevels[0].count_of_plays} ${t("stats.plays")}` : undefined,
    },
    {
      icon: <ShoppingBag size={12} />,
      label: t("statBar.bestSeller"),
      value: topItems[0]?.name ?? "—",
      sub: topItems[0] ? `${topItems[0].count_of_purchases} ${t("stats.sales")}` : undefined,
    },
  ];

  // Panels for "All" view
  const allPanels = [
    {
      title: t("panels.winLeaderboard"),
      icon: <Trophy size={13} />,
      isLoading: leaderboardLoading,
      rows: leaderboard.slice(0, 5).map((p, i) => (
        <div key={p.id} className={rowCard}>
          <Medal size={13} className={rankColor(i)} />
          <span className={`flex-1 truncate text-sm font-medium ${textColor}`}>
            {p.display_name}
          </span>
          <span className={`flex items-center gap-1 text-xs font-semibold ${subtextColor}`}>
            <Trophy size={10} className="text-amber-400" />
            {p.count_of_wins}
          </span>
          <span className={`flex items-center gap-1 text-xs ${subtextColor}`}>
            <Coins size={10} className="text-amber-400" />
            {p.coins.toLocaleString()}
          </span>
        </div>
      )),
    },
    {
      title: t("panels.mostActivePlayers"),
      icon: <Users size={13} />,
      isLoading: playersLoading,
      rows: topPlayers.slice(0, 5).map((p, i) => (
        <div key={p.id} className={rowCard}>
          <Medal size={13} className={rankColor(i)} />
          <span className={`flex-1 truncate text-sm font-medium ${textColor}`}>
            {p.display_name}
          </span>
          <span className={`text-xs font-semibold ${subtextColor}`}>
            {p.count_of_matches} {t("stats.matches")}
          </span>
        </div>
      )),
    },
    {
      title: t("panels.mostPlayedLevels"),
      icon: <BarChart3 size={13} />,
      isLoading: levelsLoading,
      rows: topLevels.slice(0, 5).map((l, i) => (
        <div key={l.id} className={rowCard}>
          <Medal size={13} className={rankColor(i)} />
          <span className={`flex-1 truncate text-sm font-medium ${textColor}`}>{l.name}</span>
          <span className={`text-xs font-semibold ${subtextColor}`}>
            {l.count_of_plays} {t("stats.plays")}
          </span>
        </div>
      )),
    },
    {
      title: t("panels.mostPurchasedItems"),
      icon: <ShoppingBag size={13} />,
      isLoading: itemsLoading,
      rows: topItems.slice(0, 5).map((item, i) => (
        <div key={item.id} className={rowCard}>
          <Medal size={13} className={rankColor(i)} />
          <span className={`flex-1 truncate text-sm font-medium ${textColor}`}>{item.name}</span>
          <span className={`text-xs font-semibold ${subtextColor}`}>
            {item.count_of_purchases} {t("stats.sales")}
          </span>
        </div>
      )),
    },
  ];

  return (
    <div className={`flex min-h-dvh w-full flex-col self-start p-4 ${textColor}`}>
      <Navbar />
      <div className="mx-auto mt-20 flex w-full max-w-4xl flex-col gap-5 pb-8">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className={`text-2xl font-bold tracking-tight ${textColor} ${textShadow}`}>
            {t("title")}
          </h1>
          <p className={`text-sm ${subtextColor}`}>{t("subtitle")}</p>
        </div>

        {/* Tab selector */}
        <div className={`flex gap-1 rounded-2xl p-1 ${panelBg}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? useDarkMode
                    ? "bg-white/15 text-white shadow"
                    : "bg-white text-gray-900 shadow"
                  : `${subtextColor} hover:bg-black/5`
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content — AnimatePresence gives clean cross-fade on switch */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "all" ? (
              <div className="flex flex-col gap-4">
                {/* Stat bar */}
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {statChips.map((chip, i) => (
                    <div key={i} className={`flex flex-col gap-1 rounded-xl p-3 ${panelBg}`}>
                      <div className="flex items-center gap-1.5">
                        <span className={subtextColor}>{chip.icon}</span>
                        <span
                          className={`text-[10px] font-semibold tracking-wider uppercase ${subtextColor} truncate opacity-70`}
                        >
                          {chip.label}
                        </span>
                      </div>
                      <span className={`truncate text-sm font-bold ${textColor}`}>
                        {chip.value}
                      </span>
                      {chip.sub && (
                        <span className={`text-[10px] ${subtextColor} opacity-60`}>{chip.sub}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* 2×2 panels — top 5 each */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {allPanels.map((panel) => (
                    <div
                      key={panel.title}
                      className={`flex flex-col gap-3 rounded-xl p-4 ${panelBg}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={subtextColor}>{panel.icon}</span>
                        <p
                          className={`text-xs font-semibold tracking-wider uppercase ${subtextColor}`}
                        >
                          {panel.title}
                        </p>
                      </div>
                      {panel.isLoading ? (
                        <div className="flex flex-col gap-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-3 py-2">
                              <Skeleton className="h-3.5 w-3.5 shrink-0 rounded-full" />
                              <Skeleton className="h-3 flex-1 rounded" />
                              <Skeleton className="h-3 w-16 rounded" />
                            </div>
                          ))}
                        </div>
                      ) : panel.rows.length === 0 ? (
                        <p className={`py-6 text-center text-xs opacity-50 ${subtextColor}`}>
                          {t("noData")}
                        </p>
                      ) : (
                        <div className="flex flex-col gap-1">{panel.rows}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`rounded-2xl p-5 ${panelBg}`}>
                <CategoryView
                  entries={categoryMap[activeTab as Exclude<TabId, "all">].entries}
                  isLoading={categoryMap[activeTab as Exclude<TabId, "all">].loading}
                  textColor={textColor}
                  subtextColor={subtextColor}
                  rowCard={rowCard}
                  useDarkMode={useDarkMode}
                  useLiquidGlass={useLiquidGlass}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
