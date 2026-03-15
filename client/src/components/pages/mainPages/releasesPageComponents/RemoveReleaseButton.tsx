import { useTranslation } from "react-i18next";
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
  getButtonClasses,
  getDialogClasses,
  getDialogFooterClasses,
  getTextShadow,
  getSubtextColor,
  getTextColor,
} from "@/lib/utils";

export function RemoveReleaseButton({ onConfirm }: { onConfirm?: () => void }) {
  const { settings } = useSettings();
  const { t } = useTranslation("releases");
  const glass = settings.useLiquidGlass;
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={`h-8 w-8 p-0 cursor-pointer ${glass ? textColor : subtextColor} hover:text-red-400 ${
            glass ? "hover:bg-red-500/15" : "hover:bg-red-900/30"
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className={`${dialogClass} ${textShadow}`}>
        <DialogHeader>
          <DialogTitle className={textShadow}>
            {t("delete.confirm")}
          </DialogTitle>
          <DialogDescription className={subtextColor}>
            Are you sure you want to delete this release? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className={footerClass}>
          <DialogClose asChild>
            <Button
              variant="outline"
              className={`cursor-pointer ${getButtonClasses(settings.useLiquidGlass, settings.useDarkMode, "outline")} ${textShadow}`}
            >
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className={`cursor-pointer ${textShadow}`}
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
