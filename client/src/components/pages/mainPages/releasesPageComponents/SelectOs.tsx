import { OsTypes } from "@/types/OsTypes";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { Button } from "@/components/ui/button";
import AppleLogo from "@/assets/osLogos/AppleLogoTransparent.svg?url";
import AndroidLogo from "@/assets/osLogos/AndroidLogoTransparent.png";

const osLogos: Record<string, string> = {
  iOS: AppleLogo,
  Android: AndroidLogo,
};

export function SelectOs({
  selectedOs,
  onSelectOs,
}: {
  selectedOs: string;
  onSelectOs: (os: string) => void;
}) {
  const { settings } = useSettings();

  const handleOsSelect = (osName: string) => {
    console.log(`Selected OS: ${osName}`);
    onSelectOs(osName);
  };

  return (
    <div className="flex flex-row gap-4">
      {OsTypes.map((os) => (
        <Button
          key={os.id}
          onClick={() => handleOsSelect(os.name)}
          type="button"
          className={`w-20 h-20 p-2 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer! pointer-events-auto! ${
            settings.useLiquidGlass
              ? `backdrop-blur-lg shadow-sm shadow-white/20 ${
                  selectedOs === os.name
                    ? "bg-white/40 border-white/60 border-2"
                    : "bg-white/30 border-white/30 hover:bg-white/25"
                }`
              : `border-2 ${
                  selectedOs === os.name
                    ? "bg-green-600 border-green-400 border-4"
                    : "bg-gray-600 border-gray-400 hover:bg-gray-650"
                }`
          }`}
        >
          <img
            src={osLogos[os.name]}
            alt={os.name}
            className="w-16 h-16 object-contain pointer-events-none select-none"
          />
        </Button>
      ))}
    </div>
  );
}
