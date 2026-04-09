import { memo, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ColorContext } from "@/pages/settings/ColorContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/pages/settings/SettingsContext";
import { ColorPicker } from "@/components/ui/color-picker";
import { getTextColor, getTextShadow, getButtonClasses } from "@/lib/utils";
import { EffectMixDialog } from "./EffectMixDialog";

export const ThemePicker = memo(function ThemePicker() {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error("ThemePicker must be used within a ColorProvider");
  }
  const { settings } = useSettings();

  const {
    colorLeft,
    colorMiddle,
    colorRight,
    setColorLeft,
    setColorMiddle,
    setColorRight,
    setCustomTheme,
  } = context;

  const [pendingColorLeft, setPendingColorLeft] = useState<string | null>(null);
  const [pendingColorMiddle, setPendingColorMiddle] = useState<string | null>(null);
  const [pendingColorRight, setPendingColorRight] = useState<string | null>(null);

  const displayColorLeft = pendingColorLeft ?? colorLeft;
  const displayColorMiddle = pendingColorMiddle ?? colorMiddle;
  const displayColorRight = pendingColorRight ?? colorRight;

  const handleApplyChanges = useCallback(() => {
    const newLeft = pendingColorLeft ?? colorLeft;
    const newMiddle = pendingColorMiddle ?? colorMiddle;
    const newRight = pendingColorRight ?? colorRight;
    if (pendingColorLeft !== null) setColorLeft(pendingColorLeft);
    if (pendingColorMiddle !== null) setColorMiddle(pendingColorMiddle);
    if (pendingColorRight !== null) setColorRight(pendingColorRight);
    setCustomTheme({ colorLeft: newLeft, colorMiddle: newMiddle, colorRight: newRight });
    setPendingColorLeft(null);
    setPendingColorMiddle(null);
    setPendingColorRight(null);
  }, [
    pendingColorLeft,
    pendingColorMiddle,
    pendingColorRight,
    colorLeft,
    colorMiddle,
    colorRight,
    setColorLeft,
    setColorMiddle,
    setColorRight,
    setCustomTheme,
  ]);

  const { t } = useTranslation("settings");
  const { textColor, textShadow, buttonClass } = useMemo(
    () => ({
      textColor: getTextColor(settings.useLiquidGlass, settings.useDarkMode),
      textShadow: getTextShadow(settings.useLiquidGlass, settings.useDarkMode),
      buttonClass: getButtonClasses(settings.useLiquidGlass, settings.useDarkMode),
    }),
    [settings.useLiquidGlass, settings.useDarkMode],
  );

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-2">
      <Label className={`${textColor} p-1.5 ${textShadow}`}>{t("customTheme")}</Label>
      <ColorPicker
        className="w-10 cursor-pointer"
        onChange={setPendingColorLeft}
        value={displayColorLeft}
      />
      <ColorPicker
        className="w-10 cursor-pointer"
        onChange={setPendingColorMiddle}
        value={displayColorMiddle}
      />
      <ColorPicker
        className="w-10 cursor-pointer"
        onChange={setPendingColorRight}
        value={displayColorRight}
      />
      <Button
        className={`cursor-pointer ${buttonClass} ${textShadow}`}
        onClick={handleApplyChanges}
      >
        {t("applyChanges")}
      </Button>
      <EffectMixDialog />
    </div>
  );
});
