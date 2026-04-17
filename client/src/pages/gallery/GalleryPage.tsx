import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/nav/Navbar";
import { useSettings } from "@/pages/settings/SettingsContext";
import { getBackgroundClasses, getTextColor, getSubtextColor, getTextShadow } from "@/lib/utils";
import { useDebugCharactersQuery } from "@/hooks/useDebug";
import {
  Swords,
  Loader2,
  Music2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { LoadPost } from "@/animations/LoadPost";
import miVagyunkUrl from "@/assets/ostTracks/mi-vagyunk-magyar-peter.mp3?url";
import tipTipUrl from "@/assets/ostTracks/tip-tip.mp3?url";

interface OstTrack {
  id: number;
  title: string;
  artist: string;
  src: string;
  durationLabel?: string;
}

const OST_TRACKS: OstTrack[] = [
  {
    id: 1,
    title: "Mi vagyunk Magyar Péter",
    artist: "SMAASH OST",
    src: miVagyunkUrl,
  },
  {
    id: 2,
    title: "Tip Tip",
    artist: "Desh x Young Fly x Azahriah",
    src: tipTipUrl,
  },
];

type Tab = "characters" | "ost";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(sec: number): string {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── OST Player ───────────────────────────────────────────────────────────────

function OstPlayer({
  panelBg,
  textColor,
  subtextColor,
  textShadow,
  useLiquidGlass,
  useDarkMode,
}: {
  panelBg: string;
  textColor: string;
  subtextColor: string;
  textShadow: string;
  useLiquidGlass: boolean;
  useDarkMode: boolean;
}) {
  const { t } = useTranslation("gallery");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const track = OST_TRACKS[currentIdx] ?? null;

  // sync time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (!isDragging) setCurrentTime(audio.currentTime);
    };
    const onDur = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      if (currentIdx < OST_TRACKS.length - 1) {
        setCurrentIdx((i) => i + 1);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onDur);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onDur);
      audio.removeEventListener("ended", onEnd);
    };
  }, [currentIdx, isDragging]);

  // load new track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    audio.src = track.src;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
  }, [currentIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [isPlaying, track]);

  // volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  const prev = useCallback(() => {
    setCurrentIdx((i) => Math.max(0, i - 1));
    setIsPlaying(true);
  }, []);

  const next = useCallback(() => {
    setCurrentIdx((i) => Math.min(OST_TRACKS.length - 1, i + 1));
    setIsPlaying(true);
  }, []);

  const seekTo = useCallback((val: number) => {
    if (audioRef.current) audioRef.current.currentTime = val;
    setCurrentTime(val);
  }, []);

  const getPct = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  };

  const handleScrubberDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    seekTo(getPct(e) * (duration || 0));
  };
  const handleScrubberMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    seekTo(getPct(e) * (duration || 0));
  };
  const handleScrubberUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    setIsDragging(false);
    seekTo(getPct(e) * (duration || 0));
  };

  const handleVolumeDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setVolume(getPct(e));
    setMuted(false);
  };
  const handleVolumeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    setVolume(getPct(e));
    setMuted(false);
  };
  const handleVolumeUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    setVolume(getPct(e));
    setMuted(false);
  };

  const scrubberBg = useLiquidGlass
    ? useDarkMode
      ? "bg-white/15"
      : "bg-black/10"
    : useDarkMode
      ? "bg-gray-700"
      : "bg-gray-200";

  const activeBg = useLiquidGlass
    ? useDarkMode
      ? "bg-white/20"
      : "bg-black/15"
    : useDarkMode
      ? "bg-gray-700"
      : "bg-gray-100";

  const controlBtn = `p-2 rounded-full transition-colors cursor-pointer ${
    useLiquidGlass
      ? useDarkMode
        ? "hover:bg-white/15"
        : "hover:bg-black/10"
      : useDarkMode
        ? "hover:bg-gray-700"
        : "hover:bg-gray-100"
  }`;

  if (OST_TRACKS.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 opacity-50">
        <Music2 className={`h-12 w-12 ${subtextColor}`} />
        <p className={`text-sm ${subtextColor}`}>{t("noTracks")}</p>
        <p className={`max-w-64 text-center text-xs ${subtextColor} opacity-70`}>
          Add .mp3 files to <code className="font-mono">build/client/assets/music/</code> and
          register them in the OST_TRACKS list in GalleryPage.tsx
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <audio ref={audioRef} preload="metadata" />

      {/* Now playing card */}
      <div className={`flex flex-col gap-5 rounded-2xl p-6 ${panelBg}`}>
        {/* Track info */}
        <div className="flex flex-col items-center gap-1 text-center">
          <div
            className={`mb-2 flex h-20 w-20 items-center justify-center rounded-2xl ${
              useLiquidGlass
                ? useDarkMode
                  ? "bg-white/10"
                  : "bg-black/8"
                : useDarkMode
                  ? "bg-gray-700"
                  : "bg-gray-200"
            }`}
          >
            <Music2
              className={`h-8 w-8 ${isPlaying ? "text-amber-400" : subtextColor} transition-colors`}
            />
          </div>
          <p className={`text-base font-semibold ${textColor} ${textShadow}`}>
            {track?.title ?? "—"}
          </p>
          <p className={`text-xs ${subtextColor}`}>{track?.artist ?? ""}</p>
        </div>

        {/* Scrubber */}
        <div className="flex flex-col gap-1">
          <div
            className={`relative h-1.5 cursor-pointer rounded-full ${scrubberBg}`}
            onPointerDown={handleScrubberDown}
            onPointerMove={handleScrubberMove}
            onPointerUp={handleScrubberUp}
          >
            <div
              className={`absolute top-0 left-0 h-full rounded-full bg-amber-400 ${isDragging ? "" : "transition-all"}`}
              style={{
                width: `${duration ? (currentTime / duration) * 100 : 0}%`,
              }}
            />
          </div>
          <div className={`flex justify-between text-[10px] ${subtextColor}`}>
            <span>{formatTime(currentTime)}</span>
            <span>{duration ? formatTime(duration) : (track?.durationLabel ?? "—")}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <button className={controlBtn} onClick={prev} disabled={currentIdx === 0}>
            <SkipBack size={18} className={currentIdx === 0 ? "opacity-30" : textColor} />
          </button>
          <button
            className={`cursor-pointer rounded-full bg-amber-500 p-3 text-black shadow-md transition-colors hover:bg-amber-400`}
            onClick={togglePlay}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            className={controlBtn}
            onClick={next}
            disabled={currentIdx === OST_TRACKS.length - 1}
          >
            <SkipForward
              size={18}
              className={currentIdx === OST_TRACKS.length - 1 ? "opacity-30" : textColor}
            />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button className={controlBtn} onClick={() => setMuted((m) => !m)}>
            {muted || volume === 0 ? (
              <VolumeX size={14} className={subtextColor} />
            ) : (
              <Volume2 size={14} className={subtextColor} />
            )}
          </button>
          <div
            className={`relative h-1 flex-1 cursor-pointer rounded-full ${scrubberBg}`}
            onPointerDown={handleVolumeDown}
            onPointerMove={handleVolumeMove}
            onPointerUp={handleVolumeUp}
          >
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-amber-400"
              style={{ width: `${(muted ? 0 : volume) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Track list */}
      <div className={`overflow-hidden rounded-2xl ${panelBg}`}>
        <div
          className={`px-4 py-2.5 text-[10px] font-semibold tracking-wider uppercase ${subtextColor} border-b border-current/10`}
        >
          {t("tracklist")}
        </div>
        <div className="flex flex-col">
          {OST_TRACKS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => {
                setCurrentIdx(i);
                setIsPlaying(true);
              }}
              className={`flex cursor-pointer items-center gap-3 border-b border-current/5 px-4 py-3 text-left transition-colors last:border-0 ${
                i === currentIdx ? activeBg : "hover:bg-current/5"
              }`}
            >
              <span
                className={`w-5 shrink-0 text-center font-mono text-xs ${
                  i === currentIdx ? "text-amber-400" : subtextColor
                }`}
              >
                {i === currentIdx && isPlaying ? "▶" : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-medium ${i === currentIdx ? "text-amber-400" : textColor}`}
                >
                  {t.title}
                </p>
                <p className={`text-xs ${subtextColor}`}>{t.artist}</p>
              </div>
              {t.durationLabel && (
                <span className={`text-xs ${subtextColor} shrink-0`}>{t.durationLabel}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Character card ───────────────────────────────────────────────────────────

function CharacterCard({
  character,
  panelBg,
  textColor,
  subtextColor,
  animate,
  index,
}: {
  character: { id: number; name: string };
  panelBg: string;
  textColor: string;
  subtextColor: string;
  animate: boolean;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);
  const card = (
    <div
      className={`flex flex-col overflow-hidden rounded-xl ${panelBg} transition-all duration-200 hover:scale-[1.02] hover:shadow-xl`}
    >
      <div className="relative aspect-square overflow-hidden bg-black/10">
        {!imgError ? (
          <img
            src={`/api/characters/${character.id}/img`}
            alt={character.name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Swords className={`h-10 w-10 opacity-20 ${subtextColor}`} />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <p className={`truncate text-sm font-semibold ${textColor}`}>{character.name}</p>
        <span className={`shrink-0 font-mono text-[10px] opacity-40 ${subtextColor}`}>
          #{character.id}
        </span>
      </div>
    </div>
  );
  return animate ? <LoadPost index={index}>{card}</LoadPost> : <div>{card}</div>;
}

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
