import { Outlet } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { AuthProvider } from "./context/AuthProvider";
import { SecurityKeyProvider } from "./context/SecurityKeyProvider";
import { SettingsProvider } from "@/pages/settings/SettingsContext";
import { NavbarProvider } from "./context/NavbarContext";
import { ColorProvider } from "@/pages/settings/ColorProvider";
import { ProfileProvider } from "@/pages/profile-selector/ProfilesContext";
import { Wrapper } from "./Wrapper";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { MotionConfig } from "motion/react";
import { useDebugSettings } from "@/hooks/useDebugSettings";
import { useSettings } from "@/pages/settings/SettingsContext";
import { DebugEffects } from "@/components/debug/DebugEffects";
import { DebugOverlay, BreakpointOverlay } from "@/components/debug/DebugBadges";
import { ElementInspectorOverlay } from "@/components/debug/ElementInspectorOverlay";

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

const SPEED_TO_MOTION: Record<number, number> = {
  0.25: 2,
  0.5: 0.8,
  1: 0.3,
  2: 0.1,
  4: 0.05,
};

function MotionWrapper({ children }: { children: React.ReactNode }) {
  const { settings: dbg } = useDebugSettings();
  const { settings } = useSettings();
  const duration = SPEED_TO_MOTION[dbg.animationSpeed] ?? 0.3;
  const noMotion = !settings.useAnimations || dbg.forceReducedMotion;
  return (
    <MotionConfig transition={{ duration }} reducedMotion={noMotion ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}

/**
 * Root layout rendered by React Router.
 *
 * GoogleReCaptchaProvider is NOT here — it lives only inside SignUpForm so the
 * reCAPTCHA badge and script are only active on the signup page.
 */
export function RootLayout() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <AuthProvider>
        <SecurityKeyProvider>
          <SettingsProvider>
            <NavbarProvider>
              <ColorProvider>
                <ProfileProvider>
                  <MotionWrapper>
                    <Wrapper>
                      <Suspense
                        fallback={
                          <div className="flex min-h-dvh items-center justify-center">
                            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-white"></div>
                          </div>
                        }
                      >
                        <Outlet />
                      </Suspense>
                    </Wrapper>
                    <Toaster />
                    {import.meta.env.DEV && (
                      <>
                        <DebugEffects />
                        <DebugOverlay />
                        <BreakpointOverlay />
                        <ElementInspectorOverlay />
                      </>
                    )}
                  </MotionWrapper>
                </ProfileProvider>
              </ColorProvider>
            </NavbarProvider>
          </SettingsProvider>
        </SecurityKeyProvider>
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </PersistQueryClientProvider>
  );
}
