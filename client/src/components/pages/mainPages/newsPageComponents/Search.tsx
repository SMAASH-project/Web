import { Button } from "@/components/ui/button";
import {
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Dialog,
} from "@/components/ui/dialog";
import { FieldGroup, Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import {
  getButtonClasses,
  getInputClasses,
  getDialogClasses,
  getDialogFooterClasses,
  getTextShadow,
  getSubtextColor,
  getTextColor,
} from "@/lib/utils";

export function Search({ onSearch }: { onSearch: (query: string) => void }) {
  const { settings } = useSettings();
  const [query, setQuery] = useState("");
  const buttonClass = getButtonClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
    "primary",
  );
  const inputClass = getInputClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const dialogClass = getDialogClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const footerClass = getDialogFooterClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const textShadow = getTextShadow(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const subtextColor = getSubtextColor(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={`${buttonClass} ${textShadow} rounded-lg cursor-pointer`}
        >
          <SearchIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className={`${dialogClass} ${textShadow}`}>
        <DialogHeader>
          <DialogTitle className={textColor}>Search News</DialogTitle>
          <DialogDescription className={subtextColor}>
            Type to search posts by title
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <Label>Search</Label>
            <Input
              placeholder="Search posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={inputClass}
            />
          </Field>
        </FieldGroup>
        <DialogFooter className={footerClass}>
          <Button
            variant="outline"
            className={`cursor-pointer ${getButtonClasses(settings.useLiquidGlass, settings.useDarkMode, "outline")} ${textShadow}`}
            onClick={handleSearch}
          >
            Search
          </Button>
          <DialogClose asChild>
            <Button
              variant="outline"
              className={`cursor-pointer ${getButtonClasses(settings.useLiquidGlass, settings.useDarkMode, "outline")} ${textShadow}`}
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
