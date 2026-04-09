import type { Language } from "@/pages/settings/SettingsContext";
import gbFlag from "@/assets/flags/gb-f.svg?url";
import huFlag from "@/assets/flags/hu-f.svg?url";

interface LanguageToggleProps {
  language: Language;
  onChange: (lang: Language) => void;
}

export function LanguageToggle({ language, onChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-1 text-xs text-gray-500">
      <button
        type="button"
        onClick={() => onChange("en")}
        className={`flex items-center gap-1 rounded px-2 py-0.5 transition-colors ${
          language === "en" ? "font-semibold text-gray-900" : "hover:text-gray-700"
        }`}
      >
        <img src={gbFlag} alt="GB" className="h-3.5 w-auto" />
        EN
      </button>
      <span className="opacity-30">|</span>
      <button
        type="button"
        onClick={() => onChange("hu")}
        className={`flex items-center gap-1 rounded px-2 py-0.5 transition-colors ${
          language === "hu" ? "font-semibold text-gray-900" : "hover:text-gray-700"
        }`}
      >
        <img src={huFlag} alt="HU" className="h-3.5 w-auto" />
        HU
      </button>
    </div>
  );
}
