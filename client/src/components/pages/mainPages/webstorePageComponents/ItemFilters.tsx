import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { useState, useEffect, useRef, useCallback } from "react";
import { getBackgroundClasses, getSubtextColor } from "@/lib/utils";

interface ItemFiltersProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export function ItemFilters({
  label,
  options,
  selected,
  onSelect,
}: ItemFiltersProps) {
  const { settings } = useSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightPos, setHighlightPos] = useState({ left: 0, width: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const subtextColor = getSubtextColor(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const bgClass = getBackgroundClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
    "light",
  );

  const updateHighlightToSelected = useCallback(() => {
    if (!containerRef.current) return;
    const btn = containerRef.current.querySelector(
      `[data-filter="${selected}"]`,
    ) as HTMLElement | null;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const parentRect = containerRef.current.getBoundingClientRect();
      setHighlightPos({
        left: rect.left - parentRect.left,
        width: rect.width,
      });
    }
  }, [selected]);

  useEffect(() => {
    updateHighlightToSelected();
  }, [updateHighlightToSelected]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!settings.useLiquidGlass) return;
    setIsHovering(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const parent = containerRef.current;
    if (parent) {
      const parentRect = parent.getBoundingClientRect();
      setHighlightPos({
        left: rect.left - parentRect.left,
        width: rect.width,
      });
    }
  };

  const handleMouseLeave = () => {
    if (!settings.useLiquidGlass) return;
    setIsHovering(false);
    updateHighlightToSelected();
  };

  return (
    <div className="flex flex-col gap-1.5 items-center">
      <span
        className={`text-xs font-medium uppercase tracking-wider ${subtextColor}`}
      >
        {label}
      </span>
      <div
        ref={containerRef}
        className={`relative flex flex-row flex-wrap gap-1 p-1 rounded-xl ${bgClass}`}
        onMouseLeave={handleMouseLeave}
      >
        {settings.useLiquidGlass && (
          <div
            className={`absolute rounded-lg shadow-sm transition-all duration-300 ease-out pointer-events-none ${
              settings.useDarkMode
                ? "bg-black/25 shadow-black/20"
                : "bg-white/25 shadow-white/20"
            }`}
            style={{
              left: `${highlightPos.left}px`,
              width: `${highlightPos.width}px`,
              top: "4px",
              bottom: "4px",
            }}
          />
        )}
        {options.map((option) => {
          const isSelected = selected === option;
          return (
            <button
              key={option}
              data-filter={option}
              onClick={() => onSelect(option)}
              onMouseEnter={handleMouseEnter}
              type="button"
              className={`relative z-10 flex items-center px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-200 ${
                !settings.useLiquidGlass
                  ? isSelected
                    ? settings.useDarkMode
                      ? "bg-gray-700 shadow-md"
                      : "bg-gray-200 shadow-md"
                    : settings.useDarkMode
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-100"
                  : ""
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  settings.useLiquidGlass
                    ? "text-white"
                    : settings.useDarkMode
                      ? "text-white"
                      : "text-gray-900"
                } transition-opacity ${
                  isSelected && !isHovering
                    ? "opacity-100"
                    : isHovering
                      ? ""
                      : "opacity-60"
                }`}
              >
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
