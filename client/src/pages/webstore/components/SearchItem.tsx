import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/pages/settings/SettingsContext";
import { Search as SearchIcon, X } from "lucide-react";
import { useState } from "react";
import { getInputClasses, getSubtextColor } from "@/lib/utils";

export function SearchItem({ onSearch }: { onSearch: (query: string) => void }) {
  const { settings } = useSettings();
  const { t } = useTranslation("webstore");
  const [query, setQuery] = useState("");

  const inputClass = getInputClasses(settings.useLiquidGlass, settings.useDarkMode);
  const subtextColor = getSubtextColor(settings.useLiquidGlass, settings.useDarkMode);

  const handleChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative w-full">
      <SearchIcon
        className={`absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 ${subtextColor} pointer-events-none`}
      />
      <Input
        placeholder={t("searchPlaceholder")}
        value={query}
        onChange={(e) => handleChange((e.target as HTMLInputElement).value)}
        className={`h-10 pr-9 pl-9 ${inputClass} rounded-lg transition-all`}
      />
      {query && (
        <button
          onClick={handleClear}
          className={`absolute top-1/2 right-3 -translate-y-1/2 ${subtextColor} cursor-pointer transition-opacity hover:opacity-80`}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
