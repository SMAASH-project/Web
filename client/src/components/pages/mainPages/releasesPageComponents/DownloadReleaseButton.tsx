import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { getSubtextColor } from "@/lib/utils";

export function DownloadReleaseButton({ version }: { version: string }) {
  const { settings } = useSettings();
  const glass = settings.useLiquidGlass;
  const subtextColor = getSubtextColor(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );

  return (
    <Button
      size="sm"
      variant="ghost"
      className={`h-8 w-8 p-0 cursor-pointer ${subtextColor} ${
        glass
          ? settings.useDarkMode
            ? "hover:bg-black/15 hover:text-white"
            : "hover:bg-white/15 hover:text-white"
          : settings.useDarkMode
            ? "hover:bg-gray-600 hover:text-white"
            : "hover:bg-gray-200 hover:text-gray-900"
      }`}
      onClick={() => {
        // TODO: Replace with actual download logic
        console.log(`Downloading release ${version}`);
      }}
    >
      <Download className="w-4 h-4" />
    </Button>
  );
}
