type RgbColor = { r: number; g: number; b: number };

function clampColor(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function normalizeHexColor(input: string): string {
  const value = input.trim();
  const short = /^#([0-9a-fA-F]{3})$/;
  const full = /^#([0-9a-fA-F]{6})$/;

  if (short.test(value)) {
    const [, raw] = value.match(short)!;
    return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`.toLowerCase();
  }

  if (full.test(value)) {
    return value.toLowerCase();
  }

  return "#808080";
}

function hexToRgb(hex: string): RgbColor {
  const normalized = normalizeHexColor(hex).replace("#", "");
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: RgbColor): string {
  const toHex = (n: number) => clampColor(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Average multiple hex colors into one representative theme color.
 */
export function getAverageHexColor(colors: string[]): string {
  if (colors.length === 0) return "#808080";

  const total = colors.reduce(
    (acc, color) => {
      const rgb = hexToRgb(color);
      return {
        r: acc.r + rgb.r,
        g: acc.g + rgb.g,
        b: acc.b + rgb.b,
      };
    },
    { r: 0, g: 0, b: 0 },
  );

  return rgbToHex({
    r: total.r / colors.length,
    g: total.g / colors.length,
    b: total.b / colors.length,
  });
}

/**
 * Lighten a hex color by mixing it with white.
 * @param amount Range: 0..1
 */
export function lightenHexColor(hex: string, amount = 0.2): string {
  const safeAmount = Math.max(0, Math.min(1, amount));
  const rgb = hexToRgb(hex);
  return rgbToHex({
    r: rgb.r + (255 - rgb.r) * safeAmount,
    g: rgb.g + (255 - rgb.g) * safeAmount,
    b: rgb.b + (255 - rgb.b) * safeAmount,
  });
}

/**
 * Convert a hex color to rgba for shadows/overlays.
 */
export function toRgbaColor(hex: string, alpha = 1): string {
  const safeAlpha = Math.max(0, Math.min(1, alpha));
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
}

/**
 * Convert a hex color to an [r, g, b] tuple — used by canvas-based backgrounds.
 */
export function hexToRgbTuple(hex: string): [number, number, number] {
  const { r, g, b } = hexToRgb(hex);
  return [r, g, b];
}

/**
 * Linear interpolation between two numbers.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
