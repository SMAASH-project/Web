import { Outlet } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { AuthProvider } from "./context/AuthProvider";
import { SettingsProvider } from "@/pages/settings/SettingsContext";
import { NavbarProvider } from "./context/NavbarContext";
import { ColorProvider } from "@/pages/settings/ColorProvider";
import { ProfileProvider } from "@/pages/profile-selector/ProfilesContext";
import { Wrapper } from "./Wrapper";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import { useDebugSettings } from "@/hooks/useDebugSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      networkMode: "online",
    },
    mutations: {
      retry: 1,
      networkMode: "online",
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

const SPEED_TO_MOTION: Record<number, number> = { 0.25: 2, 0.5: 0.8, 1: 0.3, 2: 0.1, 4: 0.05 };

const INSPECTOR_PROPS = [
  "display", "position", "width", "height",
  "color", "backgroundColor", "fontSize",
  "fontWeight", "zIndex", "opacity", "borderRadius",
] as const;

type InspectorProp = typeof INSPECTOR_PROPS[number];

interface HoverTarget {
  tag: string;
  id: string;
  classes: string[];
  css: Record<InspectorProp, string>;
  x: number;
  y: number;
}

const CARD_W = 240;
const CARD_H = 300;
const CARD_OFFSET = 14;
const SPEED_TO_CSS: Record<number, number> = { 0.25: 3, 0.5: 1.5, 2: 0.075, 4: 0.03 };

function DebugEffects() {
  const { settings } = useDebugSettings();

  useEffect(() => {
    document.body.classList.toggle("debug-no-blur", settings.noBackdropBlur);
  }, [settings.noBackdropBlur]);

  useEffect(() => {
    document.body.classList.toggle("debug-layout", settings.layoutBorders);
  }, [settings.layoutBorders]);

  useEffect(() => {
    const tag = document.getElementById("debug-speed");
    const duration = SPEED_TO_CSS[settings.animationSpeed];
    if (!duration) {
      tag?.remove();
      return;
    }
    const style = tag ?? document.createElement("style");
    style.id = "debug-speed";
    style.textContent = `* { transition-duration: ${duration}s !important; }`;
    if (!tag) document.head.appendChild(style);
  }, [settings.animationSpeed]);

  return null;
}

function DebugOverlay() {
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
    <div className="fixed bottom-4 left-4 z-9999 flex flex-col gap-1.5 pointer-events-none">
      {settings.showFps && fps !== null && (
        <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full backdrop-blur-md bg-black/50 text-green-400">
          {fps} fps
        </span>
      )}
      {settings.showScrollPos && (
        <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full backdrop-blur-md bg-black/50 text-blue-400">
          Y: {scrollY}px
        </span>
      )}
    </div>
  );
}

function ElementInspectorOverlay() {
  const { settings } = useDebugSettings();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<HoverTarget | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = e.target as Element;
    if (overlayRef.current?.contains(el) || el === overlayRef.current) return;

    const cs = window.getComputedStyle(el);
    const css = {} as Record<InspectorProp, string>;
    for (const prop of INSPECTOR_PROPS) {
      css[prop] = cs.getPropertyValue(prop.replace(/([A-Z])/g, "-$1").toLowerCase());
    }

    setTarget({
      tag: el.tagName.toLowerCase(),
      id: el.id,
      classes: Array.from(el.classList).slice(0, 6),
      css,
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const handleMouseLeave = useCallback(() => setTarget(null), []);

  useEffect(() => {
    if (!settings.elementInspector) { setTarget(null); return; }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [settings.elementInspector, handleMouseMove, handleMouseLeave]);

  if (!settings.elementInspector || !target) return null;

  const flipX = target.x + CARD_OFFSET + CARD_W > window.innerWidth;
  const flipY = target.y + CARD_OFFSET + CARD_H > window.innerHeight;
  const left = flipX ? target.x - CARD_W - CARD_OFFSET : target.x + CARD_OFFSET;
  const top  = flipY ? target.y - CARD_H - CARD_OFFSET : target.y + CARD_OFFSET;

  return (
    <div
      ref={overlayRef}
      data-element-inspector="true"
      className="fixed z-9999 pointer-events-none"
      style={{ left, top }}
    >
      <div className="rounded-xl backdrop-blur-md bg-black/75 border border-white/10 p-3 w-60 flex flex-col gap-1.5 shadow-xl">
        <div className="flex items-baseline gap-1.5 border-b border-white/10 pb-1.5">
          <span className="text-[11px] font-mono font-bold text-violet-300">&lt;{target.tag}&gt;</span>
          {target.id && <span className="text-[10px] font-mono text-amber-300 truncate">#{target.id}</span>}
        </div>
        {target.classes.length > 0 && (
          <div className="flex flex-wrap gap-1 border-b border-white/10 pb-1.5">
            {target.classes.map((c) => (
              <span key={c} className="text-[9px] font-mono px-1 py-0.5 rounded bg-white/10 text-white/70 truncate max-w-40">.{c}</span>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          {INSPECTOR_PROPS.map((prop) => (
            <div key={prop} className="flex justify-between gap-2 items-baseline">
              <span className="text-[9px] text-white/40 shrink-0">{prop.replace(/([A-Z])/g, "-$1").toLowerCase()}</span>
              <span className="text-[9px] font-mono text-white/80 truncate text-right max-w-30">{target.css[prop] || "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Root layout rendered by React Router.
 *
 * GoogleReCaptchaProvider is NOT here — it lives only inside SignUpForm so the
 * reCAPTCHA badge and script are only active on the signup page.
 */
function MotionWrapper({ children }: { children: React.ReactNode }) {
  const { settings } = useDebugSettings();
  const duration = SPEED_TO_MOTION[settings.animationSpeed] ?? 0.3;
  return (
    <MotionConfig transition={{ duration }}>
      {children}
    </MotionConfig>
  );
}

export function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <AuthProvider>
        <SettingsProvider>
          <NavbarProvider>
            <ColorProvider>
              <ProfileProvider>
                <MotionWrapper>
                  <Wrapper>
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center min-h-screen">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                        </div>
                      }
                    >
                      <Outlet />
                    </Suspense>
                  </Wrapper>
                  <Toaster />
                  <DebugEffects />
                  <DebugOverlay />
                  <ElementInspectorOverlay />
                </MotionWrapper>
              </ProfileProvider>
            </ColorProvider>
          </NavbarProvider>
        </SettingsProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}
