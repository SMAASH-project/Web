import { CATEGORY_COLORS } from "@/types/PageTypes";
import { useSettings } from "@/pages/settings/SettingsContext";
import { getTextShadow } from "@/lib/utils";

export function CategoryBadge({ category }: { category: string }) {
  const { settings } = useSettings();
  const textShadow = getTextShadow(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const categoryColor =
    CATEGORY_COLORS[category] || CATEGORY_COLORS["Unrelated news"];

  return (
    <div
      className={`w-fit px-2 py-1 rounded text-white text-xs font-semibold ${textShadow} border`}
      style={{
        backgroundColor: categoryColor,
        borderColor: categoryColor,
      }}
    >
      {category}
    </div>
  );
}
