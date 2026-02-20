import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

export function SettingToggle() {
  return (
    <FieldGroup className="w-100 max-w-full text-white">
      <FieldLabel>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Use animations</FieldTitle>
            <FieldDescription className="text-neutral-400">
              Choose to enable or disable animations in the app. Disabling
              animations may improve performance on older devices.
            </FieldDescription>
          </FieldContent>
          <Switch id="switch-animations" defaultChecked />
        </Field>
      </FieldLabel>
      <FieldLabel>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Enable "Liquid Glass"</FieldTitle>
            <FieldDescription className="text-neutral-400">
              Toggle the "Liquid Glass" effect, which adds a glossy, translucent
              layer to the interface for a sleek, modern look. This may impact
              performance on some devices.
            </FieldDescription>
          </FieldContent>
          <Switch id="switch-liquid-glass" defaultChecked />
        </Field>
      </FieldLabel>
    </FieldGroup>
  );
}
