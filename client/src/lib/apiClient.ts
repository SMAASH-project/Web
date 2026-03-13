/**
 * Axios instance configured with sensible defaults for the API.
 * Handles JSON serialization, credentials, and error handling.
 */

import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true, // Include cookies in requests
});

apiClient.interceptors.request.use((config) => {
  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  // Let the browser set multipart boundaries for FormData automatically.
  if (isFormData) {
    if (config.headers && "Content-Type" in config.headers) {
      delete (config.headers as Record<string, unknown>)["Content-Type"];
    }
    return config;
  }

  config.headers = config.headers ?? {};
  if (!("Content-Type" in config.headers)) {
    (config.headers as Record<string, unknown>)["Content-Type"] =
      "application/json";
  }

  return config;
});

/**
 * Response interceptor for consistent error handling.
 * All responses are normalized to { data, status, ok }.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Pass through network errors without modification
    if (!error.response) {
      return Promise.reject(error);
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
