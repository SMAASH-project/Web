import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DateTime } from "luxon";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date-like value (Luxon DateTime, JS Date, or ISO/string) to a medium human string.
 */
export function formatDate(
  value: ReturnType<typeof DateTime.now> | Date | string | undefined | null,
): string {
  if (!value) return "";

  // If it's already a Luxon DateTime
  if (DateTime.isDateTime(value)) {
    return value.toLocaleString(DateTime.DATE_MED);
  }

  // If it's a JS Date
  if (value instanceof Date) {
    return DateTime.fromJSDate(value).toLocaleString(DateTime.DATE_MED);
  }

  // Try parsing as ISO or fallback to JS Date parsing
  const parsed = DateTime.fromISO(String(value));
  if (parsed.isValid) return parsed.toLocaleString(DateTime.DATE_MED);

  const fromJS = DateTime.fromJSDate(new Date(String(value)));
  return fromJS.isValid
    ? fromJS.toLocaleString(DateTime.DATE_MED)
    : String(value);
}

/**
 * Format a date-like value to include both date and time.
 */
export function formatDateTime(
  value: ReturnType<typeof DateTime.now> | Date | string | undefined | null,
): string {
  if (!value) return "";

  if (DateTime.isDateTime(value)) {
    return value.toLocaleString(DateTime.DATETIME_MED);
  }

  if (value instanceof Date) {
    return DateTime.fromJSDate(value).toLocaleString(DateTime.DATETIME_MED);
  }

  const parsed = DateTime.fromISO(String(value));
  if (parsed.isValid) return parsed.toLocaleString(DateTime.DATETIME_MED);

  const fromJS = DateTime.fromJSDate(new Date(String(value)));
  return fromJS.isValid
    ? fromJS.toLocaleString(DateTime.DATETIME_MED)
    : String(value);
}

/**
 * Get liquid glass classes with dark mode support
 * @param useLiquidGlass - Whether liquid glass effect is enabled
 * @param useDarkMode - Whether dark mode is enabled
 * @param variant - Type of liquid glass styling: 'base' (standard), 'input' (more transparent), or 'accent' (darker)
 * @returns Tailwind classes string
 */
export function getLiquidGlassClasses(
  useLiquidGlass: boolean,
  useDarkMode: boolean,
  variant: "base" | "input" | "accent" = "base",
): string {
  if (!useLiquidGlass) return "";

  const classes = {
    base: useDarkMode
      ? "bg-black/30 backdrop-blur-lg border-black/40 shadow-sm shadow-black/40"
      : "bg-white/30 backdrop-blur-lg border-white/30 shadow-sm shadow-white/20",
    input: useDarkMode
      ? "bg-black/20 backdrop-blur-xl border border-black/30 shadow-lg shadow-black/10 ring-1 ring-black/20"
      : "bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg shadow-white/10 ring-1 ring-white/20",
    accent: useDarkMode
      ? "bg-black/20 backdrop-blur-xl border border-black/30 shadow-lg shadow-black/10 ring-1 ring-black/20"
      : "bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg shadow-white/10 ring-1 ring-white/20",
  };

  return classes[variant];
}

/**
 * Get text shadow classes for liquid glass elements with dark mode support
 * @param useLiquidGlass - Whether liquid glass effect is enabled
 * @param useDarkMode - Whether dark mode is enabled
 * @returns Tailwind classes string
 */
export function getLiquidGlassTextShadow(
  useLiquidGlass: boolean,
  useDarkMode: boolean,
): string {
  if (!useLiquidGlass) return "";
  return useDarkMode
    ? "[text-shadow:0_2px_4px_rgba(32,32,32,0.8)]"
    : "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]";
}

/**
 * Get highlight classes for liquid glass elements with dark mode support
 * @param useLiquidGlass - Whether liquid glass effect is enabled
 * @param useDarkMode - Whether dark mode is enabled
 * @returns Tailwind classes string
 */
export function getLiquidGlassHighlight(
  useLiquidGlass: boolean,
  useDarkMode: boolean,
): string {
  if (!useLiquidGlass) return "";
  return useDarkMode ? "bg-black/20 rounded-sm" : "bg-white/20 rounded-sm";
}

/**
 * Get nav highlight classes for liquid glass navigation with dark mode support
 * @param useLiquidGlass - Whether liquid glass effect is enabled
 * @param useDarkMode - Whether dark mode is enabled
 * @returns Tailwind classes string
 */
export function getLiquidGlassNavHighlight(
  useLiquidGlass: boolean,
  useDarkMode: boolean,
): string {
  if (!useLiquidGlass) return "";
  return useDarkMode ? "bg-black/20" : "bg-white/20";
}

/**
 * Glass dialog surface classes tuned for readability in dark mode.
 */
export function getLiquidGlassDialogClasses(
  useLiquidGlass: boolean,
  useDarkMode: boolean,
): string {
  if (!useLiquidGlass) return "";
  return useDarkMode
    ? "bg-black/45 backdrop-blur-2xl border-black/45 shadow-2xl shadow-black/55 text-white"
    : "bg-white/35 backdrop-blur-2xl border-white/35 shadow-2xl shadow-black/20 text-white";
}

/**
 * Glass dialog footer strip classes to avoid harsh flat footer contrast.
 */
export function getLiquidGlassDialogFooterClasses(
  useLiquidGlass: boolean,
  useDarkMode: boolean,
): string {
  if (!useLiquidGlass) return "";
  return useDarkMode
    ? "mt-4 pt-4 border-t border-black/35"
    : "mt-4 pt-4 border-t border-white/30";
}

/**
 * Glass form control classes for inputs/textarea/select inside dialogs.
 */
export function getLiquidGlassControlClasses(
  useLiquidGlass: boolean,
  useDarkMode: boolean,
): string {
  if (!useLiquidGlass) return "";
  return useDarkMode
    ? "bg-black/30 border-black/40 text-white placeholder:text-white/45 focus-visible:ring-black/40 focus-visible:border-black/55"
    : "bg-white/25 border-white/35 text-white placeholder:text-white/45 focus-visible:ring-white/40 focus-visible:border-white/55";
}
