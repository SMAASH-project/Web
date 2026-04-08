import type { Language } from "@/pages/settings/SettingsContext";

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
        className={`rounded px-2 py-0.5 transition-colors ${
          language === "en" ? "font-semibold text-gray-900" : "hover:text-gray-700"
        }`}
      >
        🇬🇧 EN
      </button>
      <span className="opacity-30">|</span>
      <button
        type="button"
        onClick={() => onChange("hu")}
        className={`rounded px-2 py-0.5 transition-colors ${
          language === "hu" ? "font-semibold text-gray-900" : "hover:text-gray-700"
        }`}
      >
        🇭🇺 HU
      </button>
    </div>
  );
}
