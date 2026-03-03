import { OsTypes } from "@/types/OsTypes";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import AppleLogo from "@/assets/osLogos/AppleLogoTransparent.svg?url";
import AndroidLogo from "@/assets/osLogos/AndroidLogoTransparent.png";
import { useState, useEffect, useRef, useCallback } from "react";

const osLogos: Record<string, string> = {
  iOS: AppleLogo,
  Android: AndroidLogo,
};

export function SelectOs({
  selectedOs,
  onSelectOs,
}: {
  selectedOs: string;
  onSelectOs: (os: string) => void;
}) {
  const { settings } = useSettings();
  const glass = settings.useLiquidGlass;
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightPos, setHighlightPos] = useState({ left: 0, width: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const updateHighlightToSelected = useCallback(() => {
    if (!containerRef.current) return;
    const btn = containerRef.current.querySelector(
      `[data-os="${selectedOs}"]`,
    ) as HTMLElement | null;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const parentRect = containerRef.current.getBoundingClientRect();
      setHighlightPos({
        left: rect.left - parentRect.left,
        width: rect.width,
      });
    }
  }, [selectedOs]);

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
    <div
      ref={containerRef}
      className={`relative flex flex-row gap-1 p-1 rounded-xl ${
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
      {OsTypes.map((os) => {
        const isSelected = selectedOs === os.name;
        return (
          <button
            key={os.id}
            data-os={os.name}
            onClick={() => onSelectOs(os.name)}
            onMouseEnter={handleMouseEnter}
            type="button"
            className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
              !glass
                ? isSelected
                  ? "bg-green-600 shadow-md"
                  : "hover:bg-gray-600"
                : ""
            }`}
          >
            <img
              src={osLogos[os.name]}
              alt={os.name}
              className="w-5 h-5 object-contain pointer-events-none select-none"
            />
            <span
              className={`text-sm font-medium text-white transition-opacity ${
                isSelected && !isHovering
                  ? "opacity-100"
                  : isHovering
                    ? ""
                    : "opacity-60"
              }`}
            >
              {os.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
