import { CATEGORY_COLORS } from "@/types/PageTypes";

export function CategoryBadge({ category }: { category: string }) {
  return (
    <div
      className="w-fit px-2 py-1 rounded text-white text-xs font-semibold bg-white/20 backdrop-blur-lg border border-white/40 border-l-4"
      style={{
        borderLeftColor:
          CATEGORY_COLORS[category] || CATEGORY_COLORS["Unrelated news"],
      }}
    >
      {category}
    </div>
  );
}
