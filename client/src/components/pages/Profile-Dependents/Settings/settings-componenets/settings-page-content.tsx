import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SettingToggle } from "./setting-toggle";
import { useSettings } from "../settings-logic/SettingsContext";
import { ThemePicker } from "./Theme-picker";

export function SettingsPageContent() {
  const { settings } = useSettings();
  return (
    <Card
      className={`z-0 flex flex-row w-350 h-150 p-10 max-w-full max-h-lg ${settings.useLiquidGlass ? "bg-white/30 backdrop-blur-lg border-white/30 shadow-sm shadow-white/20" : "bg-gray-600 border-2 border-green-400"}`}
    >
      {/* Left Section */}
      <div className="flex-1 flex items-center justify-center flex-col">
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
      <div className="flex-1 flex items-center justify-center flex-col gap-30">
        <div>
          <Label
            className={`text-white ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""}`}
          >
            Themes
          </Label>
        </div>
        <div></div>
        <div>
          <ThemePicker />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex items-center justify-center"></div>
    </Card>
  );
}
