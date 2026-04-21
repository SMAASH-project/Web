import { useContext } from "react";
import { useSettings } from "@/pages/settings/SettingsContext";
import { motion } from "motion/react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useDebugSettings } from "@/hooks/useDebugSettings";
import { NavMenu } from "./NavMenu";
import AccountMenu from "./AccountMenu";
import { MobileNavMenu } from "./MobileNavMenu";
import { useProfiles } from "@/pages/profile-selector/useProfiles";
import { Link, useNavigate } from "react-router-dom";
import { useMediaQuery } from "./navLogic/useMediaQuery";
import { useLogoutMutation } from "@/hooks/useQueryHooks";
import { AuthContext } from "@/context/AuthContext";
import { ShieldAlert, Bug } from "lucide-react";
import { AnimatedPress } from "@/animations/AnimatedPress";
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
  const scrollHidden = useScrollDirection();
  const { settings: dbg } = useDebugSettings();
  const hidden =
    dbg.navbarOverride === "show" ? false : dbg.navbarOverride === "hide" ? true : scrollHidden;
  const { selectedProfile } = useProfiles();
  const username = selectedProfile?.name ?? "PlaceholderUserName";
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const navigate = useNavigate();
  const { userId, setIsLoggedIn, setUserId, setIsAdmin, setIsSupport, isAdmin, isSupport } =
    useContext(AuthContext);
  const logoutMutation = useLogoutMutation();
  const { t } = useTranslation("nav");
  const navBackground = getBackgroundClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
    "light",
  );
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const subtextColor = getSubtextColor(settings.useLiquidGlass, settings.useDarkMode);
  const textShadow = getTextShadow(settings.useLiquidGlass, settings.useDarkMode);

  const handleLogout = async () => {
    try {
      if (userId) localStorage.removeItem(`selected_profile_${String(userId)}`);
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

  const navContent = (
    <nav
      className={`flex w-full max-w-full items-center justify-between border-b border-transparent p-4 ${navBackground}`}
      style={{
        borderBottomColor: "var(--theme-nav-border)",
        boxShadow: "0 8px 18px -14px var(--theme-nav-shadow)",
      }}
    >
      {isDesktop ? (
        <>
          {/* Desktop layout — grid with equal side columns keeps center always centered */}
          <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center">
            {/* Left: admin / debug buttons */}
            <div className="flex shrink-0 items-center gap-2">
              {isAdmin && (
                <AnimatedPress scale={1.05}>
                  <Link
                    to="/app/admin"
                    className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-medium no-underline transition-colors duration-200 ${getButtonClasses(settings.useLiquidGlass, settings.useDarkMode, "secondary")} ${textColor}`}
                    title={t("account.adminPanel")}
                  >
                    <ShieldAlert size={13} />
                    <span className="hidden max-w-11 text-center leading-tight lg:block">
                      {t("account.adminPanel")}
                    </span>
                  </Link>
                </AnimatedPress>
              )}
              {(isAdmin || isSupport) && (
                <AnimatedPress scale={1.05}>
                  <Link
                    to="/app/debug"
                    className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-medium no-underline transition-colors duration-200 ${getButtonClasses(settings.useLiquidGlass, settings.useDarkMode, "secondary")} ${textColor}`}
                    title={t("account.debugPanel")}
                  >
                    <Bug size={13} />
                    <span className="hidden max-w-11 text-center leading-tight lg:block">
                      {t("account.debugPanel")}
                    </span>
                  </Link>
                </AnimatedPress>
              )}
            </div>
            {/* Center: main nav */}
            <div>
              <NavMenu
                useLiquidGlass={settings.useLiquidGlass}
                useDarkMode={settings.useDarkMode}
              />
            </div>
            {/* Right: username + account menu */}
            <div className="flex items-center justify-end gap-2 overflow-hidden lg:gap-4">
              <span className={`truncate whitespace-nowrap ${textColor} ${textShadow}`}>
                <span className={`hidden xl:inline ${subtextColor}`}>{t("loggedInAs")} </span>
                <Link to="/app/profile/" className="hidden lg:inline">
                  {username}
                </Link>
              </span>
              <div className="shrink-0">
                <AccountMenu />
              </div>
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
          <span className={`max-w-[50vw] truncate text-sm ${textColor} ${textShadow}`}>
            <Link to="/app/profile/">{username}</Link>
          </span>
          {/* Account options are in the mobile drawer */}
          <div />
        </>
      )}
    </nav>
  );

  return settings.useAnimations ? (
    <motion.div
      className="fixed top-0 right-0 left-0 z-50"
      animate={{ y: hidden ? -80 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
    >
      {navContent}
    </motion.div>
  ) : (
    <div className="fixed top-0 right-0 left-0 z-50">{navContent}</div>
  );
};

export default Navbar;
