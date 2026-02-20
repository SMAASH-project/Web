import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SettingToggle } from "./setting-toggle";

export function SettingsPageContent() {
  return (
    <Card className="z-0 flex flex-row w-350 h-150 p-10 max-w-full max-h-lg bg-gray-600 border-2 border-green-400">
      {/* Left Section */}
      <div className="flex-1 flex items-center justify-center flex-col">
        <div className="mb-4 z-1">
          <Label className="text-white">Visual</Label>
        </div>
        <div className="z-1">
          <SettingToggle />
        </div>
        <div></div>
      </div>

      {/* Middle Section */}
      <div className="flex-1 flex items-center justify-center"></div>

      {/* Right Section */}
      <div className="flex-1 flex items-center justify-center"></div>
    </Card>
  );
}
