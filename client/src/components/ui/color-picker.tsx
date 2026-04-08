import { forwardRef, useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { cn, getLiquidGlassDialogClasses, getLiquidGlassControlClasses } from "@/lib/utils";
import { useForwardedRef } from "@/lib/useForwardedRef";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/pages/settings/SettingsContext";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

const ColorPicker = forwardRef<
  HTMLInputElement,
  Omit<ButtonProps, "value" | "onChange" | "onBlur"> & ColorPickerProps
>(({ disabled, value, onChange, onBlur, name, className, size, ...props }, forwardedRef) => {
  const ref = useForwardedRef(forwardedRef);
  const [open, setOpen] = useState(false);
  const { settings } = useSettings();

  const parsedValue = useMemo(() => {
    return value || "#FFFFFF";
  }, [value]);

  const dialogClasses = getLiquidGlassDialogClasses(settings.useLiquidGlass, settings.useDarkMode);
  const controlClasses = getLiquidGlassControlClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );

  const borderClass = settings.useLiquidGlass
    ? settings.useDarkMode
      ? "border-black/60 shadow-sm shadow-black/40"
      : "border-white/60 shadow-sm shadow-white/40"
    : "";

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild disabled={disabled} onBlur={onBlur}>
        <Button
          {...props}
          className={cn("block", borderClass, className)}
          name={name}
          onClick={() => {
            setOpen(true);
          }}
          size={size}
          style={{
            backgroundColor: parsedValue,
          }}
          variant="outline"
        >
          <div />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-full", dialogClasses)}>
        <HexColorPicker color={parsedValue} onChange={onChange} />
        <Input
          className={controlClasses}
          maxLength={7}
          onChange={(e) => {
            onChange(e?.currentTarget?.value);
          }}
          ref={ref}
          value={parsedValue}
        />
      </PopoverContent>
    </Popover>
  );
});
ColorPicker.displayName = "ColorPicker";

export { ColorPicker };
