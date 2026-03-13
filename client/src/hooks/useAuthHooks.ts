import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { AxiosError } from "axios";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  id?: number | string;
  role_id?: number | string;
  roleId?: number | string;
  role?: {
    id?: number | string;
  };
}

export interface SignupPayload {
  email: string;
  password: string;
  username: string;
  role_id?: number;
}

// ─── Auth Mutations ──────────────────────────────────────────────────────────

export function useLoginMutation() {
  return useMutation<LoginResponse, AxiosError, LoginPayload>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<LoginResponse>(
        "/auth/login",
        payload,
      );
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
      // Invalidate all queries on logout
      queryClient.invalidateQueries();
    },
  });
}
