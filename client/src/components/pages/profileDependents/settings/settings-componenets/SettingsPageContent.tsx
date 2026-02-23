import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { ColorContext } from "../settings-logic/color/ColorContext";
import { useSettings } from "../settings-logic/SettingsContext";
import { THEMES, applyTheme } from "../settings-logic/Themes";
import { SettingToggle } from "./SettingToggle";
import { ThemePicker } from "./ThemePicker";

export function SettingsPageContent() {
  const { settings } = useSettings();
  const context = useContext(ColorContext);
  return (
    <Card
      className={`z-0 flex flex-row w-350 h-150 p-10 max-w-full max-h-lg ${settings.useLiquidGlass ? "bg-white/30 backdrop-blur-lg border-white/30 shadow-sm shadow-white/20" : "bg-gray-600 border-2 border-green-400"}`}
    >
      {/* Left Section */}
      <div className="flex-1 flex items-center justify-center flex-col gap-25">
        <div className="mb-4 z-1">
          <Label
            className={`text-white ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""}`}
          >
            Visual
          </Label>
        </div>
        <div className="z-1">
          <SettingToggle />
        </div>
        <div></div>
      </div>

      {/* Middle Section */}
      <div className="flex-1 flex items-center justify-center flex-col">
        <div>
          <Label
            className={`text-white ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""}`}
          >
            Themes
          </Label>
        </div>
        <div className="flex-1 flex items-center justify-center gap-1">
          {THEMES.map((theme) => (
            <Button
              className={`text-white cursor-pointer ${settings.useLiquidGlass ? "bg-white/30 backdrop-blur-lg border-white/30 shadow-sm shadow-white/20[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""}`}
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

      {/* Right Section */}
      <div className="flex-1 flex items-center justify-center"></div>
    </Card>
  );
}
