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

/**
 * Create a single QueryClient instance for the entire app.
 * This is initialized outside the component to avoid recreating it on every render.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection)
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 1,
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

/**
 * Root layout rendered by React Router. All providers live here so every
 * route element is a guaranteed descendant of every context provider.
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
                  <Outlet />
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
