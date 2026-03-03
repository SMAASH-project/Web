import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { useState, useEffect, useRef, useCallback } from "react";

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
  const glass = settings.useLiquidGlass;
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightPos, setHighlightPos] = useState({ left: 0, width: 0 });
  const [isHovering, setIsHovering] = useState(false);

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
    if (!glass) return;
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
    if (!glass) return;
    setIsHovering(false);
    updateHighlightToSelected();
  };

  return (
    <div className="flex flex-col gap-1.5 items-center">
      <span
        className={`text-xs font-medium text-white/50 uppercase tracking-wider ${
          glass ? "[text-shadow:0_1px_2px_rgba(163,163,163,0.2)]" : ""
        }`}
      >
        {label}
      </span>
      <div
        ref={containerRef}
        className={`relative flex flex-row flex-wrap gap-1 p-1 rounded-xl ${
          glass
            ? "bg-white/15 backdrop-blur-lg border border-white/20"
            : "bg-gray-700/60 border border-gray-600"
        }`}
        onMouseLeave={handleMouseLeave}
      >
        {glass && (
          <div
            className="absolute bg-white/25 rounded-lg shadow-sm shadow-white/20 transition-all duration-300 ease-out pointer-events-none"
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
                !glass
                  ? isSelected
                    ? "bg-green-600 shadow-md"
                    : "hover:bg-gray-600"
                  : ""
              }`}
            >
              <span
                className={`text-xs font-medium text-white transition-opacity ${
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
