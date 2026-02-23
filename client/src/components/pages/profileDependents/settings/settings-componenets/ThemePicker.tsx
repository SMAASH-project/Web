import { useContext, useState } from "react";
import { ColorContext } from "../settings-logic/color/ColorContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSettings } from "../settings-logic/SettingsContext";
import { ColorPicker } from "@/components/ui/color-picker";

export const ThemePicker = () => {
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
  } = context;

  // Track pending edits
  const [pendingColorLeft, setPendingColorLeft] = useState<string | null>(null);
  const [pendingColorMiddle, setPendingColorMiddle] = useState<string | null>(
    null,
  );
  const [pendingColorRight, setPendingColorRight] = useState<string | null>(
    null,
  );

  // Show pending value if editing, otherwise show applied value
  const displayColorLeft = pendingColorLeft ?? colorLeft;
  const displayColorMiddle = pendingColorMiddle ?? colorMiddle;
  const displayColorRight = pendingColorRight ?? colorRight;

  const handleApplyChanges = () => {
    if (pendingColorLeft !== null) setColorLeft(pendingColorLeft);
    if (pendingColorMiddle !== null) setColorMiddle(pendingColorMiddle);
    if (pendingColorRight !== null) setColorRight(pendingColorRight);
    setPendingColorLeft(null);
    setPendingColorMiddle(null);
    setPendingColorRight(null);
  };

  return (
    <div className="w-100 flex items-center justify-center gap-1">
      <Label
        className={`text-white p-1.5 ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""}`}
      >
        Custom Theme
      </Label>
      <ColorPicker
        className="w-10 cursor-pointer"
        onChange={(v) => {
          setPendingColorLeft(v);
        }}
        value={displayColorLeft}
      />
      <ColorPicker
        className="w-10 cursor-pointer"
        onChange={(v) => {
          setPendingColorMiddle(v);
        }}
        value={displayColorMiddle}
      />
      <ColorPicker
        className="w-10 cursor-pointer"
        onChange={(v) => {
          setPendingColorRight(v);
        }}
        value={displayColorRight}
      />
      <Button
        className={`text-white cursor-pointer ${settings.useLiquidGlass ? "bg-white/30 backdrop-blur-lg border-white/30 shadow-sm shadow-white/20[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""}`}
        onClick={handleApplyChanges}
      >
        Apply changes
      </Button>
    </div>
  );
};
