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
import { Link } from "react-router";
import { useNavbarContext } from "@/context/NavbarContextUtils";
import { useSettings } from "../pages/profileDependents/settings/settingsLogic/SettingsContext";

export default function AccountMenu() {
  const { setIsDropdownHovering } = useNavbarContext();
  const { settings } = useSettings();

  const logout = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        console.log("Logout successful");
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          className={`text-white ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)] rounded-lg bg-white/30" : ""} cursor-pointer`}
        >
          <User size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-40 z-100"
        align="start"
        onMouseEnter={() => setIsDropdownHovering(true)}
        onMouseLeave={() => setIsDropdownHovering(false)}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <Link to="/app/profile">
            <DropdownMenuItem className="cursor-pointer">
              Profile
            </DropdownMenuItem>
          </Link>
          <Link to="/app/settings">
            <DropdownMenuItem className="cursor-pointer">
              Settings
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>Support</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
