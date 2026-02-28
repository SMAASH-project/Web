import { useMemo, useState } from "react";
import type { NewsPost } from "@/types/PageTypes";

export const NEWS_FILTER_OPTIONS: Array<{
  category: NewsPost["category"];
  label: string;
  description?: string;
}> = [
  { category: "Major update", label: "Major updates" },
  {
    category: "Minor update",
    label: "Minor updates",
    description: "QOL improvements, bug fixes, etc.",
  },
  {
    category: "Patch",
    label: "Patches",
    description: "Security updates, hotfixes, etc.",
  },
  {
    category: "Unrelated news",
    label: "Unrelated news",
    description: "Events, community highlights, etc.",
  },
];

export function useNewsCategoryFilter() {
  const [selectedByCategory, setSelectedByCategory] = useState<
    Record<NewsPost["category"], boolean>
  >({
    "Major update": true,
    "Minor update": true,
    Patch: true,
    "Unrelated news": true,
  });

  const selectedCategories = useMemo(
    () =>
      (
        Object.entries(selectedByCategory) as Array<
          [NewsPost["category"], boolean]
        >
      )
        .filter(([, isSelected]) => isSelected)
        .map(([category]) => category),
    [selectedByCategory],
  );

  function setCategorySelected(
    category: NewsPost["category"],
    checked: boolean,
  ) {
    setSelectedByCategory((prev) => ({ ...prev, [category]: checked }));
  }

  return {
    selectedByCategory,
    selectedCategories,
    setCategorySelected,
  };
}
