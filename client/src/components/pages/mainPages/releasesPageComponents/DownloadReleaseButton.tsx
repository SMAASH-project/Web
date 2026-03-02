import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";

export function DownloadReleaseButton({ version }: { version: string }) {
  const { settings } = useSettings();

  return (
    <Button
      className={`text-white ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)] rounded-lg bg-white/30" : ""} cursor-pointer`}
      onClick={() => {
        // TODO: Replace with actual download logic
        console.log(`Downloading release ${version}`);
      }}
    >
      <Download />
    </Button>
  );
}
