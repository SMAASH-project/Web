import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/nav/Navbar";
import { useSettings } from "@/pages/settings/SettingsContext";
import { getBackgroundClasses, getTextColor, getSubtextColor, getTextShadow } from "@/lib/utils";
import { useDebugCharactersQuery } from "@/hooks/useDebug";
import { Swords, Loader2, Music2 } from "lucide-react";
import { OstPlayer } from "./OstPlayer";
import { OST_TRACKS } from "./ostTracks";
import { CharacterCard } from "./CharacterCard";

type Tab = "characters" | "ost";

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  onMouseEnter,
  icon,
  label,
  count,
  dataTab,
  useLiquidGlass,
  useDarkMode,
  textColor,
  subtextColor,
  isHovering,
}: {
  active: boolean;
  onClick: () => void;
  onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
  dataTab: string;
  useLiquidGlass: boolean;
  useDarkMode: boolean;
  textColor: string;
  subtextColor: string;
  isHovering: boolean;
}) {
  const activeClass = useLiquidGlass
    ? ""
    : useDarkMode
      ? "bg-gray-700 shadow-md"
      : "bg-gray-200 shadow-md";
  const inactiveClass = useLiquidGlass
    ? ""
    : useDarkMode
      ? "hover:bg-gray-700"
      : "hover:bg-gray-100";
  return (
    <button
      data-tab={dataTab}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`relative z-10 flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${active ? activeClass : inactiveClass}`}
    >
      <span
        className={`flex items-center gap-2 transition-opacity ${
          useLiquidGlass ? "text-white" : useDarkMode ? "text-white" : "text-gray-900"
        } ${active && !isHovering ? "opacity-100" : isHovering ? "" : "opacity-60"}`}
      >
        {icon}
        {label}
      </span>
      {count !== undefined && count > 0 && (
        <span
          className={`relative z-10 rounded-full px-1.5 py-0.5 text-[10px] transition-opacity ${
            useLiquidGlass ? "bg-white/15" : useDarkMode ? "bg-gray-600" : "bg-gray-100"
          } ${useLiquidGlass ? "text-white" : useDarkMode ? "text-white" : "text-gray-900"} ${
            active && !isHovering ? "opacity-100" : isHovering ? "" : "opacity-60"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function GalleryPage() {
  const { settings } = useSettings();
  const { useLiquidGlass, useDarkMode, useAnimations } = settings;
  const [activeTab, setActiveTab] = useState<Tab>("characters");

  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [highlightPos, setHighlightPos] = useState({ left: 0, width: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const updateHighlightToSelected = useCallback(() => {
    if (!tabContainerRef.current) return;
    const btn = tabContainerRef.current.querySelector(
      `[data-tab="${activeTab}"]`,
    ) as HTMLElement | null;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const parentRect = tabContainerRef.current.getBoundingClientRect();
      setHighlightPos({ left: rect.left - parentRect.left, width: rect.width });
    }
  }, [activeTab]);

  useEffect(() => {
    updateHighlightToSelected();
  }, [updateHighlightToSelected]);

  const handleTabMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!useLiquidGlass) return;
      setIsHovering(true);
      const rect = e.currentTarget.getBoundingClientRect();
      if (tabContainerRef.current) {
        const parentRect = tabContainerRef.current.getBoundingClientRect();
        setHighlightPos({ left: rect.left - parentRect.left, width: rect.width });
      }
    },
    [useLiquidGlass],
  );

  const handleTabContainerMouseLeave = useCallback(() => {
    if (!useLiquidGlass) return;
    setIsHovering(false);
    updateHighlightToSelected();
  }, [useLiquidGlass, updateHighlightToSelected]);

  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const subtextColor = getSubtextColor(useLiquidGlass, useDarkMode);
  const textShadow = getTextShadow(useLiquidGlass, useDarkMode);
  const panelBg = getBackgroundClasses(useLiquidGlass, useDarkMode, "light");

  const { t } = useTranslation("gallery");
  const { data: characters = [], isLoading: charsLoading } = useDebugCharactersQuery();

  const isLoading = activeTab === "characters" ? charsLoading : false;

  return (
    <div className="flex min-h-dvh w-full flex-col self-start p-4">
      <Navbar />
      <div className="z-0 mx-auto mt-20 flex w-full max-w-6xl flex-col items-center justify-start gap-6 pb-8">
        <div className="flex w-full flex-col gap-1">
          <h1 className={`text-2xl font-bold ${textColor} tracking-tight ${textShadow}`}>
            {t("title")}
          </h1>
          <p className={`text-sm ${subtextColor}`}>{t("subtitle")}</p>
        </div>

        <div
          ref={tabContainerRef}
          className={`relative flex items-center gap-1 self-start rounded-2xl p-1 ${panelBg}`}
          onMouseLeave={handleTabContainerMouseLeave}
        >
          {useLiquidGlass && (
            <div
              className={`pointer-events-none absolute rounded-lg shadow-sm transition-all duration-300 ease-out ${
                useDarkMode ? "bg-black/25 shadow-black/20" : "bg-white/25 shadow-white/20"
              }`}
              style={{
                left: `${highlightPos.left}px`,
                width: `${highlightPos.width}px`,
                top: "4px",
                bottom: "4px",
              }}
            />
          )}
          <TabButton
            active={activeTab === "characters"}
            onClick={() => setActiveTab("characters")}
            onMouseEnter={handleTabMouseEnter}
            dataTab="characters"
            icon={<Swords size={14} />}
            label={t("tabs.characters")}
            count={characters.length}
            useLiquidGlass={useLiquidGlass}
            useDarkMode={useDarkMode}
            textColor={textColor}
            subtextColor={subtextColor}
            isHovering={isHovering}
          />
          <TabButton
            active={activeTab === "ost"}
            onClick={() => setActiveTab("ost")}
            onMouseEnter={handleTabMouseEnter}
            dataTab="ost"
            icon={<Music2 size={14} />}
            label={t("tabs.ost")}
            count={OST_TRACKS.length || undefined}
            useLiquidGlass={useLiquidGlass}
            useDarkMode={useDarkMode}
            textColor={textColor}
            subtextColor={subtextColor}
            isHovering={isHovering}
          />
        </div>

        {activeTab === "ost" ? (
          <OstPlayer
            panelBg={panelBg}
            textColor={textColor}
            subtextColor={subtextColor}
            textShadow={textShadow}
            useLiquidGlass={useLiquidGlass}
            useDarkMode={useDarkMode}
          />
        ) : isLoading ? (
          <div className="flex w-full items-center justify-center py-24">
            <Loader2 className={`h-6 w-6 animate-spin ${subtextColor}`} />
          </div>
        ) : activeTab === "characters" ? (
          characters.length === 0 ? (
            <div className="mt-16 flex flex-col items-center justify-center gap-3 opacity-50">
              <Swords className={`h-12 w-12 ${subtextColor}`} />
              <p className={`text-sm ${subtextColor}`}>{t("noCharacters")}</p>
            </div>
          ) : (
            <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {characters.map((c, i) => (
                <CharacterCard
                  key={c.id}
                  character={c}
                  panelBg={panelBg}
                  textColor={textColor}
                  subtextColor={subtextColor}
                  animate={useAnimations}
                  index={i}
                />
              ))}
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}
