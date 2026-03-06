import { Input } from "@/components/ui/input";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { Search as SearchIcon, X } from "lucide-react";
import { useState } from "react";

export function SearchRelease({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) {
  const { settings } = useSettings();
  const [query, setQuery] = useState("");
  const glass = settings.useLiquidGlass;

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
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
      <Input
        placeholder="Search by version…"
        value={query}
        onChange={(e) => handleChange((e.target as HTMLInputElement).value)}
        className={`pl-9 pr-9 h-10 text-white placeholder:text-white/40 border ${
          glass
            ? settings.useDarkMode
              ? "bg-black/10 backdrop-blur-lg border-black/20 focus:bg-black/15 focus:border-black/40"
              : "bg-white/10 backdrop-blur-lg border-white/20 focus:bg-white/15 focus:border-white/40"
            : "bg-gray-700/60 border-gray-600 focus:bg-gray-700 focus:border-green-500"
        } rounded-lg transition-all`}
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors cursor-pointer"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
