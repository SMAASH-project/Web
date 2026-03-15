import { useTranslation } from "react-i18next";
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
  getButtonClasses,
  getDialogClasses,
  getDialogFooterClasses,
  getTextShadow,
  getSubtextColor,
} from "@/lib/utils";

export function RemoveButton({ onConfirm }: { onConfirm?: () => void }) {
  const { settings } = useSettings();
  const { t } = useTranslation("news");
  const buttonClass = getButtonClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
    "primary",
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={`${buttonClass} ${textShadow} rounded-lg cursor-pointer`}
        >
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent className={`${dialogClass} ${textShadow}`}>
        <DialogHeader>
          <DialogTitle className={textShadow}>
            {t("delete.confirm")}
          </DialogTitle>
          <DialogDescription className={subtextColor}>
            {t("delete.description")}
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
