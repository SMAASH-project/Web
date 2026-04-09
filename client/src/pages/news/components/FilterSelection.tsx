import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import type { NewsPost } from "@/types/PageTypes";
import { NEWS_FILTER_OPTIONS } from "../useNewsCategoryFilter";
import { useSettings } from "@/pages/settings/SettingsContext";
import { getSubtextColor } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const CATEGORY_KEYS: Record<NewsPost["category"], string> = {
  "Major update": "majorUpdate",
  "Minor update": "minorUpdate",
  Patch: "patch",
  "Unrelated news": "unrelatedNews",
};

interface FilterSelectionProps {
  selectedByCategory: Record<NewsPost["category"], boolean>;
  onCategoryChange: (category: NewsPost["category"], checked: boolean) => void;
}

export function FilterSelection({ selectedByCategory, onCategoryChange }: FilterSelectionProps) {
  const { settings } = useSettings();
  const { t } = useTranslation("news");
  const subtextColor = getSubtextColor(settings.useLiquidGlass, settings.useDarkMode);

  return (
    <FieldSet>
      <FieldDescription className={`${subtextColor}`}>{t("filterDescription")}</FieldDescription>
      <FieldGroup className="gap-3">
        {NEWS_FILTER_OPTIONS.map((option) => {
          const id = `filter-${option.category.toLowerCase().replace(/\s+/g, "-")}`;
          const key = CATEGORY_KEYS[option.category];
          const label = t(`filterOptions.${key}.label`, option.label);
          const description = option.description
            ? t(`filterOptions.${key}.description`, option.description)
            : undefined;

          return (
            <Field key={option.category} orientation="horizontal">
              <Checkbox
                id={id}
                name={id}
                checked={selectedByCategory[option.category]}
                onCheckedChange={(checked) => onCategoryChange(option.category, checked === true)}
              />
              <FieldLabel htmlFor={id} className="flex flex-wrap items-center gap-1 font-normal">
                {label}
                {description ? (
                  <span className={`text-xs ${subtextColor}`}>({description})</span>
                ) : null}
              </FieldLabel>
            </Field>
          );
        })}
      </FieldGroup>
    </FieldSet>
  );
}
