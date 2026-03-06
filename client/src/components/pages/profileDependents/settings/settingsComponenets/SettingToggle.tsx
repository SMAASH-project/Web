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
import { getLiquidGlassTextShadow } from "@/lib/utils";

export function SettingToggle() {
  const { settings, updateSetting } = useSettings();

  return (
    <FieldGroup className="w-full max-w-md">
      <FieldLabel>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle
              className={`text-white ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
            >
              Use animations
            </FieldTitle>
            <FieldDescription
              className={`text-neutral-400 ${settings.useLiquidGlass ? (settings.useDarkMode ? "[text-shadow:0_2px_4px_rgba(32,32,32,0.3)]" : "[text-shadow:0_2px_4px_rgba(255,255,255,0.2)]") : ""}`}
            >
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
            <FieldTitle
              className={`text-white ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
            >
              Enable "Liquid Glass"
            </FieldTitle>
            <FieldDescription
              className={`text-neutral-400 ${settings.useLiquidGlass ? (settings.useDarkMode ? "[text-shadow:0_2px_4px_rgba(32,32,32,0.3)]" : "[text-shadow:0_2px_4px_rgba(255,255,255,0.2)]") : ""}`}
            >
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
            <FieldTitle
              className={`text-white ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
            >
              Toggle Dark Mode
            </FieldTitle>
            <FieldDescription
              className={`text-neutral-400 ${settings.useLiquidGlass ? (settings.useDarkMode ? "[text-shadow:0_2px_4px_rgba(32,32,32,0.3)]" : "[text-shadow:0_2px_4px_rgba(255,255,255,0.2)]") : ""}`}
            >
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
