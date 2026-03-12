import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/components/pages/profileDependents/settings/settingsLogic/SettingsContext";
import { getTextColor, getTextShadow, getSubtextColor } from "@/lib/utils";

export function SettingToggle() {
  const { settings, updateSetting } = useSettings();

  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const textShadow = getTextShadow(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const subtextColor = getSubtextColor(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );

  return (
    <FieldGroup className="w-full max-w-md">
      <FieldLabel>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle className={`${textColor} ${textShadow}`}>
              Use animations
            </FieldTitle>
            <FieldDescription className={subtextColor}>
              Choose to enable or disable animations in the app. Disabling
              animations may improve performance on older devices.
            </FieldDescription>
          </FieldContent>
          <Switch
            id="switch-animations"
            checked={settings.useAnimations}
            onCheckedChange={(checked) =>
              updateSetting("useAnimations", checked)
            }
          />
        </Field>
      </FieldLabel>
      <FieldLabel>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle className={`${textColor} ${textShadow}`}>
              Enable "Liquid Glass"
            </FieldTitle>
            <FieldDescription className={subtextColor}>
              Toggle the "Liquid Glass" effect, which adds a glossy, translucent
              layer to the interface for a sleek, modern look. This may impact
              performance on some devices.
            </FieldDescription>
          </FieldContent>
          <Switch
            id="switch-liquid-glass"
            checked={settings.useLiquidGlass}
            onCheckedChange={(checked) =>
              updateSetting("useLiquidGlass", checked)
            }
          />
        </Field>
      </FieldLabel>
      <FieldLabel>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle className={`${textColor} ${textShadow}`}>
              Toggle Dark Mode
            </FieldTitle>
            <FieldDescription className={subtextColor}>
              Enable a dark theme for the interface, which may be easier on the
              eyes in low-light environments.
            </FieldDescription>
          </FieldContent>
          <Switch
            id="switch-dark-mode"
            checked={settings.useDarkMode}
            onCheckedChange={(checked) => updateSetting("useDarkMode", checked)}
          />
        </Field>
      </FieldLabel>
    </FieldGroup>
  );
}
