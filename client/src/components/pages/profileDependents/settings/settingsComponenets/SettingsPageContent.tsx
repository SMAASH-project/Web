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

export function SettingsPageContent() {
  const { settings } = useSettings();
  const context = useContext(ColorContext);
  const bgClass = getBackgroundClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const textShadow = getTextShadow(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );

  return (
    <Card
      className={`z-0 flex flex-col lg:flex-row w-full max-w-6xl p-6 sm:p-8 lg:p-10 gap-8 lg:gap-10 ${bgClass}`}
    >
      {/* Visual Section */}
      <div className="flex-1 flex items-center justify-center flex-col gap-6">
        <div className="z-1">
          <Label className={`${textColor} ${textShadow}`}>Visual</Label>
        </div>
        <div className="z-1 w-full flex justify-center">
          <SettingToggle />
        </div>
      </div>

      {/* Themes Section */}
      <div className="flex-1 flex items-center justify-center flex-col gap-6">
        <div>
          <Label className={`${textColor} ${textShadow}`}>Themes</Label>
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {THEMES.map((theme) => (
            <Button
              className={`cursor-pointer ${getButtonClasses(settings.useLiquidGlass, settings.useDarkMode)} ${textShadow}`}
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
    </Card>
  );
}
