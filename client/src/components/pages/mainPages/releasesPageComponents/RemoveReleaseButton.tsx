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
import { Trash2 } from "lucide-react";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";

export function RemoveReleaseButton({ onConfirm }: { onConfirm?: () => void }) {
  const { settings } = useSettings();
  const glass = settings.useLiquidGlass;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={`h-8 w-8 p-0 cursor-pointer text-white/60 hover:text-red-400 ${
            glass ? "hover:bg-red-500/15" : "hover:bg-red-900/30"
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this release? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className="cursor-pointer"
              variant="destructive"
              onClick={() => {
                onConfirm?.();
              }}
            >
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
