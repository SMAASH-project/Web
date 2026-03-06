import { CATEGORY_COLORS } from "@/types/PageTypes";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { getLiquidGlassClasses } from "@/lib/utils";

export function CategoryBadge({ category }: { category: string }) {
  const { settings } = useSettings();
  return (
    <div
      className={`w-fit px-2 py-1 rounded text-white text-xs font-semibold ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode)} border border-l-4`}
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
