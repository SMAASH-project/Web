import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";

export function SearchRelease({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) {
  const { settings } = useSettings();
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={`text-white ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)] rounded-lg bg-white/30" : ""} cursor-pointer`}
        >
          <SearchIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Search Releases</DialogTitle>
          <DialogDescription>
            Type to search releases by version
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <Label>Search</Label>
            <Input
              placeholder="Search releases..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={handleSearch}
          >
            Search
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
