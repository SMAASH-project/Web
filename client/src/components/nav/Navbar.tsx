import { Label } from "@radix-ui/react-dropdown-menu";
import { useSettings } from "../pages/profileDependents/settings/settingsLogic/SettingsContext";
import { NavMenu } from "./NavMenu";
import AccountMenu from "./AccountMenu";
import { MobileNavMenu } from "./MobileNavMenu";
import { useProfiles } from "../forms/addNewProfile/useProfiles";
import { Link, useNavigate } from "react-router";
import { useMediaQuery } from "./navLogic/useMediaQuery";
import { apiLogout } from "@/hooks/useApi";

const Navbar = () => {
  const { settings } = useSettings();
  const { selectedProfile } = useProfiles();
  const username = selectedProfile?.name ?? "PlaceholderUserName";
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { ok } = await apiLogout();
      if (ok) {
        console.log("Logout successful");
        navigate("/app/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav
      className={`absolute top-0 left-0 right-0 flex justify-between items-center p-4 max-w-full w-full border-b-2 z-50 ${
        settings.useLiquidGlass
          ? "bg-white/30 backdrop-blur-lg border-white/30 shadow-sm shadow-white/20"
          : "bg-linear-to-b from-gray-700 to-gray-500 [border-image:linear-gradient(to_right,var(--color-green-400),var(--color-green-600))_1]"
      }`}
    >
      {isDesktop ? (
        <>
          {/* Desktop layout — left/right have equal min-width so center stays centered */}
          <div className="flex-1 min-w-0"></div>
          <div className="shrink-0">
            <NavMenu useLiquidGlass={settings.useLiquidGlass} />
          </div>
          <div className="flex-1 min-w-0 flex justify-end items-center gap-2 lg:gap-4 overflow-hidden">
            <Label
              className={`text-white whitespace-nowrap truncate ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""}`}
            >
              <span className="hidden xl:inline">Logged in as </span>
              <Link to="/app/profile/" className="hidden lg:inline">
                {username}
              </Link>
            </Label>
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
            username={username}
            onLogout={handleLogout}
          />
          <Label
            className={`text-white text-sm truncate max-w-[50vw] ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""}`}
          >
            <Link to="/app/profile/">{username}</Link>
          </Label>
          {/* Account options are in the mobile drawer */}
          <div />
        </>
      )}
    </nav>
  );
};

export default Navbar;
