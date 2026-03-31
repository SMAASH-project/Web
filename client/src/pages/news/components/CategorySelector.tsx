import { RadioGroup } from "@/components/ui/radio-group";
import { CATEGORY_COLORS, type NewsPost } from "@/types/PageTypes";
import { useSettings } from "@/pages/settings/SettingsContext";
import { getLiquidGlassTextShadow, getTextColor } from "@/lib/utils";

interface CategorySelectorProps {
  value: NewsPost["category"];
  onValueChange: (value: NewsPost["category"]) => void;
}

const CATEGORIES = [
  "Major update",
  "Minor update",
  "Patch",
  "Unrelated news",
] as const;

export function CategorySelector({
  value,
  onValueChange,
}: CategorySelectorProps) {
  const { settings } = useSettings();
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);

  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onValueChange(v as NewsPost["category"])}
    >
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((category) => {
          const isSelected = value === category;
          const color = CATEGORY_COLORS[category];
          return (
            <label
              key={category}
              className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                isSelected
                  ? settings.useDarkMode
                    ? "bg-black/35 border-black/35"
                    : "bg-white/35 border-white/35"
                  : settings.useDarkMode
                    ? "border-black/35 hover:bg-black/20"
                    : "border-white/35 hover:bg-white/20"
              }`}
              style={{
                borderLeftColor: color,
                borderLeftWidth: "3px",
              }}
            >
              <input
                type="radio"
                value={category}
                checked={isSelected}
                onChange={(e) =>
                  onValueChange(e.target.value as NewsPost["category"])
                }
                className="sr-only"
              />
              <span
                className="size-4 shrink-0 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: isSelected ? color : "var(--color-border)",
                }}
              >
                {isSelected && (
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                )}
              </span>
              <span
                className={`text-sm font-medium ${textColor} ${getLiquidGlassTextShadow(
                  settings.useLiquidGlass,
                  settings.useDarkMode,
                )}`}
              >
                {category}
              </span>
            </label>
          );
        })}
      </div>
    </RadioGroup>
  );
}
