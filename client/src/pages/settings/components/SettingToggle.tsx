import { memo } from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/pages/settings/SettingsContext";
import { getTextColor, getTextShadow, getSubtextColor } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export const SettingToggle = memo(function SettingToggle() {
  const { settings, updateSetting } = useSettings();
  const { t } = useTranslation("settings");

  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const textShadow = getTextShadow(settings.useLiquidGlass, settings.useDarkMode);
  const subtextColor = getSubtextColor(settings.useLiquidGlass, settings.useDarkMode);

  return (
    <FieldGroup className="w-full max-w-md">
      <FieldLabel>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle className={`${textColor} ${textShadow}`}>
              {t("visual.animations.title")}
            </FieldTitle>
            <FieldDescription className={subtextColor}>
              {t("visual.animations.description")}
            </FieldDescription>
          </FieldContent>
          <Switch
            id="switch-animations"
            checked={settings.useAnimations}
            onCheckedChange={(checked) => updateSetting("useAnimations", checked)}
          />
        </Field>
      </FieldLabel>
      <FieldLabel>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle className={`${textColor} ${textShadow}`}>
              {t("visual.liquidGlass.title")}
            </FieldTitle>
            <FieldDescription className={subtextColor}>
              {t("visual.liquidGlass.description")}
            </FieldDescription>
          </FieldContent>
          <Switch
            id="switch-liquid-glass"
            checked={settings.useLiquidGlass}
            onCheckedChange={(checked) => updateSetting("useLiquidGlass", checked)}
          />
        </Field>
      </FieldLabel>
      <FieldLabel>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle className={`${textColor} ${textShadow}`}>
              {t("visual.darkMode.title")}
            </FieldTitle>
            <FieldDescription className={subtextColor}>
              {t("visual.darkMode.description")}
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
});
