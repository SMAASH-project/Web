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
  username: string;
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
      queryClient.removeQueries({ queryKey: ["auth", "whoami"] });
      queryClient.invalidateQueries();
    },
  });
}
