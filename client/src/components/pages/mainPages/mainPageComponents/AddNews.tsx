import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
import { MessageSquarePlus, Search } from "lucide-react";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";

export function AddNews() {
  const { settings } = useSettings();

  return (
    <ButtonGroup
      orientation="horizontal"
      className={`text-white ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)] rounded-lg bg-white/30" : ""}`}
    >
      {/* Create News Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className={`text-white ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)] rounded-lg bg-white/30" : ""} cursor-pointer`}
          >
            <MessageSquarePlus />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new News Article</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label>Title</Label>
              <Input />
            </Field>
            <Field>
              <Label>Content</Label>
              <Input />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className={`text-white ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)] rounded-lg bg-white/30" : ""} cursor-pointer`}
          >
            <Search />
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
    </ButtonGroup>
  );
}
