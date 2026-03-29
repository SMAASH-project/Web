import { useContext, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Monitor,
  Database,
  Terminal,
  Gamepad2,
  RefreshCw,
  Bug,
  Eye,
} from "lucide-react";
import { useSettings } from "@/pages/settings/SettingsContext";
import {
  getBackgroundClasses,
  getTextColor,
  getSubtextColor,
  getTextShadow,
  getInputClasses,
} from "@/lib/utils";
import type { Transition } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "@/context/AuthContext";
import { SystemTab } from "./tabs/SystemTab";
import { CacheTab } from "./tabs/CacheTab";
import { EndpointsTab } from "./tabs/EndpointsTab";
import { GameDataTab } from "./tabs/GameDataTab";
import { SightTab } from "./tabs/SightTab";

// ─── Tab definition ───────────────────────────────────────────────────────────

type Tab = "system" | "cache" | "endpoints" | "game" | "sight";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "system", label: "System", icon: <Monitor size={14} /> },
  { id: "cache", label: "Cache", icon: <Database size={14} /> },
  { id: "endpoints", label: "Endpoints", icon: <Terminal size={14} /> },
  { id: "game", label: "Game Data", icon: <Gamepad2 size={14} /> },
  { id: "sight", label: "Sight", icon: <Eye size={14} /> },
];

// ─── Animation helpers (mirrors AdminPageContent) ────────────────────────────

const hidden = { opacity: 0, y: 18 };
const visible = { opacity: 1, y: 0 };
const colTransition = (delay: number): Transition => ({
  duration: 0.4,
  ease: "easeOut",
  delay,
});

// ─── Root ─────────────────────────────────────────────────────────────────────

export function DebugPageContent({
  animReady = true,
}: {
  animReady?: boolean;
}) {
  const { settings } = useSettings();
  const { useLiquidGlass, useDarkMode } = settings;
  const { isAdmin, isSupport } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("system");

  const cardBg = getBackgroundClasses(useLiquidGlass, useDarkMode);
  const panelBg = getBackgroundClasses(useLiquidGlass, useDarkMode, "light");
  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const subtextColor = getSubtextColor(useLiquidGlass, useDarkMode);
  const textShadow = getTextShadow(useLiquidGlass, useDarkMode);
  const inputClass = getInputClasses(useLiquidGlass, useDarkMode);

  const visibleTabs = TABS.filter((t) => t.id !== "game" || isAdmin);

  const tabBtn = (t: (typeof TABS)[0]) => {
    const active = t.id === activeTab;
    return (
      <button
        key={t.id}
        type="button"
        onClick={() => setActiveTab(t.id)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 text-left ${
          active
            ? useLiquidGlass
              ? useDarkMode
                ? "bg-white/20 text-white"
                : "bg-black/15 text-black"
              : useDarkMode
                ? "bg-gray-700 text-white"
                : "bg-white text-gray-900 shadow-sm"
            : `${subtextColor} hover:bg-current/8`
        }`}
      >
        <span className={active ? textColor : subtextColor}>{t.icon}</span>
        {t.label}
      </button>
    );
  };

  return (
    <div
      className={`z-0 flex w-full max-w-6xl rounded-xl overflow-hidden flex-1 ${
        animReady ? cardBg : cardBg.replace(/backdrop-blur-\S+/g, "")
      }`}
    >
      {/* ── Left sidebar ───────────────────────────────────────────────── */}
      <motion.div
        initial={hidden}
        animate={animReady ? visible : hidden}
        transition={colTransition(0.05)}
        className={`flex flex-col gap-1 p-3 w-44 shrink-0 border-r border-current/10`}
      >
        {/* Logo + title */}
        <div className="flex items-center gap-2 px-2 py-2 mb-2">
          <Bug size={15} className={subtextColor} />
          <div>
            <p className={`text-xs font-bold ${textColor} ${textShadow}`}>
              Debug
            </p>
            <p className={`text-[10px] ${subtextColor} leading-none`}>
              {isAdmin ? "Admin" : "Support"}
            </p>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-col gap-0.5">{visibleTabs.map(tabBtn)}</div>

        {/* Refresh at bottom */}
        <div className="mt-auto pt-3 border-t border-current/10">
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["debug"] })
            }
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-200 ${subtextColor} hover:bg-current/8`}
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* ── Right content area ─────────────────────────────────────────── */}
      <motion.div
        initial={hidden}
        animate={animReady ? visible : hidden}
        transition={colTransition(0.18)}
        className="flex-1 overflow-hidden relative"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute inset-0 overflow-y-auto p-4"
          >
            {activeTab === "system" && (
              <SystemTab
                textColor={textColor}
                subtextColor={subtextColor}
                panelBg={panelBg}
              />
            )}
            {activeTab === "cache" && (
              <CacheTab
                textColor={textColor}
                subtextColor={subtextColor}
                panelBg={panelBg}
                inputClass={inputClass}
              />
            )}
            {activeTab === "endpoints" && (
              <EndpointsTab
                textColor={textColor}
                subtextColor={subtextColor}
                panelBg={panelBg}
                inputClass={inputClass}
              />
            )}
            {activeTab === "game" && isAdmin && (
              <GameDataTab
                textColor={textColor}
                subtextColor={subtextColor}
                panelBg={panelBg}
              />
            )}
            {activeTab === "sight" && (
              <SightTab
                textColor={textColor}
                subtextColor={subtextColor}
                panelBg={panelBg}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
