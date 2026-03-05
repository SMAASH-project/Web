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
import { Link, useNavigate } from "react-router";
import { useContext } from "react";
import { useNavbarContext } from "@/context/NavbarContextUtils";
import { useSettings } from "../pages/profileDependents/settings/settingsLogic/SettingsContext";
import { AuthContext } from "@/context/AuthContext";
import { apiLogout } from "@/hooks/useApi";
import { m } from "motion/react";

export default function AccountMenu() {
  const { setIsDropdownHovering, setIsDropdownOpen } = useNavbarContext();
  const { settings } = useSettings();
  const { setIsLoggedIn, setUserId } = useContext(AuthContext);
  const navigate = useNavigate();
  // placeholder flag to toggle dark styling; replace with real theme flag as needed
  const isDark = false;

  // Calls the centralized logout API to end the session.
  const logout = async () => {
    try {
      const { ok } = await apiLogout();
      if (ok) {
        console.log("Logout successful");
        setIsLoggedIn(false);
        setUserId(null);
        navigate("/app/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };
  return (
    <DropdownMenu onOpenChange={(open: boolean) => setIsDropdownOpen(open)}>
      <DropdownMenuTrigger asChild>
        <m.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="icon"
            className={`transition-colors duration-150 ${
              settings.useLiquidGlass
                ? isDark
                  ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)] rounded-full bg-white/20 text-white hover:bg-white/30"
                  : "rounded-full bg-white/90 hover:bg-white text-gray-800"
                : isDark
                  ? "rounded-full bg-white/5 hover:bg-white/10 text-white"
                  : "rounded-full bg-white/90 hover:bg-white text-gray-800"
            } cursor-pointer shadow-sm p-2`}
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
          className={`w-48 z-9999 rounded-xl p-2 shadow-xl backdrop-blur-md border ${
            isDark
              ? "bg-black/80 border-white/10 text-white"
              : "bg-white/95 border-gray-200 text-gray-900"
          }`}
          align="end"
          onMouseEnter={() => setIsDropdownHovering(true)}
          onMouseLeave={() => setIsDropdownHovering(false)}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel
              className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
                isDark ? "text-white/70" : "text-gray-600"
              }`}
            >
              My Account
            </DropdownMenuLabel>
            <DropdownMenuItem
              asChild
              className={`px-3 py-2.5 rounded-md text-sm transition-all duration-150 ${
                isDark
                  ? "hover:bg-white/10 hover:text-white"
                  : "hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Link to="/app/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className={`px-3 py-2.5 rounded-md text-sm transition-all duration-150 ${
                isDark
                  ? "hover:bg-white/10 hover:text-white"
                  : "hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Link to="/app/settings">Settings</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator
            className={`my-2 ${isDark ? "bg-white/10" : "bg-gray-200"}`}
          />
          <DropdownMenuGroup>
            <DropdownMenuItem
              disabled
              className={`px-3 py-2 text-sm rounded-md ${
                isDark ? "text-white/30" : "text-gray-400"
              }`}
            >
              Support
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator
            className={`my-2 ${isDark ? "bg-white/10" : "bg-gray-200"}`}
          />
          <DropdownMenuItem
            asChild
            className={`px-3 py-2.5 rounded-md text-sm transition-all duration-150 ${
              isDark
                ? "hover:bg-white/10 hover:text-white"
                : "hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Link to="/app/profile-selector">Change Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={`my-2 ${isDark ? "bg-white/10" : "bg-gray-200"}`}
          />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className={`px-3 py-2.5 rounded-md text-sm transition-all duration-150 ${
                isDark
                  ? "hover:bg-red-600/80 hover:text-white"
                  : "hover:bg-red-50 hover:text-red-700"
              }`}
              onClick={handleLogout}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </m.div>
    </DropdownMenu>
  );
}
