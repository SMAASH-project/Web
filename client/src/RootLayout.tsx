import { Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { SettingsProvider } from "./components/pages/profileDependents/settings/settingsLogic/SettingsContext";
import { NavbarProvider } from "./context/NavbarContext";
import { ColorProvider } from "./components/pages/profileDependents/settings/settingsLogic/color/ColorProvider";
import { ProfileProvider } from "@/components/forms/addNewProfile/ProfilesContext";
import { Wrapper } from "./Wrapper";

/**
 * Root layout rendered by React Router. All providers live here so every
 * route element is a guaranteed descendant of every context provider.
 */
export function RootLayout() {
  return (
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
  );
}
