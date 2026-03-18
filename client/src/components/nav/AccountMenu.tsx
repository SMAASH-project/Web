import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { useNavbarContext } from "@/context/NavbarContextUtils";
import { useSettings } from "../pages/profileDependents/settings/settingsLogic/SettingsContext";
import { useTranslation } from "react-i18next";
import { AuthContext } from "@/context/AuthContext";
import { useLogoutMutation } from "@/hooks/useQueryHooks";
import { m } from "motion/react";
import {
  getBackgroundClasses,
  getSubtextColor,
  getTextColor,
  getTextShadow,
} from "@/lib/utils";

export default function AccountMenu() {
  const { setIsDropdownHovering, setIsDropdownOpen } = useNavbarContext();
  const { settings } = useSettings();
  const { t } = useTranslation("nav");
  const { setIsLoggedIn, setUserId, setIsAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const subtextColor = getSubtextColor(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const textShadow = getTextShadow(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const dropdownBackground = getBackgroundClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
    "strong",
  );

  // Calls the React Query logout mutation to end the session and clear cache
  const logout = async () => {
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

  const handleLogout = async () => {
    await logout();
  };
  return (
    <DropdownMenu
      modal={false}
      onOpenChange={(open: boolean) => setIsDropdownOpen(open)}
    >
      <DropdownMenuTrigger asChild>
        <m.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="icon"
            className={`transition-colors duration-150 rounded-full cursor-pointer shadow-sm p-2 ${textColor} ${textShadow} ${
              settings.useLiquidGlass
                ? settings.useDarkMode
                  ? "bg-black/20 hover:bg-black/30"
                  : "bg-white/20 hover:bg-white/30"
                : settings.useDarkMode
                  ? "bg-gray-800/80 hover:bg-gray-700/90"
                  : "bg-white/90 hover:bg-white"
            }`}
            aria-label="Account menu"
          >
            <User size={16} />
          </Button>
        </m.div>
      </DropdownMenuTrigger>
      <m.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
      >
        <DropdownMenuContent
          className={`w-48 z-9999 rounded-xl p-2 shadow-xl backdrop-blur-md border ${dropdownBackground} ${textColor}`}
          align="end"
          onMouseEnter={() => setIsDropdownHovering(true)}
          onMouseLeave={() => setIsDropdownHovering(false)}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel
              className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${subtextColor}`}
            >
              {t("account.title")}
            </DropdownMenuLabel>
            <DropdownMenuItem
              asChild
              className={`px-3 py-2.5 rounded-md text-sm transition-all duration-150 ${
                settings.useDarkMode
                  ? "hover:bg-white/10 hover:text-gray-100"
                  : "hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Link to="/app/profile">{t("account.profile")}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className={`px-3 py-2.5 rounded-md text-sm transition-all duration-150 ${
                settings.useDarkMode
                  ? "hover:bg-white/10 hover:text-gray-100"
                  : "hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Link to="/app/settings">{t("account.settings")}</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator
            className={`my-2 ${settings.useDarkMode ? "bg-white/10" : "bg-gray-200"}`}
          />
          <DropdownMenuGroup>
            <DropdownMenuItem
              disabled
              className={`px-3 py-2 text-sm rounded-md ${
                settings.useDarkMode ? "text-white/30" : "text-gray-400"
              }`}
            >
              {t("account.support")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator
            className={`my-2 ${settings.useDarkMode ? "bg-white/10" : "bg-gray-200"}`}
          />
          <DropdownMenuItem
            asChild
            className={`px-3 py-2.5 rounded-md text-sm transition-all duration-150 ${
              settings.useDarkMode
                ? "hover:bg-white/10 hover:text-gray-100"
                : "hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Link to="/app/profile-selector">{t("account.changeProfile")}</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={`my-2 ${settings.useDarkMode ? "bg-white/10" : "bg-gray-200"}`}
          />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className={`px-3 py-2.5 rounded-md text-sm transition-all duration-150 ${
                settings.useDarkMode
                  ? "hover:bg-red-600/80 hover:text-white"
                  : "hover:bg-red-50 hover:text-red-700"
              }`}
              onClick={handleLogout}
            >
              {t("account.logout")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </m.div>
    </DropdownMenu>
  );
}
