import { useEffect, useRef, useState } from "react";
import { useDebugSettings } from "@/hooks/useDebugSettings";

export function DebugOverlay() {
  const { settings } = useDebugSettings();
  const [fps, setFps] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const lastTime = useRef<number>(performance.now());
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!settings.showFps) return;
    const loop = (now: number) => {
      const delta = now - lastTime.current;
      if (delta > 0) setFps(Math.round(1000 / delta));
      lastTime.current = now;
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [settings.showFps]);

  useEffect(() => {
    if (!settings.showScrollPos) return;
    const onScroll = () => setScrollY(Math.round(window.scrollY));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [settings.showScrollPos]);

  if (!settings.showFps && !settings.showScrollPos) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-9999 flex flex-col gap-1.5">
      {settings.showFps && fps !== null && (
        <span className="rounded-full bg-black/50 px-2.5 py-1 font-mono text-[11px] font-semibold text-green-400 backdrop-blur-md">
          {fps} fps
        </span>
      )}
      {settings.showScrollPos && (
        <span className="rounded-full bg-black/50 px-2.5 py-1 font-mono text-[11px] font-semibold text-blue-400 backdrop-blur-md">
          Y: {scrollY}px
        </span>
      )}
    </div>
  );
}

export function BreakpointOverlay() {
  const { settings } = useDebugSettings();
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    if (!settings.showBreakpointBadge) return;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [settings.showBreakpointBadge]);

  if (!settings.showBreakpointBadge) return null;

  const label =
    width >= 1536
      ? "2xl"
      : width >= 1280
        ? "xl"
        : width >= 1024
          ? "lg"
          : width >= 768
            ? "md"
            : width >= 640
              ? "sm"
              : "xs";

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-9999">
      <span className="rounded-full bg-black/50 px-2.5 py-1 font-mono text-[11px] font-semibold text-violet-300 backdrop-blur-md">
        {label} · {width}px
      </span>
    </div>
  );
}
