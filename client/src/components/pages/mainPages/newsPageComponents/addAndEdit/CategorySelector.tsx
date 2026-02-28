import { RadioGroup } from "@/components/ui/radio-group";
import { CATEGORY_COLORS, type NewsPost } from "@/types/PageTypes";

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
  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onValueChange(v as NewsPost["category"])}
    >
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((category) => (
          <label
            key={category}
            className="flex items-center gap-2 p-3 rounded border cursor-pointer hover:bg-muted/50 transition-colors"
            style={{
              borderLeftColor: CATEGORY_COLORS[category],
              borderLeftWidth: "3px",
            }}
          >
            <input
              type="radio"
              value={category}
              checked={value === category}
              onChange={(e) =>
                onValueChange(e.target.value as NewsPost["category"])
              }
              className="accent-primary"
            />
            <span className="text-sm font-medium">{category}</span>
          </label>
        ))}
      </div>
    </RadioGroup>
  );
}
