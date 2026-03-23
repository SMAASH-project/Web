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
              </ProfileProvider>
            </ColorProvider>
          </NavbarProvider>
        </SettingsProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}
