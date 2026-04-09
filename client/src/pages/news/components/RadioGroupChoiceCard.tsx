import { useTranslation } from "react-i18next";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function RadioGroupChoiceCard({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const { t } = useTranslation("news");

  return (
    <RadioGroup value={value} onValueChange={onValueChange} className="max-w-sm">
      <FieldLabel htmlFor="Top">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>{t("add.imageTop")}</FieldTitle>
            <FieldDescription>{t("add.imageTopDesc")}</FieldDescription>
          </FieldContent>
          <RadioGroupItem value="Top" id="Top" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="Right">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>{t("add.imageRight")}</FieldTitle>
            <FieldDescription>{t("add.imageRightDesc")}</FieldDescription>
          </FieldContent>
          <RadioGroupItem value="Right" id="Right" />
        </Field>
      </FieldLabel>
    </RadioGroup>
  );
}
