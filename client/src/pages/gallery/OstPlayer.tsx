import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Music2, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download } from "lucide-react";
import { OST_TRACKS } from "./ostTracks";

function formatTime(sec: number): string {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface OstPlayerProps {
  panelBg: string;
  textColor: string;
  subtextColor: string;
  textShadow: string;
  useLiquidGlass: boolean;
  useDarkMode: boolean;
}

export function OstPlayer({
  panelBg,
  textColor,
  subtextColor,
  textShadow,
  useLiquidGlass,
  useDarkMode,
}: OstPlayerProps) {
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    audio.src = track.src;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
  }, [currentIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [isPlaying, track]);

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
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
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
            className="cursor-pointer rounded-full bg-amber-500 p-3 text-black shadow-md transition-colors hover:bg-amber-400"
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
          {track && (
            <a
              href={track.src}
              download={`${track.title}.mp3`}
              className={`${controlBtn} ${subtextColor}`}
              title={t("download")}
            >
              <Download size={18} />
            </a>
          )}
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
          className={`border-b border-current/10 px-4 py-2.5 text-[10px] font-semibold tracking-wider uppercase ${subtextColor}`}
        >
          {t("tracklist")}
        </div>
        <div className="flex flex-col">
          {OST_TRACKS.map((tr, i) => (
            <button
              key={tr.id}
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
                  {tr.title}
                </p>
                <p className={`text-xs ${subtextColor}`}>{tr.artist}</p>
              </div>
              {tr.durationLabel && (
                <span className={`shrink-0 text-xs ${subtextColor}`}>{tr.durationLabel}</span>
              )}
              <a
                href={tr.src}
                download={`${tr.title}.mp3`}
                onClick={(e) => e.stopPropagation()}
                className={`shrink-0 rounded-full p-1.5 transition-colors ${
                  useLiquidGlass
                    ? useDarkMode
                      ? "hover:bg-white/15 text-white/50 hover:text-white/80"
                      : "hover:bg-black/10 text-black/40 hover:text-black/70"
                    : useDarkMode
                      ? "hover:bg-gray-700 text-gray-500 hover:text-gray-300"
                      : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                }`}
                title={`Download ${tr.title}`}
              >
                <Download size={13} />
              </a>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
