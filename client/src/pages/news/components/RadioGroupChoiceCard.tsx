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
  textColor = "",
  subtextColor = "",
}: {
  value: string;
  onValueChange: (value: string) => void;
  textColor?: string;
  subtextColor?: string;
}) {
  const { t } = useTranslation("news");

  return (
    <RadioGroup value={value} onValueChange={onValueChange} className="max-w-sm">
      <FieldLabel htmlFor="Top">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle className={textColor}>{t("add.imageTop")}</FieldTitle>
            <FieldDescription className={subtextColor}>{t("add.imageTopDesc")}</FieldDescription>
          </FieldContent>
          <RadioGroupItem value="Top" id="Top" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="Right">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle className={textColor}>{t("add.imageRight")}</FieldTitle>
            <FieldDescription className={subtextColor}>{t("add.imageRightDesc")}</FieldDescription>
          </FieldContent>
          <RadioGroupItem value="Right" id="Right" />
        </Field>
      </FieldLabel>
    </RadioGroup>
  );
}
