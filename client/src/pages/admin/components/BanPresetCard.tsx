import React from "react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/pages/settings/SettingsContext";
import { getButtonClasses, getTextColor, getSubtextColor } from "@/lib/utils";
import type { BanPreset } from "@/pages/admin/useBanDialogLogic";

interface Props {
  id: BanPreset;
  icon?: React.ReactNode;
  label: string;
  description?: string;
  selected?: boolean;
  onClick?: () => void;
}

export default function BanPresetCard({
  id,
  icon,
  label,
  description,
  selected = false,
  onClick,
}: Props) {
  const { settings } = useSettings();
  const { useLiquidGlass, useDarkMode } = settings;

  const base =
    "flex flex-col items-center justify-center gap-1 p-3 rounded-xl cursor-pointer transition-all duration-200 select-none text-center";

  // Selected → primary button style; unselected → secondary button style
  const cardClass = selected
    ? getButtonClasses(useLiquidGlass, useDarkMode, "primary")
    : getButtonClasses(useLiquidGlass, useDarkMode, "secondary");

  const labelClass = getTextColor(useLiquidGlass, useDarkMode);
  const descClass = getSubtextColor(useLiquidGlass, useDarkMode);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className={cn(base, cardClass)}
    >
      {icon && <span className={descClass}>{icon}</span>}
      <div className={cn("text-sm font-medium", labelClass)}>{label}</div>
      {description && (
        <div className={cn("text-[10px]", descClass)}>{description}</div>
      )}
    </div>
  );
}
