import { Label } from "@radix-ui/react-dropdown-menu";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

interface NavMenuProps {
  useLiquidGlass: boolean;
}

const navItems = [
  { label: "About Us", path: "/app/about" },
  { label: "Gallery", path: "/app/gallery" },
  { label: "Releases", path: "/app/releases" },
  { label: "Webstore", path: "/app/webstore" },
  { label: "News", path: "/app/news" },
];

export function NavMenu({ useLiquidGlass }: NavMenuProps) {
  const location = useLocation();
  const [highlightPos, setHighlightPos] = useState({ left: 0, width: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const ulRef = useRef<HTMLUListElement>(null);

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
      className={`nav-links list-none flex m-0 p-0 gap-10 relative ${useLiquidGlass ? "rounded-lg bg-white/10" : ""}`}
      onMouseLeave={handleMouseLeave}
    >
      {useLiquidGlass && isHovering && (
        <div
          className="absolute bg-white/20 rounded-sm transition-all duration-300 ease-out pointer-events-none"
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
          className={`m-4 p-0.5 relative z-10 ${
            useLiquidGlass ? "cursor-pointer" : "hover:text-green-400"
          } ${
            !useLiquidGlass && item.path === location.pathname
              ? "text-green-600 font-bold"
              : "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
          } transition-colors duration-300`}
          onMouseEnter={handleMouseEnter}
        >
          <Link to={item.path}>
            <Label>{item.label}</Label>
          </Link>
        </li>
      ))}
    </ul>
  );
}
