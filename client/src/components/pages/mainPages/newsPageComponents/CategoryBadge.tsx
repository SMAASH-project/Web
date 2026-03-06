import { CATEGORY_COLORS } from "@/types/PageTypes";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { getBackgroundClasses, getTextShadow, getTextColor } from "@/lib/utils";

export function CategoryBadge({ category }: { category: string }) {
  const { settings } = useSettings();
  const bgClass = getBackgroundClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
    "light",
  );
  const textShadow = getTextShadow(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);

  return (
    <div
      className={`w-fit px-2 py-1 rounded ${textColor} text-xs font-semibold ${bgClass} ${textShadow} border border-l-4`}
      style={{
        borderLeftColor:
          CATEGORY_COLORS[category] || CATEGORY_COLORS["Unrelated news"],
        borderColor: settings.useDarkMode
          ? "rgba(0,0,0,0.4)"
          : "rgba(255,255,255,0.4)",
      }}
    >
      {category}
    </div>
  );
}
