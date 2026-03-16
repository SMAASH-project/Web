import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { ColorContext } from "../settingsLogic/color/ColorContext";
import { useSettings } from "../settingsLogic/SettingsContext";
import { THEMES, applyTheme } from "../settingsLogic/Themes";
import { SettingToggle } from "./SettingToggle";
import { ThemePicker } from "./ThemePicker";
import {
  getBackgroundClasses,
  getTextColor,
  getTextShadow,
  getButtonClasses,
} from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function SettingsPageContent() {
  const { settings, updateSetting } = useSettings();
  const context = useContext(ColorContext);
  const { t } = useTranslation("settings");

  const bgClass = getBackgroundClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const textShadow = getTextShadow(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const btnClass = getButtonClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );

  const activeLangClass = settings.useLiquidGlass
    ? settings.useDarkMode
      ? "ring-2 ring-white/60"
      : "ring-2 ring-black/40"
    : settings.useDarkMode
      ? "ring-2 ring-gray-300"
      : "ring-2 ring-gray-600";

  return (
    <Card
      className={`z-0 flex flex-col lg:flex-row w-full max-w-6xl p-6 sm:p-8 lg:p-10 gap-8 lg:gap-10 ${bgClass}`}
    >
      {/* Visual Section */}
      <div className="flex-1 flex items-center justify-center flex-col gap-6">
        <div className="z-1">
          <Label className={`${textColor} ${textShadow}`}>
            {t("visual.title")}
          </Label>
        </div>
        <div className="z-1 w-full flex justify-center">
          <SettingToggle />
        </div>
      </div>

      {/* Themes Section */}
      <div className="flex-1 flex items-center justify-center flex-col gap-6">
        <div>
          <Label className={`${textColor} ${textShadow}`}>
            {t("themes.title")}
          </Label>
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {THEMES.map((theme) => (
            <Button
              className={`cursor-pointer ${btnClass} ${textShadow}`}
              key={theme.name}
              onClick={() => applyTheme(theme, context)}
            >
              {theme.name}
            </Button>
          ))}
        </div>
        <div>
          <ThemePicker />
        </div>
      </div>

      {/* Language Section */}
      <div className="flex-1 flex items-center justify-center flex-col gap-6">
        <div>
          <Label className={`${textColor} ${textShadow}`}>
            {t("language.title")}
          </Label>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button
            className={`cursor-pointer ${btnClass} ${textShadow} ${settings.language === "en" ? activeLangClass : ""}`}
            onClick={() => updateSetting("language", "en")}
          >
            🇬🇧 {t("language.en")}
          </Button>
          <Button
            className={`cursor-pointer ${btnClass} ${textShadow} ${settings.language === "hu" ? activeLangClass : ""}`}
            onClick={() => updateSetting("language", "hu")}
          >
            🇭🇺 {t("language.hu")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
