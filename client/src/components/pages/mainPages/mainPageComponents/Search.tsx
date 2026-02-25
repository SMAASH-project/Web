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

export function Search() {
  const { settings } = useSettings();
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
          <DialogTitle>Search News</DialogTitle>
          <DialogDescription>Type to search posts</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <Label>Search</Label>
            <Input placeholder="Search posts..." />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
