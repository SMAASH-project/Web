import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EllipsisVertical } from "lucide-react";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { FilterSelection } from "./FilterSelection";
import type { NewsPost } from "@/types/PageTypes";
import { getLiquidGlassClasses, getLiquidGlassTextShadow } from "@/lib/utils";

interface FilterSelectProps {
  selectedByCategory: Record<NewsPost["category"], boolean>;
  onCategoryChange: (category: NewsPost["category"], checked: boolean) => void;
}

export function FilterSelect({
  selectedByCategory,
  onCategoryChange,
}: FilterSelectProps) {
  const { settings } = useSettings();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={`text-white ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode)} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)} rounded-lg cursor-pointer`}
        >
          <EllipsisVertical />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <PopoverHeader>
          <PopoverTitle>Select Filters</PopoverTitle>
        </PopoverHeader>
        <FilterSelection
          selectedByCategory={selectedByCategory}
          onCategoryChange={onCategoryChange}
        />
      </PopoverContent>
    </Popover>
  );
}
