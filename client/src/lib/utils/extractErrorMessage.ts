import type { AxiosError } from "axios";

/**
 * Extracts a human-readable string from an Axios error.
 *
 * The Go backend returns errors in several shapes:
 *   { error: "message" }          — most endpoints
 *   { message: "message" }        — some validation errors
 *   "plain string"                — rare, some older endpoints
 *
 * Using String() or .toString() on the response data object gives
 * "[object Object]" — this function handles all cases properly.
 *
 * @param error   The caught error (may be AxiosError or unknown)
 * @param fallback Translated fallback string shown when no message can be extracted
 */
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;

  const axiosError = error as AxiosError;
  const data = axiosError?.response?.data;

  if (typeof data === "string" && data.trim().length > 0) {
    return data.trim();
  }

  if (data && typeof data === "object") {
    // { error: "..." }
    const asRecord = data as Record<string, unknown>;
    if (typeof asRecord.error === "string" && asRecord.error.trim()) {
      return asRecord.error.trim();
    }
    // { message: "..." }
    if (typeof asRecord.message === "string" && asRecord.message.trim()) {
      return asRecord.message.trim();
    }
  }

  // Axios built-in message (e.g. "Network Error")
  if (axiosError?.message && typeof axiosError.message === "string") {
    return axiosError.message;
  }

  return fallback;
}
