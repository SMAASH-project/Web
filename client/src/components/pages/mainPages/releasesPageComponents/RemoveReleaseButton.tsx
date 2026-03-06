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
import {
  getLiquidGlassClasses,
  getLiquidGlassDialogClasses,
  getLiquidGlassDialogFooterClasses,
  getLiquidGlassTextShadow,
} from "@/lib/utils";

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
            Confirm Deletion
          </DialogTitle>
          <DialogDescription
            className={getLiquidGlassTextShadow(
              settings.useLiquidGlass,
              settings.useDarkMode,
            )}
          >
            Are you sure you want to delete this release? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter
          className={getLiquidGlassDialogFooterClasses(
            settings.useLiquidGlass,
            settings.useDarkMode,
          )}
        >
          <DialogClose asChild>
            <Button
              variant="outline"
              className={`cursor-pointer ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode, "input")} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
            >
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className={`cursor-pointer ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
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
