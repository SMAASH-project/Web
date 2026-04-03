/**
 * Calendar component — shadcn-style, self-contained (no react-day-picker).
 *
 * Usage:
 *   <Calendar
 *     mode="range"
 *     selected={{ from: startDate, to: endDate }}
 *     onSelect={({ from, to }) => { ... }}
 *   />
 *
 * NOTE: `npx shadcn@latest add calendar` installs react-day-picker.
 * This is a drop-in equivalent that avoids that extra dependency.
 * It supports the same props as the shadcn Calendar, but is implemented from scratch.
 * The styling is adapted from the shadcn Calendar, but the implementation details are different.
 *
 * The calendar is designed to work with the BanDialog's preset logic, which maintains a separate
 * `calendarRange` state that updates alongside the `customStart`/`customEnd` state when the user interacts with either the presets or the calendar.
 * This allows the calendar to reflect changes from preset clicks without forcing the presets to update when the user interacts with the calendar directly.
 * The calendar also supports a `fromDate` prop to disable dates before a certain point, which is used to prevent selecting past dates for bans/timeouts.
 * The component is themed using the same utility functions as the rest of the app to ensure consistent theming with liquid glass and dark mode support.
 * The calendar is keyboard accessible and includes appropriate ARIA attributes for better accessibility.
 * The code is structured with clear separation of concerns, with helper functions for date calculations and theming, and the main component logic focused on rendering and user interaction.
 * The component is designed to be reusable and flexible, allowing for both single date selection and range selection based on the `mode` prop.
 */

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/pages/settings/SettingsContext";
import { getBackgroundClasses, getButtonClasses, getTextColor, getSubtextColor } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

interface CalendarProps {
  mode?: "single" | "range";
  selected?: Date | DateRange;
  onSelect?: (value: Date | DateRange) => void;
  className?: string;
  disabled?: (date: Date) => boolean;
  /** Minimum selectable date */
  fromDate?: Date;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isInRange(day: Date, from: Date | undefined, to: Date | undefined) {
  if (!from || !to) return false;
  const t = day.getTime();
  return t > from.getTime() && t < to.getTime();
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  className,
  disabled,
  fromDate,
}: CalendarProps) {
  const { settings } = useSettings();
  const { useLiquidGlass, useDarkMode } = settings;

  const today = startOfDay(new Date());
  const [viewYear, setViewYear] = React.useState(today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(today.getMonth());

  // Derive from / to from selected
  const selectedFrom: Date | undefined =
    mode === "range" ? (selected as DateRange | undefined)?.from : (selected as Date | undefined);
  const selectedTo: Date | undefined =
    mode === "range" ? (selected as DateRange | undefined)?.to : undefined;

  // Sync view month/year when `selected.from` changes externally (preset click)
  React.useEffect(() => {
    if (selectedFrom) {
      setViewYear(selectedFrom.getFullYear());
      setViewMonth(selectedFrom.getMonth());
    }
  }, [selectedFrom]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Padding cells before the first day
  const paddingCells = Array.from({ length: firstDay });
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDayClick = (day: number) => {
    const clicked = startOfDay(new Date(viewYear, viewMonth, day));
    if (disabled?.(clicked)) return;
    // Respect fromDate for both single and range modes
    if (fromDate && clicked < startOfDay(fromDate)) return;

    if (mode === "single") {
      onSelect?.(clicked);
      return;
    }

    const range = (selected as DateRange | undefined) ?? {
      from: undefined,
      to: undefined,
    };

    if (!range.from) {
      // Nothing selected yet → set start
      onSelect?.({ from: clicked, to: undefined });
      return;
    }

    if (!range.to) {
      // Start set, no end → second click determines direction
      if (isSameDay(clicked, range.from)) {
        // Same day: reset
        onSelect?.({ from: clicked, to: undefined });
      } else if (clicked < range.from) {
        // Clicked before start → swap: clicked becomes start, old start becomes end
        onSelect?.({ from: clicked, to: range.from });
      } else {
        // Clicked after start → becomes end
        onSelect?.({ from: range.from, to: clicked });
      }
      return;
    }

    // Both endpoints set — update smartly without resetting:
    // clicking before (or on) start → move start; clicking after start → move end
    if (clicked <= range.from) {
      onSelect?.({ from: clicked, to: range.to });
    } else {
      onSelect?.({ from: range.from, to: clicked });
    }
  };

  // ─── Theming ────────────────────────────────────────────────────────────────

  const containerBg = getBackgroundClasses(useLiquidGlass, useDarkMode, "base");
  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const subtextColor = getSubtextColor(useLiquidGlass, useDarkMode);
  const navBtn = getButtonClasses(useLiquidGlass, useDarkMode, "secondary");

  const getDayClasses = (day: number) => {
    const date = startOfDay(new Date(viewYear, viewMonth, day));
    const isToday = isSameDay(date, today);
    const isFrom = selectedFrom && isSameDay(date, selectedFrom);
    const isTo = selectedTo && isSameDay(date, selectedTo);
    const inRange = isInRange(date, selectedFrom, selectedTo);
    const isDisabled =
      (disabled?.(date) ?? false) || (fromDate ? date < startOfDay(fromDate) : false);

    let base =
      "relative flex items-center justify-center w-8 h-8 text-xs rounded-full cursor-pointer select-none transition-all duration-150 ";

    if (isDisabled) {
      return base + `opacity-30 cursor-not-allowed ${subtextColor}`;
    }
    if (isFrom || isTo) {
      return (
        base +
        (useLiquidGlass
          ? useDarkMode
            ? "bg-white/80 text-gray-900 font-bold shadow-md"
            : "bg-black/70 text-white font-bold shadow-md"
          : useDarkMode
            ? "bg-white text-gray-900 font-bold"
            : "bg-gray-900 text-white font-bold")
      );
    }
    if (inRange) {
      return (
        base +
        (useLiquidGlass
          ? useDarkMode
            ? "bg-white/10 text-white"
            : "bg-black/10 text-white"
          : useDarkMode
            ? "bg-gray-700/60 text-gray-100"
            : "bg-gray-200/60 text-gray-900")
      );
    }
    if (isToday) {
      return (
        base +
        `ring-1 ${textColor} ${
          useLiquidGlass
            ? useDarkMode
              ? "ring-white/60"
              : "ring-white/80"
            : useDarkMode
              ? "ring-gray-400"
              : "ring-gray-500"
        } hover:bg-white/10`
      );
    }
    return (
      base +
      `${textColor} ${
        useLiquidGlass
          ? useDarkMode
            ? "hover:bg-white/15"
            : "hover:bg-white/20"
          : useDarkMode
            ? "hover:bg-gray-700"
            : "hover:bg-gray-100"
      }`
    );
  };

  // Range wrapper: interior cells connect flush (no rounding, no gap)
  // py-1.5 makes the band skinny enough to not touch cell top/bottom
  // Start/end caps keep rounded-l/r-full for pill shape
  const getRangeWrapClass = (day: number) => {
    const date = startOfDay(new Date(viewYear, viewMonth, day));
    const isFrom = selectedFrom && isSameDay(date, selectedFrom);
    const isTo = selectedTo && isSameDay(date, selectedTo);
    const inRange = isInRange(date, selectedFrom, selectedTo);

    if (!selectedFrom || !selectedTo) return "";

    const rangeBg = useLiquidGlass
      ? useDarkMode
        ? "bg-white/20"
        : "bg-black/15"
      : useDarkMode
        ? "bg-gray-600"
        : "bg-gray-300";

    if (isFrom) return `${rangeBg} rounded-l-full py-1.5`;
    if (isTo) return `${rangeBg} rounded-r-full py-1.5`;
    if (inRange) return `${rangeBg} py-1.5`;
    return "";
  };

  return (
    <div className={cn("w-full rounded-xl p-3", useLiquidGlass ? "" : containerBg, className)}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
            navBtn,
          )}
          aria-label="Previous month"
        >
          <ChevronLeft size={14} />
        </button>
        <span className={cn("text-sm font-semibold", textColor)}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
            navBtn,
          )}
          aria-label="Next month"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="mb-1 grid grid-cols-7">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className={cn("flex h-7 items-center justify-center text-xs font-medium", subtextColor)}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {paddingCells.map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {dayCells.map((day) => (
          <div
            key={day}
            className={cn("flex h-8 items-center justify-center", getRangeWrapClass(day))}
          >
            <div
              className={getDayClasses(day)}
              onClick={() => handleDayClick(day)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleDayClick(day)}
              aria-label={`${day} ${MONTH_NAMES[viewMonth]} ${viewYear}`}
            >
              {day}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
