import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EllipsisVertical } from "lucide-react";
import { useSettings } from "@/pages/settings/SettingsContext";
import { FilterSelection } from "./FilterSelection";
import type { NewsPost } from "@/types/PageTypes";
import { getButtonClasses, getTextShadow, getBackgroundClasses, getTextColor } from "@/lib/utils";

interface FilterSelectProps {
  selectedByCategory: Record<NewsPost["category"], boolean>;
  onCategoryChange: (category: NewsPost["category"], checked: boolean) => void;
}

export function FilterSelect({ selectedByCategory, onCategoryChange }: FilterSelectProps) {
  const { settings } = useSettings();
  const buttonClass = getButtonClasses(settings.useLiquidGlass, settings.useDarkMode, "primary");
  const textShadow = getTextShadow(settings.useLiquidGlass, settings.useDarkMode);
  const bgClass = getBackgroundClasses(settings.useLiquidGlass, settings.useDarkMode);
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className={`${buttonClass} ${textShadow} cursor-pointer rounded-lg`}>
          <EllipsisVertical />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={bgClass}>
        <PopoverHeader>
          <PopoverTitle className={textColor}>Select Filters</PopoverTitle>
        </PopoverHeader>
        <FilterSelection
          selectedByCategory={selectedByCategory}
          onCategoryChange={onCategoryChange}
        />
      </PopoverContent>
    </Popover>
  );
}
