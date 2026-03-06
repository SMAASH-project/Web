import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { ColorContext } from "../settingsLogic/color/ColorContext";
import { useSettings } from "../settingsLogic/SettingsContext";
import { THEMES, applyTheme } from "../settingsLogic/Themes";
import { SettingToggle } from "./SettingToggle";
import { ThemePicker } from "./ThemePicker";

export function SettingsPageContent() {
  const { settings } = useSettings();
  const context = useContext(ColorContext);
  const liquidClass = settings.useLiquidGlass
    ? settings.useDarkMode
      ? "bg-black/30 backdrop-blur-lg border-black/40 shadow-sm shadow-black/40"
      : "bg-white/30 backdrop-blur-lg border-white/30 shadow-sm shadow-white/20"
    : "bg-gray-600 border-2 border-green-400";

  return (
    <Card
      className={`z-0 flex flex-col lg:flex-row w-full max-w-6xl p-6 sm:p-8 lg:p-10 gap-8 lg:gap-10 ${liquidClass}`}
    >
      {/* Visual Section */}
      <div className="flex-1 flex items-center justify-center flex-col gap-6">
        <div className="z-1">
          <Label
            className={`text-white ${settings.useLiquidGlass ? (settings.useDarkMode ? "[text-shadow:0_2px_4px_rgba(32,32,32,0.8)]" : "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]") : ""}`}
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
            className={`text-white ${settings.useLiquidGlass ? (settings.useDarkMode ? "[text-shadow:0_2px_4px_rgba(32,32,32,0.8)]" : "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]") : ""}`}
          >
            Themes
          </Label>
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {THEMES.map((theme) => (
            <Button
              className={`text-white cursor-pointer ${settings.useLiquidGlass ? (settings.useDarkMode ? "bg-black/30 backdrop-blur-lg border-black/30 shadow-sm shadow-black/30 [text-shadow:0_2px_4px_rgba(32,32,32,0.8)]" : "bg-white/30 backdrop-blur-lg border-white/30 shadow-sm shadow-white/20 [text-shadow:0_2px_4px_rgba(163,163,163,0.8)]") : ""}`}
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
