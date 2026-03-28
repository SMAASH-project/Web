import { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "@/components/nav/Navbar";
import { useSettings } from "@/pages/settings/SettingsContext";
import {
  getBackgroundClasses,
  getTextColor,
  getSubtextColor,
  getTextShadow,
} from "@/lib/utils";
import { useDebugCharactersQuery } from "@/hooks/useDebug";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import {
  Images,
  Swords,
  Paintbrush,
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

// ─── OST track list ───────────────────────────────────────────────────────────
// Place audio files in your Go server's static build directory:
//   build/client/assets/music/<filename>
// Then add entries below.  The `src` is resolved relative to the served origin.

interface OstTrack {
  id: number;
  title: string;
  artist: string;
  src: string; // e.g. "/assets/music/main-theme.mp3"
  durationLabel?: string; // optional static label shown before audio loads
}

const OST_TRACKS: OstTrack[] = [
  // ── Add your tracks here ─────────────────────────────────────────────────
  // { id: 1, title: "Main Theme", artist: "SMAASH OST", src: "/assets/music/main-theme.mp3" },
  // { id: 2, title: "Battle Arena", artist: "SMAASH OST", src: "/assets/music/battle-arena.mp3" },
];

// ─── DTOs ─────────────────────────────────────────────────────────────────────

interface ItemReadDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  rarity: string;
  categories: string[];
}

const RARITY_COLORS: Record<string, string> = {
  Common: "#9ca3af",
  Uncommon: "#10b981",
  Rare: "#3b82f6",
  Epic: "#8b5cf6",
  Legendary: "#f59e0b",
};

type Tab = "characters" | "skins" | "ost";

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
        <Music2 className={`w-12 h-12 ${subtextColor}`} />
        <p className={`text-sm ${subtextColor}`}>No tracks yet</p>
        <p
          className={`text-xs text-center max-w-64 ${subtextColor} opacity-70`}
        >
          Add .mp3 files to{" "}
          <code className="font-mono">build/client/assets/music/</code> and
          register them in the OST_TRACKS list in GalleryPage.tsx
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      <audio ref={audioRef} preload="metadata" />

      {/* Now playing card */}
      <div className={`rounded-2xl p-6 flex flex-col gap-5 ${panelBg}`}>
        {/* Track info */}
        <div className="flex flex-col items-center gap-1 text-center">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-2 ${
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
              className={`w-8 h-8 ${isPlaying ? "text-amber-400" : subtextColor} transition-colors`}
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
            className={`relative h-1.5 rounded-full cursor-pointer ${scrubberBg}`}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seekTo(pct * (duration || 0));
            }}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-amber-400 transition-all"
              style={{
                width: `${duration ? (currentTime / duration) * 100 : 0}%`,
              }}
            />
          </div>
          <div className={`flex justify-between text-[10px] ${subtextColor}`}>
            <span>{formatTime(currentTime)}</span>
            <span>
              {duration ? formatTime(duration) : (track?.durationLabel ?? "—")}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <button
            className={controlBtn}
            onClick={prev}
            disabled={currentIdx === 0}
          >
            <SkipBack
              size={18}
              className={currentIdx === 0 ? "opacity-30" : textColor}
            />
          </button>
          <button
            className={`p-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black transition-colors cursor-pointer shadow-md`}
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
              className={
                currentIdx === OST_TRACKS.length - 1 ? "opacity-30" : textColor
              }
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
            className={`relative flex-1 h-1 rounded-full cursor-pointer ${scrubberBg}`}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setVolume(
                Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
              );
              setMuted(false);
            }}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-amber-400"
              style={{ width: `${(muted ? 0 : volume) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Track list */}
      <div className={`rounded-2xl overflow-hidden ${panelBg}`}>
        <div
          className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider ${subtextColor} border-b border-current/10`}
        >
          Tracklist
        </div>
        <div className="flex flex-col">
          {OST_TRACKS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => {
                setCurrentIdx(i);
                setIsPlaying(true);
              }}
              className={`flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer border-b border-current/5 last:border-0 ${
                i === currentIdx ? activeBg : "hover:bg-current/5"
              }`}
            >
              <span
                className={`text-xs font-mono w-5 text-center shrink-0 ${
                  i === currentIdx ? "text-amber-400" : subtextColor
                }`}
              >
                {i === currentIdx && isPlaying ? "▶" : i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${i === currentIdx ? "text-amber-400" : textColor}`}
                >
                  {t.title}
                </p>
                <p className={`text-xs ${subtextColor}`}>{t.artist}</p>
              </div>
              {t.durationLabel && (
                <span className={`text-xs ${subtextColor} shrink-0`}>
                  {t.durationLabel}
                </span>
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
      className={`rounded-xl overflow-hidden flex flex-col ${panelBg} transition-all duration-200 hover:scale-[1.02] hover:shadow-xl`}
    >
      <div className="relative aspect-square bg-black/10 overflow-hidden">
        {!imgError ? (
          <img
            src={`/api/characters/${character.id}/img`}
            alt={character.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Swords className={`w-10 h-10 opacity-20 ${subtextColor}`} />
          </div>
        )}
      </div>
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <p className={`text-sm font-semibold truncate ${textColor}`}>
          {character.name}
        </p>
        <span
          className={`text-[10px] font-mono shrink-0 opacity-40 ${subtextColor}`}
        >
          #{character.id}
        </span>
      </div>
    </div>
  );
  return animate ? (
    <LoadPost index={index}>{card}</LoadPost>
  ) : (
    <div>{card}</div>
  );
}

// ─── Skin card ────────────────────────────────────────────────────────────────

function SkinCard({
  item,
  panelBg,
  textColor,
  subtextColor,
  animate,
  index,
}: {
  item: ItemReadDTO;
  panelBg: string;
  textColor: string;
  subtextColor: string;
  animate: boolean;
  index: number;
}) {
  const rarityColor = RARITY_COLORS[item.rarity] ?? "#9ca3af";
  const card = (
    <div
      className={`rounded-xl overflow-hidden flex flex-col ${panelBg} transition-all duration-200 hover:scale-[1.02] hover:shadow-xl`}
      style={{ boxShadow: `inset 0 0 0 1px ${rarityColor}30` }}
    >
      <div className="h-1" style={{ backgroundColor: rarityColor }} />
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold leading-tight ${textColor}`}>
            {item.name}
          </p>
          <span
            className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full shrink-0"
            style={{
              backgroundColor: `${rarityColor}20`,
              color: rarityColor,
              border: `1px solid ${rarityColor}40`,
            }}
          >
            {item.rarity}
          </span>
        </div>
        <p
          className={`text-xs leading-relaxed line-clamp-2 opacity-60 ${subtextColor}`}
        >
          {item.description}
        </p>
      </div>
    </div>
  );
  return animate ? (
    <LoadPost index={index}>{card}</LoadPost>
  ) : (
    <div>{card}</div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
  useLiquidGlass,
  useDarkMode,
  textColor,
  subtextColor,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
  useLiquidGlass: boolean;
  useDarkMode: boolean;
  textColor: string;
  subtextColor: string;
}) {
  const activeClass = useLiquidGlass
    ? useDarkMode
      ? "bg-white/20 border border-white/25"
      : "bg-black/12 border border-black/15"
    : useDarkMode
      ? "bg-gray-700 border border-gray-600"
      : "bg-white border border-gray-200 shadow-sm";
  const inactiveClass = useLiquidGlass
    ? "bg-transparent border border-transparent hover:bg-white/8"
    : useDarkMode
      ? "bg-transparent border border-transparent hover:bg-gray-800"
      : "bg-transparent border border-transparent hover:bg-white/60";
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active ? `${activeClass} ${textColor}` : `${inactiveClass} ${subtextColor}`}`}
    >
      {icon}
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full ${useLiquidGlass ? "bg-white/15" : useDarkMode ? "bg-gray-600" : "bg-gray-100"}`}
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

  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const subtextColor = getSubtextColor(useLiquidGlass, useDarkMode);
  const textShadow = getTextShadow(useLiquidGlass, useDarkMode);
  const panelBg = getBackgroundClasses(useLiquidGlass, useDarkMode, "light");

  const { data: characters = [], isLoading: charsLoading } =
    useDebugCharactersQuery();

  const { data: skins = [], isLoading: skinsLoading } = useQuery<ItemReadDTO[]>(
    {
      queryKey: ["gallery", "skins"],
      queryFn: async () => {
        const { data } = await apiClient.get<ItemReadDTO[]>("/items", {
          params: { page: 1, page_size: 100 },
        });
        return (data ?? []).filter((item) => item.categories.includes("Skin"));
      },
      staleTime: 5 * 60 * 1000,
    },
  );

  const isLoading =
    activeTab === "characters"
      ? charsLoading
      : activeTab === "skins"
        ? skinsLoading
        : false;

  return (
    <div className="p-4 min-h-screen w-full self-start flex flex-col">
      <Navbar />
      <div className="mt-20 z-0 flex flex-col items-center justify-start gap-6 w-full max-w-6xl mx-auto pb-8">
        <div className="flex flex-col gap-1 w-full">
          <h1
            className={`text-2xl font-bold ${textColor} tracking-tight ${textShadow}`}
          >
            Gallery
          </h1>
          <p className={`text-sm ${subtextColor}`}>
            Characters, skins, and original soundtrack
          </p>
        </div>

        <div
          className={`flex items-center gap-1 p-1 rounded-2xl self-start ${panelBg}`}
        >
          <TabButton
            active={activeTab === "characters"}
            onClick={() => setActiveTab("characters")}
            icon={<Swords size={14} />}
            label="Characters"
            count={characters.length}
            useLiquidGlass={useLiquidGlass}
            useDarkMode={useDarkMode}
            textColor={textColor}
            subtextColor={subtextColor}
          />
          <TabButton
            active={activeTab === "skins"}
            onClick={() => setActiveTab("skins")}
            icon={<Paintbrush size={14} />}
            label="Skins"
            count={skins.length}
            useLiquidGlass={useLiquidGlass}
            useDarkMode={useDarkMode}
            textColor={textColor}
            subtextColor={subtextColor}
          />
          <TabButton
            active={activeTab === "ost"}
            onClick={() => setActiveTab("ost")}
            icon={<Music2 size={14} />}
            label="OST"
            count={OST_TRACKS.length || undefined}
            useLiquidGlass={useLiquidGlass}
            useDarkMode={useDarkMode}
            textColor={textColor}
            subtextColor={subtextColor}
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
          <div className="flex items-center justify-center w-full py-24">
            <Loader2 className={`w-6 h-6 animate-spin ${subtextColor}`} />
          </div>
        ) : activeTab === "characters" ? (
          characters.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 mt-16 opacity-50">
              <Swords className={`w-12 h-12 ${subtextColor}`} />
              <p className={`text-sm ${subtextColor}`}>No characters yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
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
        ) : skins.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 mt-16 opacity-50">
            <Paintbrush className={`w-12 h-12 ${subtextColor}`} />
            <p className={`text-sm ${subtextColor}`}>No skins yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {skins.map((item, i) => (
              <SkinCard
                key={item.id}
                item={item}
                panelBg={panelBg}
                textColor={textColor}
                subtextColor={subtextColor}
                animate={useAnimations}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
