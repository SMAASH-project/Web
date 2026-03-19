declare module "luxon" {
  // Minimal DateTime shape used in this project
  export interface LuxonDateTime {
    toLocaleString(format?: unknown): string;
    toJSDate(): Date;
    isValid: boolean;
  }

  export const DateTime: {
    isDateTime(obj: unknown): obj is LuxonDateTime;
    fromJSDate(d: Date): LuxonDateTime;
    fromISO(s: string): LuxonDateTime;
    /**
     * Parses a string with an explicit format pattern.
     * Relevant tokens for RFC822 ("18 Mar 26 10:12 +0100"):
     *   dd  – 2-digit day
     *   MMM – abbreviated month name
     *   yy  – 2-digit year, always interpreted as 2000–2099
     *   HH  – 24-hour hour
     *   mm  – minutes
     *   ZZZ – numeric offset (e.g. +0100)
     */
    fromFormat(str: string, fmt: string): LuxonDateTime;
    now(): LuxonDateTime;
    DATE_MED: unknown;
    DATETIME_MED: unknown;
  };

  export const Duration: unknown;
  export const Interval: unknown;
  export const Settings: unknown;

  const _default: unknown;
  export default _default;
}
