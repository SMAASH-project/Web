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
  getLiquidGlassClasses,
  getLiquidGlassControlClasses,
  getLiquidGlassDialogClasses,
  getLiquidGlassDialogFooterClasses,
  getLiquidGlassTextShadow,
} from "@/lib/utils";

export function Search({ onSearch }: { onSearch: (query: string) => void }) {
  const { settings } = useSettings();
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={`text-white ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode)} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)} rounded-lg cursor-pointer`}
        >
          <SearchIcon />
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`${getLiquidGlassDialogClasses(settings.useLiquidGlass, settings.useDarkMode)} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
      >
        <DialogHeader>
          <DialogTitle
            className={getLiquidGlassTextShadow(
              settings.useLiquidGlass,
              settings.useDarkMode,
            )}
          >
            Search News
          </DialogTitle>
          <DialogDescription
            className={getLiquidGlassTextShadow(
              settings.useLiquidGlass,
              settings.useDarkMode,
            )}
          >
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
              className={getLiquidGlassControlClasses(
                settings.useLiquidGlass,
                settings.useDarkMode,
              )}
            />
          </Field>
        </FieldGroup>
        <DialogFooter
          className={getLiquidGlassDialogFooterClasses(
            settings.useLiquidGlass,
            settings.useDarkMode,
          )}
        >
          <Button
            variant="outline"
            className={`cursor-pointer ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode, "input")} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
            onClick={handleSearch}
          >
            Search
          </Button>
          <DialogClose asChild>
            <Button
              variant="outline"
              className={`cursor-pointer ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode, "input")} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
