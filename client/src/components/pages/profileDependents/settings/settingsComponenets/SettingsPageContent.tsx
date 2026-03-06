import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { ColorContext } from "../settingsLogic/color/ColorContext";
import { useSettings } from "../settingsLogic/SettingsContext";
import { THEMES, applyTheme } from "../settingsLogic/Themes";
import { SettingToggle } from "./SettingToggle";
import { ThemePicker } from "./ThemePicker";
import { getLiquidGlassClasses, getLiquidGlassTextShadow } from "@/lib/utils";

export function SettingsPageContent() {
  const { settings } = useSettings();
  const context = useContext(ColorContext);
  const liquidClass = getLiquidGlassClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );

  return (
    <Card
      className={`z-0 flex flex-col lg:flex-row w-full max-w-6xl p-6 sm:p-8 lg:p-10 gap-8 lg:gap-10 ${liquidClass}`}
    >
      {/* Visual Section */}
      <div className="flex-1 flex items-center justify-center flex-col gap-6">
        <div className="z-1">
          <Label
            className={`text-white ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
          >
            Visual
          </Label>
        </div>
        <div className="z-1 w-full flex justify-center">
          <SettingToggle />
        </div>
      </div>

      {/* Themes Section */}
      <div className="flex-1 flex items-center justify-center flex-col gap-6">
        <div>
          <Label
            className={`text-white ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
          >
            Themes
          </Label>
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {THEMES.map((theme) => (
            <Button
              className={`text-white cursor-pointer ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode)} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
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
