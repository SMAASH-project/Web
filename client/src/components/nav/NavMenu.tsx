import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { navItems } from "./navLogic/navItems";
import {
  getBackgroundClasses,
  getLiquidGlassNavHighlight,
  getSubtextColor,
  getTextColor,
  getTextShadow,
} from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface NavMenuProps {
  useLiquidGlass: boolean;
  useDarkMode?: boolean;
}

export function NavMenu({ useLiquidGlass, useDarkMode = false }: NavMenuProps) {
  const location = useLocation();
  const { t } = useTranslation("nav");
  const [highlightPos, setHighlightPos] = useState({ left: 0, width: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const ulRef = useRef<HTMLUListElement>(null);
  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const subtextColor = getSubtextColor(useLiquidGlass, useDarkMode);
  const textShadow = getTextShadow(useLiquidGlass, useDarkMode);
  const navBackground = getBackgroundClasses(useLiquidGlass, useDarkMode, "light");

  useEffect(() => {
    // Find the matching nav item based on current route
    const currentItem = navItems.find((item) => item.path === location.pathname);
    if (currentItem && ulRef.current) {
      const liElement = ulRef.current.querySelector(`a[href="${currentItem.path}"]`)?.closest("li");
      if (liElement) {
        const rect = liElement.getBoundingClientRect();
        const parentRect = ulRef.current.getBoundingClientRect();
        setHighlightPos({
          left: rect.left - parentRect.left,
          width: rect.width,
        });
        setIsHovering(true);
      }
    }
  }, [location.pathname]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLLIElement>) => {
    if (useLiquidGlass) {
      setIsHovering(true);
      const rect = e.currentTarget.getBoundingClientRect();
      const parent = e.currentTarget.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        setHighlightPos({
          left: rect.left - parentRect.left,
          width: rect.width,
        });
      }
    }
  };

  const handleMouseLeave = () => {
    if (useLiquidGlass) {
      setIsHovering(false);
      // Reset to current page highlight
      const currentItem = navItems.find((item) => item.path === location.pathname);
      if (currentItem && ulRef.current) {
        const liElement = ulRef.current
          .querySelector(`a[href="${currentItem.path}"]`)
          ?.closest("li");
        if (liElement) {
          const rect = liElement.getBoundingClientRect();
          const parentRect = ulRef.current.getBoundingClientRect();
          setHighlightPos({
            left: rect.left - parentRect.left,
            width: rect.width,
          });
          setIsHovering(true);
        }
      }
    }
  };

  return (
    <ul
      ref={ulRef}
      className={`nav-links relative m-0 flex list-none gap-1 rounded-lg p-0 whitespace-nowrap lg:gap-4 xl:gap-8 ${navBackground}`}
      onMouseLeave={handleMouseLeave}
    >
      {useLiquidGlass && isHovering && (
        <div
          className={`pointer-events-none absolute rounded-sm transition-all duration-300 ease-out ${getLiquidGlassNavHighlight(useLiquidGlass, useDarkMode)}`}
          style={{
            left: `${highlightPos.left}px`,
            width: `${highlightPos.width}px`,
            top: "8px",
            bottom: "8px",
          }}
        />
      )}
      {navItems.map((item) => (
        <li
          key={item.path}
          className={`relative z-10 m-1 cursor-pointer p-0.5 transition-colors duration-300 lg:m-2 ${
            !useLiquidGlass
              ? item.path === location.pathname
                ? "font-bold text-(--theme-accent)"
                : `${subtextColor} hover:text-(--theme-accent-hover)`
              : `${textColor} ${textShadow}`
          }`}
          onMouseEnter={handleMouseEnter}
        >
          <Link to={item.path}>
            <DropdownMenuPrimitive.Label className="px-1 lg:px-2">
              {t(item.labelKey)}
            </DropdownMenuPrimitive.Label>
          </Link>
        </li>
      ))}
    </ul>
  );
}
