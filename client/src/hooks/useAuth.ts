import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { AxiosError } from "axios";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  role: string;
}

export interface WhoAmIResponse {
  id: number;
  email: string;
  role: string;
  is_banned: boolean;
  last_login: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  role_id?: number;
}

// ─── Auth Queries ─────────────────────────────────────────────────────────────

export function useWhoAmIQuery() {
  return useQuery<WhoAmIResponse, AxiosError>({
    queryKey: ["auth", "whoami"],
    queryFn: async () => {
      const { data } = await apiClient.get<WhoAmIResponse>("/users/whoami");
      return data;
    },
    retry: false,
    staleTime: 0, // always refetch on mount
    gcTime: 0, // never write into the persisted localStorage cache
  });
}

// ─── Auth Mutations ───────────────────────────────────────────────────────────

export function useLoginMutation() {
  return useMutation<LoginResponse, AxiosError, LoginPayload>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
      return data;
    },
  });
}

export function useSignupMutation() {
  return useMutation<void, AxiosError, SignupPayload>({
    mutationFn: async (payload) => {
      await apiClient.post("/auth/signup", {
        ...payload,
        role_id: 1,
      });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError>({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
    onSuccess: () => {
      // Clear the entire query cache without triggering refetches.
      // invalidateQueries() would immediately re-fire all active queries
      // (profiles, whoami, etc.) against a now-dead session; those requests
      // return 401, hit the response interceptor, and cause a hard page reload
      // that races with the soft React Router navigation — producing the
      // flashing loop seen when logging out with no profile.
      queryClient.clear();
    },
  });
}

/**
 * Update the logged-in user's email address.
 *
 * Endpoint: PUT /api/users/:id
 * Body:     { id, email, role_id }
 *
 * NOTE: role_id is intentionally sent as 0. GORM's Updates() call in
 * BaseRepositoryActions skips zero-value struct fields, so the role is
 * preserved unchanged on the backend.
 *
 * TODO: BACKEND — Password cannot be changed here. The backend explicitly
 * excludes password from UserUpdateDTO. A separate PUT /api/auth/change-password
 * (or similar) endpoint needs to be created for that. See the PasswordResetForm
 * page for the existing reset flow.
 */
export function useUpdateUserEmailMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, { userId: number; email: string }>({
    mutationFn: async ({ userId, email }) => {
      await apiClient.put(`/users/${userId}`, {
        id: userId,
        email,
        role_id: 0, // zero → skipped by GORM Updates, role stays unchanged
      });
    },
    onSuccess: () => {
      // Invalidate whoami so the navbar/profile reflect the new email immediately
      queryClient.invalidateQueries({ queryKey: ["auth", "whoami"] });
    },
  });
}
