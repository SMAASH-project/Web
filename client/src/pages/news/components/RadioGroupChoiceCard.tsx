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
  return (
    <RadioGroup
      value={value}
      onValueChange={onValueChange}
      className="max-w-sm"
    >
      <FieldLabel htmlFor="Top">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Top</FieldTitle>
            <FieldDescription>
              Place image as a banner above the content.
            </FieldDescription>
          </FieldContent>
          <RadioGroupItem value="Top" id="Top" />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="Right">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Right</FieldTitle>
            <FieldDescription>
              Place image to the right of the content.
            </FieldDescription>
          </FieldContent>
          <RadioGroupItem value="Right" id="Right" />
        </Field>
      </FieldLabel>
    </RadioGroup>
  );
}
