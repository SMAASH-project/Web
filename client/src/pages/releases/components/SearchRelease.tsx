import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/pages/settings/SettingsContext";
import { getInputClasses, getSubtextColor } from "@/lib/utils";
import { Search as SearchIcon, X } from "lucide-react";
import { useState } from "react";

export function SearchRelease({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) {
  const { settings } = useSettings();
  const { t } = useTranslation("releases");
  const [query, setQuery] = useState("");
  const inputClass = getInputClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const subtextColor = getSubtextColor(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );

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
        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${subtextColor} pointer-events-none`}
      />
      <Input
        placeholder={t("searchPlaceholder")}
        value={query}
        onChange={(e) => handleChange((e.target as HTMLInputElement).value)}
        className={`${inputClass} pl-9 pr-9 h-10`}
      />
      {query && (
        <button
          onClick={handleClear}
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${subtextColor} hover:opacity-80 transition-opacity cursor-pointer`}
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
