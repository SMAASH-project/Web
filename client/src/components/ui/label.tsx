import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn, getTextColor } from "../../lib/utils";
import { useSettings } from "../pages/profileDependents/settings/settingsLogic/SettingsContext";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { settings } = useSettings();
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);

  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        textColor,
        className,
      )}
      {...props}
    />
  );
}

export { Label };
