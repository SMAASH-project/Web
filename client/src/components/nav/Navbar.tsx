import { useContext } from "react";
import { useSettings } from "@/pages/settings/SettingsContext";
import { NavMenu } from "./NavMenu";
import AccountMenu from "./AccountMenu";
import { MobileNavMenu } from "./MobileNavMenu";
import { useProfiles } from "@/pages/profile-selector/useProfiles";
import { Link, useNavigate } from "react-router-dom";
import { useMediaQuery } from "./navLogic/useMediaQuery";
import { useLogoutMutation } from "@/hooks/useQueryHooks";
import { AuthContext } from "@/context/AuthContext";
import { ShieldAlert, Bug } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getBackgroundClasses,
  getButtonClasses,
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
  const {
    setIsLoggedIn,
    setUserId,
    setIsAdmin,
    setIsSupport,
    isAdmin,
    isSupport,
  } = useContext(AuthContext);
  const logoutMutation = useLogoutMutation();
  const { t } = useTranslation("nav");
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
      setIsLoggedIn(false);
      setUserId(null);
      setIsAdmin(false);
      setIsSupport(false);
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
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {isAdmin && (
              <Link
                to="/app/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 no-underline ${getButtonClasses(settings.useLiquidGlass, settings.useDarkMode, "secondary")} ${textColor}`}
                title={t("account.adminPanel")}
              >
                <ShieldAlert size={14} />
                <span className="hidden lg:inline">
                  {t("account.adminPanel")}
                </span>
              </Link>
            )}
            {(isAdmin || isSupport) && (
              <Link
                to="/app/debug"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 no-underline ${getButtonClasses(settings.useLiquidGlass, settings.useDarkMode, "secondary")} ${textColor}`}
                title={t("account.debugPanel")}
              >
                <Bug size={14} />
                <span className="hidden lg:inline">
                  {t("account.debugPanel")}
                </span>
              </Link>
            )}
          </div>
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
                {t("loggedInAs")}{" "}
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
            isAdmin={isAdmin}
            isSupport={isSupport}
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
