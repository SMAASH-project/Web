import { useContext } from "react";
import { useSettings } from "../pages/profileDependents/settings/settingsLogic/SettingsContext";
import { NavMenu } from "./NavMenu";
import AccountMenu from "./AccountMenu";
import { MobileNavMenu } from "./MobileNavMenu";
import { useProfiles } from "../forms/addNewProfile/useProfiles";
import { Link, useNavigate } from "react-router";
import { useMediaQuery } from "./navLogic/useMediaQuery";
import { useLogoutMutation } from "@/hooks/useQueryHooks";
import { AuthContext } from "@/context/AuthContext";
import {
  getBackgroundClasses,
  getSubtextColor,
  getTextColor,
  getTextShadow,
} from "@/lib/utils";

const Navbar = () => {
  const { settings } = useSettings();
  const { selectedProfile } = useProfiles();
  const username = selectedProfile?.name ?? "PlaceholderUserName";
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const navigate = useNavigate();
  const { setIsLoggedIn, setUserId, setIsAdmin } = useContext(AuthContext);
  const logoutMutation = useLogoutMutation();
  const navBackground = getBackgroundClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
    "light",
  );
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const subtextColor = getSubtextColor(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const textShadow = getTextShadow(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      console.log("Logout successful");
      setIsLoggedIn(false);
      setUserId(null);
      setIsAdmin(false);
      navigate("/app/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav
      className={`absolute top-0 left-0 right-0 flex justify-between items-center p-4 max-w-full w-full border-b border-transparent z-50 ${navBackground}`}
      style={{
        borderBottomColor: "var(--theme-nav-border)",
        boxShadow: "0 8px 18px -14px var(--theme-nav-shadow)",
      }}
    >
      {isDesktop ? (
        <>
          {/* Desktop layout — left/right have equal min-width so center stays centered */}
          <div className="flex-1 min-w-0"></div>
          <div className="shrink-0">
            <NavMenu
              useLiquidGlass={settings.useLiquidGlass}
              useDarkMode={settings.useDarkMode}
            />
          </div>
          <div className="flex-1 min-w-0 flex justify-end items-center gap-2 lg:gap-4 overflow-hidden">
            <span
              className={`whitespace-nowrap truncate ${textColor} ${textShadow}`}
            >
              <span className={`hidden xl:inline ${subtextColor}`}>
                Logged in as{" "}
              </span>
              <Link to="/app/profile/" className="hidden lg:inline">
                {username}
              </Link>
            </span>
            <div className="shrink-0">
              <AccountMenu />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Mobile layout */}
          <MobileNavMenu
            useLiquidGlass={settings.useLiquidGlass}
            useDarkMode={settings.useDarkMode}
            username={username}
            onLogout={handleLogout}
          />
          <span
            className={`text-sm truncate max-w-[50vw] ${textColor} ${textShadow}`}
          >
            <Link to="/app/profile/">{username}</Link>
          </span>
          {/* Account options are in the mobile drawer */}
          <div />
        </>
      )}
    </nav>
  );
};

export default Navbar;
