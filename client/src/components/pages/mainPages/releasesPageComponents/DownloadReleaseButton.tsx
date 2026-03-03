import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";

export function DownloadReleaseButton({ version }: { version: string }) {
  const { settings } = useSettings();
  const glass = settings.useLiquidGlass;

  return (
    <Button
      size="sm"
      variant="ghost"
      className={`h-8 w-8 p-0 cursor-pointer text-white/60 hover:text-white ${
        glass ? "hover:bg-white/15" : "hover:bg-gray-600"
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
