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
import { Trash2 } from "lucide-react";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import {
  getLiquidGlassClasses,
  getLiquidGlassDialogClasses,
  getLiquidGlassDialogFooterClasses,
  getLiquidGlassTextShadow,
} from "@/lib/utils";

export function RemoveButton({ onConfirm }: { onConfirm?: () => void }) {
  const { settings } = useSettings();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={`text-white ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode)} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)} rounded-lg cursor-pointer`}
        >
          <Trash2 />
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
            Confirm Action
          </DialogTitle>
          <DialogDescription
            className={getLiquidGlassTextShadow(
              settings.useLiquidGlass,
              settings.useDarkMode,
            )}
          >
            Are you sure you want to perform this action?
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
