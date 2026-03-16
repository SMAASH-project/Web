import { useCallback, useState, useMemo } from "react";
import type * as React from "react";
import type { DateRange } from "@/components/ui/calendar";

export type BanPreset =
  | "permanent"
  | "1h"
  | "12h"
  | "24h"
  | "7d"
  | "31d"
  | "365d"
  | "custom";

export interface PresetConfig {
  id: BanPreset;
  label: string;
  description: string;
  icon: React.ReactNode;
  section: "timeout" | "ban" | "custom";
  compute?: (now: Date) => Date;
}

function addToDate(base: Date, unit: "h" | "d", amount: number): Date {
  const d = new Date(base);
  if (unit === "h") d.setHours(d.getHours() + amount);
  if (unit === "d") d.setDate(d.getDate() + amount);
  return d;
}

/** Merge a calendar-picked date (date-only, time = midnight) with an existing time */
function mergeDateWithTime(calendarDate: Date, existingTime: Date): Date {
  const d = new Date(calendarDate);
  d.setHours(existingTime.getHours(), existingTime.getMinutes(), 0, 0);
  return d;
}

export const PRESETS: PresetConfig[] = [
  {
    id: "permanent",
    label: "Permanent Ban",
    description: "No expiry",
    icon: null,
    section: "ban",
  },
  {
    id: "1h",
    label: "1-Hour Timeout",
    description: "1 hour",
    icon: null,
    section: "timeout",
    compute: (now) => addToDate(now, "h", 1),
  },
  {
    id: "12h",
    label: "12-Hour Timeout",
    description: "12 hours",
    icon: null,
    section: "timeout",
    compute: (now) => addToDate(now, "h", 12),
  },
  {
    id: "24h",
    label: "24-Hour Timeout",
    description: "24 hours",
    icon: null,
    section: "timeout",
    compute: (now) => addToDate(now, "h", 24),
  },
  {
    id: "7d",
    label: "7-Day Ban",
    description: "7 days",
    icon: null,
    section: "ban",
    compute: (now) => addToDate(now, "d", 7),
  },
  {
    id: "31d",
    label: "31-Day Ban",
    description: "31 days",
    icon: null,
    section: "ban",
    compute: (now) => addToDate(now, "d", 31),
  },
  {
    id: "365d",
    label: "365-Day Ban",
    description: "1 year",
    icon: null,
    section: "ban",
    compute: (now) => addToDate(now, "d", 365),
  },
];

export function useBanDialogLogic(initialOpen = false) {
  const now = useMemo(() => new Date(), []);
  const [open, setOpen] = useState(initialOpen);
  const [selectedPreset, setSelectedPreset] = useState<BanPreset | null>(null);
  const [customStart, setCustomStart] = useState<Date>(now);
  const [customEnd, setCustomEnd] = useState<Date | undefined>(undefined);
  const [calendarRange, setCalendarRange] = useState<DateRange>({
    from: now,
    to: undefined,
  });
  const [banReason, setBanReason] = useState<string>("");

  const reset = useCallback(() => {
    const fresh = new Date();
    setSelectedPreset(null);
    setCustomStart(fresh);
    setCustomEnd(undefined);
    setCalendarRange({ from: fresh, to: undefined });
    setBanReason("");
  }, []);

  const handlePresetSelect = useCallback((preset: PresetConfig) => {
    setSelectedPreset(preset.id);
    if (preset.id === "permanent") {
      const now2 = new Date();
      setCalendarRange({ from: now2, to: undefined });
      setCustomStart(now2);
      setCustomEnd(undefined);
      return;
    }
    if (preset.id === "custom") return;
    const end = preset.compute?.(new Date());
    const start = new Date();
    setCustomStart(start);
    setCustomEnd(end);
    setCalendarRange({ from: start, to: end });
  }, []);

  /** Called when user changes start time (HH:MM) — full Date with new time */
  const handleStartChange = useCallback((d?: Date) => {
    if (!d) return;
    setCustomStart(d);
    setCalendarRange((prev) => ({ ...prev, from: d }));
    setSelectedPreset("custom");
  }, []);

  /** Called when user changes end time (HH:MM) — full Date with new time */
  const handleEndChange = useCallback((d?: Date) => {
    setCustomEnd(d);
    setCalendarRange((prev) => ({ ...prev, to: d }));
    setSelectedPreset("custom");
  }, []);

  /**
   * Called when user clicks a date on the calendar.
   * Preserves existing HH:MM from the current start/end so time pickers
   * don't reset when the user picks a different date.
   */
  const handleCalendarSelect = useCallback(
    (range: DateRange) => {
      const newFrom = range.from
        ? mergeDateWithTime(range.from, customStart)
        : range.from;
      const newTo = range.to
        ? mergeDateWithTime(range.to, customEnd ?? range.to)
        : range.to;

      const merged: DateRange = { from: newFrom, to: newTo };
      setCalendarRange(merged);
      if (newFrom) setCustomStart(newFrom);
      if (newTo) setCustomEnd(newTo);
      setSelectedPreset("custom");
    },
    [customStart, customEnd],
  );

  const canConfirm = useMemo(
    () =>
      selectedPreset !== null &&
      (selectedPreset === "permanent" || !!customEnd),
    [selectedPreset, customEnd],
  );

  return {
    open,
    setOpen,
    selectedPreset,
    setSelectedPreset,
    customStart,
    customEnd,
    calendarRange,
    banReason,
    setBanReason,
    reset,
    handlePresetSelect,
    handleStartChange,
    handleEndChange,
    handleCalendarSelect,
    canConfirm,
    PRESETS,
  };
}
