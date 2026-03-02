import { OsTypes } from "@/types/OsTypes";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
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
  const glass = settings.useLiquidGlass;

  return (
    <div
      className={`flex flex-row gap-1 p-1 rounded-xl ${
        glass
          ? "bg-white/15 backdrop-blur-lg border border-white/20"
          : "bg-gray-700/60 border border-gray-600"
      }`}
    >
      {OsTypes.map((os) => {
        const isSelected = selectedOs === os.name;
        return (
          <button
            key={os.id}
            onClick={() => onSelectOs(os.name)}
            type="button"
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
              isSelected
                ? glass
                  ? "bg-white/30 shadow-sm shadow-white/20"
                  : "bg-green-600 shadow-md"
                : glass
                  ? "hover:bg-white/15"
                  : "hover:bg-gray-600"
            }`}
          >
            <img
              src={osLogos[os.name]}
              alt={os.name}
              className="w-5 h-5 object-contain pointer-events-none select-none"
            />
            <span
              className={`text-sm font-medium text-white transition-opacity ${
                isSelected ? "opacity-100" : "opacity-60"
              }`}
            >
              {os.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
