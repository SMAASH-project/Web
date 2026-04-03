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
  Smartphone,
  Activity,
  Menu,
  X,
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
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SystemTab } from "./tabs/SystemTab";
import { CacheTab } from "./tabs/CacheTab";
import { EndpointsTab } from "./tabs/EndpointsTab";
import { GameDataTab } from "./tabs/GameDataTab";
import { SightTab } from "./tabs/SightTab";

// ─── Tab definition ───────────────────────────────────────────────────────────

type Tab = "system" | "cache" | "endpoints" | "game" | "visual" | "emulation" | "diagnostics";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "system", label: "System", icon: <Monitor size={14} /> },
  { id: "endpoints", label: "Endpoints", icon: <Terminal size={14} /> },
  { id: "cache", label: "Cache", icon: <Database size={14} /> },
  { id: "game", label: "Game Data", icon: <Gamepad2 size={14} /> },
  { id: "visual", label: "Visual", icon: <Eye size={14} /> },
  { id: "emulation", label: "Emulation", icon: <Smartphone size={14} /> },
  { id: "diagnostics", label: "Diagnostics", icon: <Activity size={14} /> },
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

export function DebugPageContent({ animReady = true }: { animReady?: boolean }) {
  const { settings } = useSettings();
  const { useLiquidGlass, useDarkMode, useAnimations } = settings;
  const { isAdmin, isSupport } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { t } = useTranslation("debug");
  const [activeTab, setActiveTab] = useState<Tab>("system");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const cardBg = getBackgroundClasses(useLiquidGlass, useDarkMode);
  const panelBg = getBackgroundClasses(useLiquidGlass, useDarkMode, "light");
  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const subtextColor = getSubtextColor(useLiquidGlass, useDarkMode);
  const textShadow = getTextShadow(useLiquidGlass, useDarkMode);
  const inputClass = getInputClasses(useLiquidGlass, useDarkMode);

  const visibleTabs = TABS.filter((t) => t.id !== "game" || isAdmin);

  const tabBtn = (tab: (typeof TABS)[0]) => {
    const active = tab.id === activeTab;
    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => setActiveTab(tab.id)}
        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition-all duration-200 ${
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
        <span className={active ? textColor : subtextColor}>{tab.icon}</span>
        {t(`tabs.${tab.id}`)}
      </button>
    );
  };

  // ── Shared sidebar content (used in both animated and static branches) ──────
  const sidebarContent = (
    <>
      {/* Logo + title */}
      <div className="mb-2 flex items-center gap-2 px-2 py-2">
        <Bug size={15} className={subtextColor} />
        <div>
          <p className={`text-xs font-bold ${textColor} ${textShadow}`}>{t("title")}</p>
          <p className={`text-[10px] ${subtextColor} leading-none`}>
            {isAdmin ? t("roles.admin") : t("roles.support")}
          </p>
        </div>
      </div>

      {/* Tab buttons */}
      <div className="flex flex-col gap-0.5">{visibleTabs.map(tabBtn)}</div>

      {/* Refresh at bottom */}
      <div className="mt-auto border-t border-current/10 pt-3">
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["debug"] })}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-all duration-200 ${subtextColor} hover:bg-current/8`}
        >
          <RefreshCw size={13} />
          {t("refresh")}
        </button>
      </div>
    </>
  );

  // ── Shared tab content ───────────────────────────────────────────────────────
  const tabContent = (
    <>
      {activeTab === "system" && (
        <SystemTab textColor={textColor} subtextColor={subtextColor} panelBg={panelBg} />
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
          bgClass={cardBg}
        />
      )}
      {activeTab === "game" && isAdmin && (
        <GameDataTab textColor={textColor} subtextColor={subtextColor} panelBg={panelBg} />
      )}
      {activeTab === "visual" && (
        <SightTab
          textColor={textColor}
          subtextColor={subtextColor}
          panelBg={panelBg}
          inputClass={inputClass}
          bgClass={cardBg}
          mode="visual"
        />
      )}
      {activeTab === "emulation" && (
        <SightTab
          textColor={textColor}
          subtextColor={subtextColor}
          panelBg={panelBg}
          inputClass={inputClass}
          bgClass={cardBg}
          mode="emulation"
        />
      )}
      {activeTab === "diagnostics" && (
        <SightTab
          textColor={textColor}
          subtextColor={subtextColor}
          panelBg={panelBg}
          inputClass={inputClass}
          bgClass={cardBg}
          mode="diagnostics"
        />
      )}
    </>
  );

  return (
    <div
      className={`z-0 flex w-full max-w-6xl flex-1 flex-col overflow-hidden rounded-xl md:flex-row ${
        animReady ? cardBg : cardBg.replace(/backdrop-blur-\S+/g, "")
      }`}
    >
      {/* ── Mobile hamburger + drawer ────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-current/10 p-3 md:hidden">
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetTrigger asChild>
            <button
              className={`rounded-lg p-1.5 transition-colors ${subtextColor} hover:bg-current/8`}
            >
              <Menu size={18} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className={`w-52 p-0 ${cardBg}`}>
            <div className="flex h-full flex-col gap-1 p-3">
              {/* Logo */}
              <div className="mb-2 flex items-center gap-2 px-2 py-2">
                <Bug size={15} className={subtextColor} />
                <div>
                  <p className={`text-xs font-bold ${textColor} ${textShadow}`}>{t("title")}</p>
                  <p className={`text-[10px] ${subtextColor} leading-none`}>
                    {isAdmin ? t("roles.admin") : t("roles.support")}
                  </p>
                </div>
              </div>

              {/* Tab buttons */}
              <div className="flex flex-col gap-0.5">
                {visibleTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setDrawerOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition-all duration-200 ${
                      tab.id === activeTab
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
                    <span className={tab.id === activeTab ? textColor : subtextColor}>
                      {tab.icon}
                    </span>
                    {t(`tabs.${tab.id}`)}
                  </button>
                ))}
              </div>

              {/* Refresh at bottom */}
              <div className="mt-auto border-t border-current/10 pt-3">
                <button
                  onClick={() => {
                    queryClient.invalidateQueries({ queryKey: ["debug"] });
                    setDrawerOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-all duration-200 ${subtextColor} hover:bg-current/8`}
                >
                  <RefreshCw size={13} />
                  {t("refresh")}
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Title on mobile */}
        <div>
          <p className={`text-sm font-bold ${textColor} ${textShadow}`}>{t("title")}</p>
        </div>
      </div>

      {/* ── Desktop sidebar (hidden on mobile) ──────────────────────────── */}
      {useAnimations ? (
        <motion.div
          initial={hidden}
          animate={animReady ? visible : hidden}
          transition={colTransition(0.05)}
          className="hidden w-44 shrink-0 flex-col gap-1 border-r border-current/10 p-3 md:flex"
        >
          {sidebarContent}
        </motion.div>
      ) : (
        <div className="hidden w-44 shrink-0 flex-col gap-1 border-r border-current/10 p-3 md:flex">
          {sidebarContent}
        </div>
      )}

      {/* ── Content area (responsive) ──────────────────────────────────── */}
      {useAnimations ? (
        <motion.div
          initial={hidden}
          animate={animReady ? visible : hidden}
          transition={colTransition(0.18)}
          className="relative flex-1 overflow-hidden"
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
              {tabContent}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 overflow-y-auto p-4">{tabContent}</div>
        </div>
      )}
    </div>
  );
}
