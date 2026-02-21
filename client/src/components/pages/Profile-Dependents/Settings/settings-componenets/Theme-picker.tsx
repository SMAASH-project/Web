import { ColorPicker } from "@/components/ui/color-picker";
import { useContext } from "react";
import { ColorContext } from "../settings-logic/color/ColorContext";

export const ThemePicker = () => {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error("ThemePicker must be used within a ColorProvider");
  }

  const {
    colorLeft,
    colorMiddle,
    colorRight,
    setColorLeft,
    setColorMiddle,
    setColorRight,
  } = context;

  return (
    <div className="w-100 flex items-center justify-center gap-10">
      <ColorPicker
        className="w-10"
        onChange={(v) => {
          setColorLeft(v);
        }}
        value={colorLeft}
      />
      <ColorPicker
        className="w-10"
        onChange={(v) => {
          setColorMiddle(v);
        }}
        value={colorMiddle}
      />
      <ColorPicker
        className="w-10"
        onChange={(v) => {
          setColorRight(v);
        }}
        value={colorRight}
      />
    </div>
  );
};
