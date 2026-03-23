import { DateTime } from "luxon";

/**
 * Format a date-like value (Luxon DateTime, JS Date, or ISO/string) to a medium human string.
 */
export function formatDate(
  value: DateTime | Date | string | undefined | null,
): string {
  if (!value) return "";

  if (DateTime.isDateTime(value)) {
    return value.toLocaleString(DateTime.DATE_MED);
  }

  if (value instanceof Date) {
    return DateTime.fromJSDate(value).toLocaleString(DateTime.DATE_MED);
  }

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
  value: DateTime | Date | string | undefined | null,
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
