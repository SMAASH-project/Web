/**
 * Get liquid glass classes with dark mode support
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
 */
export function getLiquidGlassTextShadow(useLiquidGlass: boolean, useDarkMode: boolean): string {
  if (!useLiquidGlass) return "";
  return useDarkMode
    ? "[text-shadow:0_2px_4px_rgba(32,32,32,0.8)]"
    : "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]";
}

/**
 * Get highlight classes for liquid glass elements with dark mode support
 */
export function getLiquidGlassHighlight(useLiquidGlass: boolean, useDarkMode: boolean): string {
  if (!useLiquidGlass) return "";
  return useDarkMode ? "bg-black/20 rounded-sm" : "bg-white/20 rounded-sm";
}

/**
 * Get nav highlight classes for liquid glass navigation with dark mode support
 */
export function getLiquidGlassNavHighlight(useLiquidGlass: boolean, useDarkMode: boolean): string {
  if (!useLiquidGlass) return "";
  return useDarkMode ? "bg-black/20" : "bg-white/20";
}

/**
 * Glass dialog surface classes tuned for readability in dark mode.
 */
export function getLiquidGlassDialogClasses(useLiquidGlass: boolean, useDarkMode: boolean): string {
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
  return useDarkMode ? "mt-4 pt-4 border-t border-black/35" : "mt-4 pt-4 border-t border-white/30";
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
