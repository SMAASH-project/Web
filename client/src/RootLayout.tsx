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
import { Suspense } from "react";
import { MotionConfig } from "motion/react";
import { useDebugSettings } from "@/hooks/useDebugSettings";
import {
  DebugEffects,
  DebugOverlay,
  BreakpointOverlay,
  ElementInspectorOverlay,
} from "@/components/debug/DebugOverlays";

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
  const { settings } = useDebugSettings();
  const duration = SPEED_TO_MOTION[settings.animationSpeed] ?? 0.3;
  return <MotionConfig transition={{ duration }}>{children}</MotionConfig>;
}

/**
 * Root layout rendered by React Router.
 *
 * GoogleReCaptchaProvider is NOT here — it lives only inside SignUpForm so the
 * reCAPTCHA badge and script are only active on the signup page.
 */
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
                  <BreakpointOverlay />
                  <ElementInspectorOverlay />
                </MotionWrapper>
              </ProfileProvider>
            </ColorProvider>
          </NavbarProvider>
        </SettingsProvider>
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </PersistQueryClientProvider>
  );
}
