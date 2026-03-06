import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, User, Settings, ArrowLeftRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { navItems } from "./navLogic/navItems";
import {
  getLiquidGlassClasses,
  getLiquidGlassTextShadow,
  getLiquidGlassNavHighlight,
} from "@/lib/utils";

interface MobileNavMenuProps {
  useLiquidGlass: boolean;
  useDarkMode?: boolean;
  username: string;
  onLogout: () => Promise<void>;
}

export function MobileNavMenu({
  useLiquidGlass,
  useDarkMode = false,
  username,
  onLogout,
}: MobileNavMenuProps) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const glassClasses =
    getLiquidGlassClasses(useLiquidGlass, useDarkMode) +
    (useLiquidGlass
      ? " text-white " + getLiquidGlassTextShadow(useLiquidGlass, useDarkMode)
      : "");

  const activeClass =
    getLiquidGlassNavHighlight(useLiquidGlass, useDarkMode) ||
    (useLiquidGlass ? "bg-white/20 rounded-sm" : "text-green-400 font-bold");

  const hoverClass = useLiquidGlass
    ? useDarkMode
      ? "hover:bg-black/15 rounded-sm"
      : "hover:bg-white/15 rounded-sm"
    : "hover:text-green-400";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className={`text-white cursor-pointer ${useLiquidGlass ? (useDarkMode ? "hover:bg-black/20" : "hover:bg-white/20") : "hover:bg-gray-600"}`}
        >
          <Menu size={24} />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        showCloseButton
        className={`${glassClasses} p-0`}
      >
        <SheetHeader className="p-4 pb-2">
          <SheetTitle
            className={`text-white ${getLiquidGlassTextShadow(useLiquidGlass, useDarkMode)}`}
          >
            Menu
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <SheetClose asChild key={item.path}>
                <Link
                  to={item.path}
                  className={`px-3 py-2.5 text-sm font-medium transition-colors duration-200 no-underline text-white ${
                    isActive ? activeClass : hoverClass
                  }`}
                >
                  {item.label}
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        <Separator
          className={`mx-3 ${useLiquidGlass ? (useDarkMode ? "bg-black/20" : "bg-white/20") : "bg-green-400/40"}`}
        />

        {/* Account section */}
        <div className="flex flex-col gap-1 px-3">
          <p
            className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              useLiquidGlass ? "text-white/60" : "text-gray-400"
            }`}
          >
            Account
          </p>

          <SheetClose asChild>
            <Link
              to="/app/profile"
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-200 no-underline text-white ${hoverClass}`}
            >
              <User size={16} />
              <span>Profile</span>
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link
              to="/app/settings"
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-200 no-underline text-white ${hoverClass}`}
            >
              <Settings size={16} />
              <span>Settings</span>
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link
              to="/app/profile-selector"
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-200 no-underline text-white ${hoverClass}`}
            >
              <ArrowLeftRight size={16} />
              <span>Change Profile</span>
            </Link>
          </SheetClose>
        </div>

        {/* Footer: logged in + log out */}
        <div className="mt-auto px-3 pb-4">
          <Separator
            className={`mb-3 ${useLiquidGlass ? (useDarkMode ? "bg-black/20" : "bg-white/20") : "bg-green-400/40"}`}
          />
          <p
            className={`px-3 pb-2 text-xs ${useLiquidGlass ? "text-white/60" : "text-gray-400"}`}
          >
            Logged in as{" "}
            <SheetClose asChild>
              <Link
                to="/app/profile/"
                className={`font-medium ${useLiquidGlass ? "text-white" : "text-green-400"} no-underline`}
              >
                {username}
              </Link>
            </SheetClose>
          </p>
          <button
            onClick={async () => {
              setOpen(false);
              await onLogout();
            }}
            className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-200 text-white cursor-pointer bg-transparent border-none ${hoverClass}`}
          >
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
