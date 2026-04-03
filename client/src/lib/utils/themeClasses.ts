/**
 * Get primary text color for any element
 */
export function getTextColor(useLiquidGlass: boolean, useDarkMode: boolean): string {
  if (useLiquidGlass) {
    return "text-white";
  }
  return useDarkMode ? "text-white" : "text-gray-900";
}

/**
 * Get subtext/muted text color
 */
export function getSubtextColor(useLiquidGlass: boolean, useDarkMode: boolean): string {
  if (useLiquidGlass) {
    return "text-white/60";
  }
  return useDarkMode ? "text-gray-400" : "text-gray-600";
}

/**
 * Get text shadow for better readability
 */
export function getTextShadow(useLiquidGlass: boolean, useDarkMode: boolean): string {
  if (useLiquidGlass) {
    return useDarkMode
      ? "[text-shadow:0_2px_4px_rgba(32,32,32,0.8)]"
      : "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]";
  }
  return useDarkMode
    ? "[text-shadow:0_1px_2px_rgba(0,0,0,0.3)]"
    : "[text-shadow:0_1px_2px_rgba(255,255,255,0.3)]";
}

/**
 * Get background classes for cards/containers
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

  const classes = {
    base: useDarkMode
      ? "bg-gray-900 border border-gray-700 shadow-xl shadow-black/60"
      : "bg-white border border-gray-200 shadow-xl shadow-gray-400/40",
    light: useDarkMode
      ? "bg-gray-800 border border-gray-700 shadow-lg shadow-black/50"
      : "bg-white border border-gray-200 shadow-lg shadow-gray-300/30",
    strong: useDarkMode
      ? "bg-gray-950 border border-gray-600 shadow-2xl shadow-black/70"
      : "bg-white border border-gray-300 shadow-2xl shadow-gray-500/50",
  };
  return classes[variant];
}

/**
 * Get button styling classes
 */
export function getButtonClasses(
  useLiquidGlass: boolean,
  useDarkMode: boolean,
  variant: "primary" | "secondary" | "outline" = "primary",
): string {
  if (useLiquidGlass) {
    const classes = {
      primary: useDarkMode
        ? "bg-black/30 backdrop-blur-lg border border-black/40 shadow-sm shadow-black/40 hover:bg-black/40 text-white hover:text-gray-100"
        : "bg-white/30 backdrop-blur-lg border border-white/30 shadow-sm shadow-white/20 hover:bg-white/40 text-white",
      secondary: useDarkMode
        ? "bg-black/20 backdrop-blur-lg border border-black/30 shadow-sm shadow-black/30 hover:bg-black/30 text-white hover:text-gray-100"
        : "bg-white/20 backdrop-blur-lg border border-white/20 shadow-sm shadow-white/15 hover:bg-white/30 text-white",
      outline: useDarkMode
        ? "bg-transparent border border-black/40 hover:bg-black/20 text-white hover:text-gray-100"
        : "bg-transparent border border-white/40 hover:bg-white/20 text-white",
    };
    return classes[variant];
  }

  const classes = {
    primary: useDarkMode
      ? "bg-gray-800 border border-gray-600 shadow-lg shadow-black/40 hover:bg-gray-700 hover:shadow-xl text-white hover:text-gray-100"
      : "bg-white border border-gray-300 shadow-lg shadow-gray-400/40 hover:bg-gray-50 hover:shadow-xl text-gray-900",
    secondary: useDarkMode
      ? "bg-gray-900 border border-gray-700 shadow-md shadow-black/30 hover:bg-gray-800 text-gray-200"
      : "bg-gray-100 border border-gray-200 shadow-md shadow-gray-300/30 hover:bg-gray-50 text-gray-700",
    outline: useDarkMode
      ? "bg-gray-900 border border-gray-600 hover:bg-gray-800 shadow-sm shadow-black/20 text-white hover:text-gray-100"
      : "bg-white border border-gray-400 hover:bg-gray-50 shadow-sm shadow-gray-300/20 text-gray-900",
  };
  return classes[variant];
}

/**
 * Get input/form control styling classes
 */
export function getInputClasses(useLiquidGlass: boolean, useDarkMode: boolean): string {
  if (useLiquidGlass) {
    return useDarkMode
      ? "bg-black/20 backdrop-blur-xl border border-black/30 shadow-lg shadow-black/10 text-white placeholder:text-white/45 focus-visible:ring-black/40 focus-visible:border-black/55"
      : "bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg shadow-white/10 text-white placeholder:text-white/45 focus-visible:ring-white/40 focus-visible:border-white/55";
  }

  return useDarkMode
    ? "bg-gray-900 border border-gray-700 shadow-md shadow-black/30 text-white placeholder:text-gray-500 focus-visible:ring-gray-600 focus-visible:border-gray-500"
    : "bg-white border border-gray-300 shadow-md shadow-gray-300/20 text-gray-900 placeholder:text-gray-400 focus-visible:ring-gray-400 focus-visible:border-gray-400";
}

/**
 * Get dialog/modal styling classes
 */
export function getDialogClasses(useLiquidGlass: boolean, useDarkMode: boolean): string {
  if (useLiquidGlass) {
    return useDarkMode
      ? "bg-black/45 backdrop-blur-2xl border border-black/45 shadow-2xl shadow-black/55"
      : "bg-white/35 backdrop-blur-2xl border border-white/35 shadow-2xl shadow-black/20";
  }

  return useDarkMode
    ? "bg-gray-900 border border-gray-700 shadow-2xl shadow-black/80"
    : "bg-white border border-gray-200 shadow-2xl shadow-gray-500/50";
}

/**
 * Get dialog footer styling classes
 */
export function getDialogFooterClasses(useLiquidGlass: boolean, useDarkMode: boolean): string {
  if (useLiquidGlass) {
    return useDarkMode
      ? "mt-4 pt-4 border-t border-black/35"
      : "mt-4 pt-4 border-t border-white/30";
  }

  return useDarkMode
    ? "mt-4 pt-4 border-t border-gray-700/50"
    : "mt-4 pt-4 border-t border-gray-300/50";
}
