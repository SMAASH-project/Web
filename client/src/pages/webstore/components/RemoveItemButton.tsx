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
import { Trash2, Loader2 } from "lucide-react";
import { useSettings } from "@/pages/settings/SettingsContext";
import {
  getButtonClasses,
  getDialogClasses,
  getDialogFooterClasses,
  getTextShadow,
  getSubtextColor,
  getTextColor,
} from "@/lib/utils";

export function RemoveItemButton({
  onConfirm,
  isDeleting = false,
}: {
  onConfirm?: () => void;
  isDeleting?: boolean;
}) {
  const { settings } = useSettings();
  const { t } = useTranslation("webstore");
  const glass = settings.useLiquidGlass;
  const dialogClass = getDialogClasses(settings.useLiquidGlass, settings.useDarkMode);
  const footerClass = getDialogFooterClasses(settings.useLiquidGlass, settings.useDarkMode);
  const textShadow = getTextShadow(settings.useLiquidGlass, settings.useDarkMode);
  const subtextColor = getSubtextColor(settings.useLiquidGlass, settings.useDarkMode);
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={`h-8 w-8 cursor-pointer p-0 ${glass ? textColor : subtextColor} hover:text-red-400 ${
            glass ? "hover:bg-red-500/15" : "hover:bg-red-900/30"
          }`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`${dialogClass} ${textShadow} **:data-[slot='dialog-close']:hover:bg-red-500/20 **:data-[slot='dialog-close']:hover:text-red-300`}
      >
        <DialogHeader>
          <DialogTitle className={`${textColor} ${textShadow}`}>{t("delete.confirm")}</DialogTitle>
          <DialogDescription className={subtextColor}>{t("delete.description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className={footerClass}>
          <DialogClose asChild>
            <Button
              variant="outline"
              className={`cursor-pointer ${getButtonClasses(settings.useLiquidGlass, settings.useDarkMode, "outline")} ${textColor} ${textShadow}`}
            >
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className={`cursor-pointer ${textShadow} border border-red-500/60 bg-red-600/80 text-white shadow-md shadow-red-900/40 hover:border-red-400 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60`}
              variant="destructive"
              disabled={isDeleting}
              onClick={() => {
                onConfirm?.();
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
