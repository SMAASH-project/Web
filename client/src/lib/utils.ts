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
