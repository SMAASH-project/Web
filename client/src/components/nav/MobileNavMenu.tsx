import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  User,
  Settings,
  ArrowLeftRight,
  LogOut,
  ShieldAlert,
} from "lucide-react";
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
  getDialogClasses,
  getLiquidGlassNavHighlight,
  getSubtextColor,
  getTextColor,
  getTextShadow,
} from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface MobileNavMenuProps {
  useLiquidGlass: boolean;
  useDarkMode?: boolean;
  username: string;
  onLogout: () => Promise<void>;
  isAdmin?: boolean;
}

export function MobileNavMenu({
  useLiquidGlass,
  useDarkMode = false,
  username,
  onLogout,
  isAdmin = false,
}: MobileNavMenuProps) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation("nav");
  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const subtextColor = getSubtextColor(useLiquidGlass, useDarkMode);
  const textShadow = getTextShadow(useLiquidGlass, useDarkMode);
  const sheetClass = getDialogClasses(useLiquidGlass, useDarkMode);

  const activeClass =
    getLiquidGlassNavHighlight(useLiquidGlass, useDarkMode) ||
    (useLiquidGlass
      ? "bg-white/20 rounded-sm"
      : "text-(--theme-accent) font-bold");

  const hoverClass = useLiquidGlass
    ? useDarkMode
      ? "hover:bg-black/15 rounded-sm"
      : "hover:bg-white/15 rounded-sm"
    : "hover:text-(--theme-accent-hover)";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className={`${textColor} cursor-pointer ${
            useLiquidGlass
              ? useDarkMode
                ? "hover:bg-black/20"
                : "hover:bg-white/20"
              : useDarkMode
                ? "hover:bg-gray-700"
                : "hover:bg-gray-200"
          }`}
        >
          <Menu size={24} />
          <span className="sr-only">{t("menu")}</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        showCloseButton
        className={`${sheetClass} ${textColor} ${textShadow} p-0`}
      >
        <SheetHeader className="p-4 pb-2">
          <SheetTitle className={`${textColor} ${textShadow}`}>
            {t("menu")}
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <SheetClose asChild key={item.path}>
                <Link
                  to={item.path}
                  className={`px-3 py-2.5 text-sm font-medium transition-colors duration-200 no-underline ${textColor} ${
                    isActive ? activeClass : hoverClass
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        <Separator
          className={`mx-3 ${useLiquidGlass ? (useDarkMode ? "bg-black/20" : "bg-white/20") : "bg-(--theme-accent-soft)"}`}
        />

        {/* Account section */}
        <div className="flex flex-col gap-1 px-3">
          <p
            className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider ${subtextColor}`}
          >
            {t("account.title")}
          </p>

          <SheetClose asChild>
            <Link
              to="/app/profile"
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-200 no-underline ${textColor} ${hoverClass}`}
            >
              <User size={16} />
              <span>{t("account.profile")}</span>
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link
              to="/app/settings"
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-200 no-underline ${textColor} ${hoverClass}`}
            >
              <Settings size={16} />
              <span>{t("account.settings")}</span>
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link
              to="/app/profile-selector"
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-200 no-underline ${textColor} ${hoverClass}`}
            >
              <ArrowLeftRight size={16} />
              <span>{t("account.changeProfile")}</span>
            </Link>
          </SheetClose>

          {isAdmin && (
            <SheetClose asChild>
              <Link
                to="/app/admin"
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-200 no-underline ${textColor} ${hoverClass}`}
              >
                <ShieldAlert size={16} />
                <span>{t("account.adminPanel")}</span>
              </Link>
            </SheetClose>
          )}
        </div>

        {/* Footer: logged in + log out */}
        <div className="mt-auto px-3 pb-4">
          <Separator
            className={`mb-3 ${useLiquidGlass ? (useDarkMode ? "bg-black/20" : "bg-white/20") : "bg-(--theme-accent-soft)"}`}
          />
          <p className={`px-3 pb-2 text-xs ${subtextColor}`}>
            {t("loggedInAs")}{" "}
            <SheetClose asChild>
              <Link
                to="/app/profile/"
                className={`font-medium ${useLiquidGlass ? textColor : "text-(--theme-accent)"} no-underline`}
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
            className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${textColor} cursor-pointer bg-transparent border-none ${hoverClass}`}
          >
            <LogOut size={16} />
            <span>{t("account.logout")}</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
