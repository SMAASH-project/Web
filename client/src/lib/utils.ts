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

// ============================================================================
// NEW COMPREHENSIVE THEMING SYSTEM (Works with/without liquid glass)
// ============================================================================

/**
 * Get primary text color for any element
 * @param useLiquidGlass - Whether liquid glass effect is enabled
 * @param useDarkMode - Whether dark mode is enabled
 * @returns Tailwind text color classes
 */
export function getTextColor(
  useLiquidGlass: boolean,
  useDarkMode: boolean,
): string {
  if (useLiquidGlass) {
    // Liquid glass always uses white text
    return "text-white";
  }
  // Solid mode: light theme = dark text, dark theme = light text
  return useDarkMode ? "text-white" : "text-gray-900";
}

/**
 * Get subtext/muted text color
 * @param useLiquidGlass - Whether liquid glass effect is enabled
 * @param useDarkMode - Whether dark mode is enabled
 * @returns Tailwind text color classes
 */
export function getSubtextColor(
  useLiquidGlass: boolean,
  useDarkMode: boolean,
): string {
  if (useLiquidGlass) {
    return "text-white/60";
  }
  return useDarkMode ? "text-gray-400" : "text-gray-600";
}

/**
 * Get text shadow for better readability
 * @param useLiquidGlass - Whether liquid glass effect is enabled
 * @param useDarkMode - Whether dark mode is enabled
 * @returns Tailwind shadow classes
 */
export function getTextShadow(
  useLiquidGlass: boolean,
  useDarkMode: boolean,
): string {
  if (useLiquidGlass) {
    return useDarkMode
      ? "[text-shadow:0_2px_4px_rgba(32,32,32,0.8)]"
      : "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]";
  }
  // Light text shadow for solid mode
  return useDarkMode
    ? "[text-shadow:0_1px_2px_rgba(0,0,0,0.3)]"
    : "[text-shadow:0_1px_2px_rgba(255,255,255,0.3)]";
}

/**
 * Get background classes for cards/containers
 * @param useLiquidGlass - Whether liquid glass effect is enabled
 * @param useDarkMode - Whether dark mode is enabled
 * @param variant - Intensity: 'base', 'light', or 'strong'
 * @returns Tailwind background and border classes
 */
export function getBackgroundClasses(
  useLiquidGlass: boolean,
  useDarkMode: boolean,
  variant: "base" | "light" | "strong" = "base",
): string {
  if (useLiquidGlass) {
    const classes = {
      base: useDarkMode
        ? "bg-black/30 backdrop-blur-lg border border-black/40 shadow-lg shadow-black/40"
        : "bg-white/30 backdrop-blur-lg border border-white/30 shadow-lg shadow-white/20",
      light: useDarkMode
        ? "bg-black/20 backdrop-blur-lg border border-black/30 shadow-md shadow-black/30"
        : "bg-white/20 backdrop-blur-lg border border-white/20 shadow-md shadow-white/15",
      strong: useDarkMode
        ? "bg-black/40 backdrop-blur-xl border border-black/50 shadow-xl shadow-black/50"
        : "bg-white/40 backdrop-blur-xl border border-white/40 shadow-xl shadow-white/25",
    };
    return classes[variant];
  }

  // Solid backgrounds with transparency to show gradient
  const classes = {
    base: useDarkMode
      ? "bg-gray-900/85 border border-gray-700/50 shadow-xl shadow-black/60"
      : "bg-white/85 border border-gray-200/50 shadow-xl shadow-gray-400/40",
    light: useDarkMode
      ? "bg-gray-800/80 border border-gray-700/40 shadow-lg shadow-black/50"
      : "bg-white/80 border border-gray-200/40 shadow-lg shadow-gray-300/30",
    strong: useDarkMode
      ? "bg-gray-950/90 border border-gray-600/60 shadow-2xl shadow-black/70"
      : "bg-white/90 border border-gray-300/60 shadow-2xl shadow-gray-500/50",
  };
  return classes[variant];
}

/**
 * Get button styling classes
 * @param useLiquidGlass - Whether liquid glass effect is enabled
 * @param useDarkMode - Whether dark mode is enabled
 * @param variant - Button type: 'primary', 'secondary', or 'outline'
 * @returns Tailwind button classes
 */
export function getButtonClasses(
  useLiquidGlass: boolean,
  useDarkMode: boolean,
  variant: "primary" | "secondary" | "outline" = "primary",
): string {
  if (useLiquidGlass) {
    const classes = {
      primary: useDarkMode
        ? "bg-black/30 backdrop-blur-lg border border-black/40 shadow-sm shadow-black/40 hover:bg-black/40 text-white"
        : "bg-white/30 backdrop-blur-lg border border-white/30 shadow-sm shadow-white/20 hover:bg-white/40 text-white",
      secondary: useDarkMode
        ? "bg-black/20 backdrop-blur-lg border border-black/30 shadow-sm shadow-black/30 hover:bg-black/30 text-white"
        : "bg-white/20 backdrop-blur-lg border border-white/20 shadow-sm shadow-white/15 hover:bg-white/30 text-white",
      outline: useDarkMode
        ? "bg-transparent border border-black/40 hover:bg-black/20 text-white"
        : "bg-transparent border border-white/40 hover:bg-white/20 text-white",
    };
    return classes[variant];
  }

  // Solid button styles
  const classes = {
    primary: useDarkMode
      ? "bg-gray-800/90 border border-gray-600/50 shadow-lg shadow-black/40 hover:bg-gray-700/95 hover:shadow-xl text-white"
      : "bg-white/90 border border-gray-300/60 shadow-lg shadow-gray-400/40 hover:bg-white/95 hover:shadow-xl text-gray-900",
    secondary: useDarkMode
      ? "bg-gray-900/80 border border-gray-700/40 shadow-md shadow-black/30 hover:bg-gray-800/85 text-gray-200"
      : "bg-gray-100/80 border border-gray-200/50 shadow-md shadow-gray-300/30 hover:bg-gray-50/85 text-gray-700",
    outline: useDarkMode
      ? "bg-transparent border border-gray-600/60 hover:bg-gray-800/50 shadow-sm shadow-black/20 text-white"
      : "bg-transparent border border-gray-400/60 hover:bg-white/50 shadow-sm shadow-gray-300/20 text-gray-900",
  };
  return classes[variant];
}

/**
 * Get input/form control styling classes
 * @param useLiquidGlass - Whether liquid glass effect is enabled
 * @param useDarkMode - Whether dark mode is enabled
 * @returns Tailwind input classes
 */
export function getInputClasses(
  useLiquidGlass: boolean,
  useDarkMode: boolean,
): string {
  if (useLiquidGlass) {
    return useDarkMode
      ? "bg-black/20 backdrop-blur-xl border border-black/30 shadow-lg shadow-black/10 text-white placeholder:text-white/45 focus-visible:ring-black/40 focus-visible:border-black/55"
      : "bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg shadow-white/10 text-white placeholder:text-white/45 focus-visible:ring-white/40 focus-visible:border-white/55";
  }

  return useDarkMode
    ? "bg-gray-900/70 border border-gray-700/50 shadow-md shadow-black/30 text-white placeholder:text-gray-500 focus-visible:ring-gray-600 focus-visible:border-gray-500"
    : "bg-white/70 border border-gray-300/60 shadow-md shadow-gray-300/20 text-gray-900 placeholder:text-gray-400 focus-visible:ring-gray-400 focus-visible:border-gray-400";
}

/**
 * Get dialog/modal styling classes
 * @param useLiquidGlass - Whether liquid glass effect is enabled
 * @param useDarkMode - Whether dark mode is enabled
 * @returns Tailwind dialog classes
 */
export function getDialogClasses(
  useLiquidGlass: boolean,
  useDarkMode: boolean,
): string {
  if (useLiquidGlass) {
    return useDarkMode
      ? "bg-black/45 backdrop-blur-2xl border border-black/45 shadow-2xl shadow-black/55"
      : "bg-white/35 backdrop-blur-2xl border border-white/35 shadow-2xl shadow-black/20";
  }

  return useDarkMode
    ? "bg-gray-900/95 border border-gray-700/60 shadow-2xl shadow-black/80"
    : "bg-white/95 border border-gray-200/60 shadow-2xl shadow-gray-500/50";
}

/**
 * Get dialog footer styling classes
 * @param useLiquidGlass - Whether liquid glass effect is enabled
 * @param useDarkMode - Whether dark mode is enabled
 * @returns Tailwind footer classes
 */
export function getDialogFooterClasses(
  useLiquidGlass: boolean,
  useDarkMode: boolean,
): string {
  if (useLiquidGlass) {
    return useDarkMode
      ? "mt-4 pt-4 border-t border-black/35"
      : "mt-4 pt-4 border-t border-white/30";
  }

  return useDarkMode
    ? "mt-4 pt-4 border-t border-gray-700/50"
    : "mt-4 pt-4 border-t border-gray-300/50";
}
