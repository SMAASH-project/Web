import { Fragment } from "react";
import type { Language } from "@/pages/settings/SettingsContext";
import { useSettings } from "@/pages/settings/SettingsContext";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import gbFlag from "@/assets/flags/gb-f.svg?url";
import huFlag from "@/assets/flags/hu-f.svg?url";

interface LanguageToggleProps {
  language: Language;
  onChange: (lang: Language) => void;
}

const LANGS: { key: Language; label: string; flag: string; alt: string }[] = [
  { key: "en", label: "EN", flag: gbFlag, alt: "GB" },
  { key: "hu", label: "HU", flag: huFlag, alt: "HU" },
];

export function LanguageToggle({ language, onChange }: LanguageToggleProps) {
  const { settings } = useSettings();
  const { useLiquidGlass, useDarkMode } = settings;
  const isDark = useLiquidGlass || useDarkMode;

  // Active pill background — glass gets blur, solid gets a subtle tint
  const pillClass = useLiquidGlass
    ? useDarkMode
      ? "bg-black/25 backdrop-blur-sm border border-black/30 shadow-sm shadow-black/20"
      : "bg-white/25 backdrop-blur-sm border border-white/30 shadow-sm shadow-white/20"
    : useDarkMode
      ? "bg-white/15 border border-white/20"
      : "bg-black/[0.07] border border-gray-300/80";

  // Glass needs a text-shadow so the label pops over blurred backgrounds
  const activeTextShadow: React.CSSProperties = useLiquidGlass
    ? { textShadow: useDarkMode ? "0 1px 4px rgba(0,0,0,0.9)" : "0 1px 4px rgba(0,0,0,0.45)" }
    : {};

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 text-xs",
        isDark ? "text-white/65" : "text-gray-500",
      )}
    >
      {LANGS.map((lang, i) => (
        <Fragment key={lang.key}>
          {i > 0 && <span className={isDark ? "text-white/20" : "text-gray-300"}>|</span>}
          <button
            type="button"
            onClick={() => onChange(lang.key)}
            className={cn(
              "relative flex items-center gap-1 rounded px-2 py-0.5 transition-colors",
              language === lang.key
                ? cn("font-semibold", isDark ? "text-white" : "text-gray-900")
                : isDark
                  ? "hover:text-white/90"
                  : "hover:text-gray-700",
            )}
            style={language === lang.key ? activeTextShadow : {}}
          >
            {language === lang.key && (
              <motion.span
                layoutId="lang-pill"
                className={cn("absolute inset-0 rounded", pillClass)}
                transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <img src={lang.flag} alt={lang.alt} className="h-3.5 w-auto" />
              {lang.label}
            </span>
          </button>
        </Fragment>
      ))}
    </div>
  );
}
