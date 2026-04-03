/**
 * Axios instance configured with sensible defaults for the API.
 * Handles JSON serialization, credentials, and error handling.
 */

import axios from "axios";
import { validateKnownApiResponse } from "@/lib/apiSchemas";

const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true, // Include cookies in requests
});

function getDebugNetworkDelayMs(): number {
  try {
    const raw = localStorage.getItem("debug-settings");
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as {
      networkDelayMs?: number;
      networkJitterMs?: number;
    };
    const base = Math.max(0, Number(parsed.networkDelayMs ?? 0));
    const jitter = Math.max(0, Number(parsed.networkJitterMs ?? 0));
    if (base <= 0 && jitter <= 0) return 0;

    const jitterOffset = jitter > 0 ? (Math.random() * 2 - 1) * jitter : 0;
    return Math.max(0, Math.round(base + jitterOffset));
  } catch {
    return 0;
  }
}

apiClient.interceptors.request.use(async (config) => {
  const debugDelayMs = getDebugNetworkDelayMs();
  if (debugDelayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, debugDelayMs));
  }

  const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;

  // Let the browser set multipart boundaries for FormData automatically.
  if (isFormData) {
    if (config.headers && "Content-Type" in config.headers) {
      delete (config.headers as Record<string, unknown>)["Content-Type"];
    }
    return config;
  }

  config.headers = config.headers ?? {};
  if (!("Content-Type" in config.headers)) {
    (config.headers as Record<string, unknown>)["Content-Type"] = "application/json";
  }

  return config;
});

/**
 * Response interceptor for consistent error handling.
 * All responses are normalized to { data, status, ok }.
 *
 * 401 handling: any 401 that is NOT from an auth endpoint (login, signup,
 * logout) means the session cookie has expired mid-session. We hard-redirect
 * to the login page; the full page reload clears all in-memory React state
 * automatically so there's nothing else to tear down.
 */
apiClient.interceptors.response.use(
  (response) => {
    const validation = validateKnownApiResponse(
      response.config.method,
      response.config.url,
      response.data,
    );

    if (validation.matched) {
      response.data = validation.data;
    }

    return response;
  },
  (error) => {
    // Pass through network errors without modification
    if (!error.response) {
      return Promise.reject(error);
    }

    // Session expiry: redirect to login.
    // Auth endpoints are excluded to avoid a redirect loop when a user simply
    // enters the wrong password (which also returns 401).
    const requestUrl: string = error.config?.url ?? "";
    const isAuthEndpoint = requestUrl.includes("/auth/") || requestUrl.includes("/users/whoami");
    if (error.response.status === 401 && !isAuthEndpoint) {
      window.location.href = "/app/login";
      // Return a promise that never resolves so no downstream error handler
      // tries to render an error state on a page that's being navigated away.
      return new Promise(() => {});
    }

    // Normalize API error responses
    const errorData = error.response.data || {
      message: error.message,
      path: error.config?.url,
    };

    error.data = errorData;
    return Promise.reject(error);
  },
);

export default apiClient;
