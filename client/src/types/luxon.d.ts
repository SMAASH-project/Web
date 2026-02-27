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
