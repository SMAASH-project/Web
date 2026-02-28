import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import type { NewsPost } from "@/types/PageTypes";
import { NEWS_FILTER_OPTIONS } from "./newsPageLogic/useNewsCategoryFilter";

interface FilterSelectionProps {
  selectedByCategory: Record<NewsPost["category"], boolean>;
  onCategoryChange: (category: NewsPost["category"], checked: boolean) => void;
}

export function FilterSelection({
  selectedByCategory,
  onCategoryChange,
}: FilterSelectionProps) {
  return (
    <FieldSet>
      <FieldDescription>
        Select which types of news posts you want to see.
      </FieldDescription>
      <FieldGroup className="gap-3">
        {NEWS_FILTER_OPTIONS.map((option) => {
          const id = `filter-${option.category.toLowerCase().replace(/\s+/g, "-")}`;

          return (
            <Field key={option.category} orientation="horizontal">
              <Checkbox
                id={id}
                name={id}
                checked={selectedByCategory[option.category]}
                onCheckedChange={(checked) =>
                  onCategoryChange(option.category, checked === true)
                }
              />
              <FieldLabel
                htmlFor={id}
                className="font-normal flex flex-wrap items-center gap-1"
              >
                {option.label}
                {option.description ? (
                  <span className="text-xs text-muted-foreground">
                    ({option.description})
                  </span>
                ) : null}
              </FieldLabel>
            </Field>
          );
        })}
      </FieldGroup>
    </FieldSet>
  );
}
