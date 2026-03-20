import { Outlet } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { AuthProvider } from "./context/AuthProvider";
import { SettingsProvider } from "./components/pages/profileDependents/settings/settingsLogic/SettingsContext";
import { NavbarProvider } from "./context/NavbarContext";
import { ColorProvider } from "./components/pages/profileDependents/settings/settingsLogic/color/ColorProvider";
import { ProfileProvider } from "@/components/forms/addNewProfile/ProfilesContext";
import { Wrapper } from "./Wrapper";
import { Suspense } from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

/**
 * Create a single QueryClient instance for the entire app.
 * This is initialized outside the component to avoid recreating it on every render.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes (reduced from 5)
      gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection)
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

/**
 * Create a persister for localStorage caching.
 * This enables offline support and faster app startup.
 */
const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

const RECAPTCHA_SITE_KEY = "6LeA2IQsAAAAAAK7ljf7tDqBjwR_rm5uDAzGbr8S";

/**
 * Root layout rendered by React Router. All providers live here so every
 * route element is a guaranteed descendant of every context provider.
 *
 * GoogleReCaptchaProvider is placed here (once, at the root) so the reCAPTCHA
 * script is loaded a single time for the whole app lifetime. Placing it inside
 * a form component caused it to remount on every keystroke re-render, which
 * triggered a flood of /reload and /clr requests to Google's servers.
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
                <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
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
                </GoogleReCaptchaProvider>
              </ProfileProvider>
            </ColorProvider>
          </NavbarProvider>
        </SettingsProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}
