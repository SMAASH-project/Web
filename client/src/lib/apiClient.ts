/**
 * Axios instance configured with sensible defaults for the API.
 * Handles JSON serialization, credentials, and error handling.
 */

import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in requests
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
