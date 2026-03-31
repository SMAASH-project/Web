import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useSettings } from "@/pages/settings/SettingsContext";
import { getSubtextColor } from "@/lib/utils";

interface DownloadReleaseButtonProps {
  version: string;
  /**
   * Direct download URL for the selected OS, derived from the GitHub release
   * asset's browser_download_url.
   *
   * Undefined when no matching asset was found for this platform in the
   * GitHub release (e.g. the release only has an Android build and the user
   * has iOS selected). The button is disabled in that case.
   */
  downloadUrl: string | undefined;
}

export function DownloadReleaseButton({
  version,
  downloadUrl,
}: DownloadReleaseButtonProps) {
  const { settings } = useSettings();
  const glass = settings.useLiquidGlass;
  const subtextColor = getSubtextColor(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );

  const handleDownload = () => {
    if (!downloadUrl) return;

    // Open the GitHub asset URL in a new tab. The browser will either prompt
    // a download dialog (for .apk / .ipa / .aab) or navigate to the file
    // depending on its content-type headers from GitHub.
    window.open(downloadUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={!downloadUrl}
      title={
        downloadUrl
          ? `Download v${version}`
          : `No download available for this platform`
      }
      className={`h-8 w-8 p-0 cursor-pointer ${subtextColor} ${
        glass
          ? settings.useDarkMode
            ? "hover:bg-black/15 hover:text-gray-100"
            : "hover:bg-white/15 hover:text-white"
          : settings.useDarkMode
            ? "hover:bg-gray-600 hover:text-gray-100"
            : "hover:bg-gray-200 hover:text-gray-900"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
      onClick={handleDownload}
    >
      <Download className="w-4 h-4" />
    </Button>
  );
}
