import { Label } from "@radix-ui/react-dropdown-menu";
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

interface NavMenuProps {
  useLiquidGlass: boolean;
  useDarkMode?: boolean;
}

export function NavMenu({ useLiquidGlass, useDarkMode = false }: NavMenuProps) {
  const location = useLocation();
  const [highlightPos, setHighlightPos] = useState({ left: 0, width: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const ulRef = useRef<HTMLUListElement>(null);
  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const subtextColor = getSubtextColor(useLiquidGlass, useDarkMode);
  const textShadow = getTextShadow(useLiquidGlass, useDarkMode);
  const navBackground = getBackgroundClasses(
    useLiquidGlass,
    useDarkMode,
    "light",
  );

  useEffect(() => {
    // Find the matching nav item based on current route
    const currentItem = navItems.find(
      (item) => item.path === location.pathname,
    );
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
      const currentItem = navItems.find(
        (item) => item.path === location.pathname,
      );
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
      className={`nav-links list-none flex m-0 p-0 gap-2 lg:gap-6 xl:gap-10 relative whitespace-nowrap rounded-lg ${navBackground}`}
      onMouseLeave={handleMouseLeave}
    >
      {useLiquidGlass && isHovering && (
        <div
          className={`absolute rounded-sm transition-all duration-300 ease-out pointer-events-none ${getLiquidGlassNavHighlight(useLiquidGlass, useDarkMode)}`}
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
          className={`m-2 lg:m-4 p-0.5 relative z-10 cursor-pointer transition-colors duration-300 ${
            !useLiquidGlass
              ? item.path === location.pathname
                ? useDarkMode
                  ? "text-emerald-300 font-bold"
                  : "text-emerald-700 font-bold"
                : `${subtextColor} ${useDarkMode ? "hover:text-emerald-300" : "hover:text-emerald-700"}`
              : `${textColor} ${textShadow}`
          }`}
          onMouseEnter={handleMouseEnter}
        >
          <Link to={item.path}>
            <Label className="px-1 lg:px-2">{item.label}</Label>
          </Link>
        </li>
      ))}
    </ul>
  );
}
