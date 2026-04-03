import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { AxiosError } from "axios";
import type { DtosUserLoginDTO, DtosUserReadDTO } from "@/lib/api.generated";

export type LoginPayload = DtosUserLoginDTO;

export interface LoginResponse {
  id: number;
  role: string;
}

type RequiredWhoAmIFields = Required<
  Pick<DtosUserReadDTO, "id" | "email" | "role" | "is_banned" | "last_login">
>;

export type WhoAmIResponse = RequiredWhoAmIFields;

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
      queryClient.removeQueries({ queryKey: ["auth", "whoami"] });
      queryClient.invalidateQueries();
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
