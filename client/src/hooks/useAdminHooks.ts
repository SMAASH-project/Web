/**
 * Admin-specific React Query hooks.
 *
 * All hooks in this file are wired to the API client.
 * Endpoints marked TODO: BACKEND do not exist yet — see BACKEND_NOTES.md for
 * the exact routes, DTOs, and middleware that need to be added on the Go side.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { AxiosError } from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Extended user read DTO for the admin panel.
 *
 * TODO: BACKEND — The current UserReadDTO is missing `username` and `ban_until`.
 * See BACKEND_NOTES.md §1 for the updated struct.
 */
export interface AdminUserDTO {
  id: number;
  email: string;
  /** Display name from first profile — needs to be added to backend DTO */
  username: string;
  role: string;
  is_banned: boolean;
  /** ISO datetime string of when the ban expires; null = permanent / not banned */
  ban_until: string | null;
  last_login: string;
}

export interface BanPayload {
  /** "permanent" sets is_banned=true with no expiry; "temporary" uses ban_until */
  ban_type: "permanent" | "temporary";
  /** Only required when ban_type is "temporary". ISO 8601 datetime string. */
  ban_until?: string;
  /**
   * Optional human-readable reason for the ban — stored on the backend and
   * can be shown to the user or in audit logs.
   * TODO: BACKEND — add `reason` field to the ban endpoint. See BACKEND_NOTES.md §2b.
   */
  reason?: string;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const adminQueryKeys = {
  users: {
    all: ["admin", "users"] as const,
    search: (q: string) => ["admin", "users", "search", q] as const,
    byId: (id: number) => ["admin", "users", id] as const,
  },
} as const;

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Fetch all users for the admin panel.
 *
 * TODO: BACKEND — Once the backend supports `?search=` query param, pass it
 * through here. The current /api/users endpoint returns all users without
 * filtering; the frontend falls back to client-side filtering until then.
 *
 * Endpoint: GET /api/users
 */
export function useAdminUsersQuery(searchQuery?: string) {
  return useQuery<AdminUserDTO[], AxiosError>({
    queryKey: searchQuery
      ? adminQueryKeys.users.search(searchQuery)
      : adminQueryKeys.users.all,
    queryFn: async () => {
      // TODO: BACKEND — add ?search= query param support on the server.
      // When available, change to: `/users?search=${encodeURIComponent(searchQuery ?? "")}`
      const { data } = await apiClient.get<AdminUserDTO[]>("/users");
      return data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch a single user by id (includes ban status and all fields).
 *
 * TODO: BACKEND — Ensure the extended UserReadDTO (with username + ban_until)
 * is returned from GET /api/users/:id. See BACKEND_NOTES.md §1.
 *
 * Endpoint: GET /api/users/:id
 */
export function useAdminUserQuery(userId: number | null) {
  return useQuery<AdminUserDTO, AxiosError>({
    queryKey: adminQueryKeys.users.byId(userId ?? 0),
    queryFn: async () => {
      const { data } = await apiClient.get<AdminUserDTO>(`/users/${userId}`);
      return data;
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Ban a user (permanent or timed).
 *
 * TODO: BACKEND — This endpoint does not exist yet.
 * Route:   POST /api/admin/users/:id/ban
 * Auth:    Requires admin role (AdminOnly middleware)
 * Body:    { ban_type: "permanent" | "temporary", ban_until?: string }
 * Returns: 204 No Content
 *
 * See BACKEND_NOTES.md §2 for full implementation details.
 */
export function useBanUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, { userId: number; payload: BanPayload }>(
    {
      mutationFn: async ({ userId, payload }) => {
        // TODO: BACKEND — change path to /admin/users/:id/ban once the route exists.
        await apiClient.post(`/admin/users/${userId}/ban`, payload);
      },
      onSuccess: (_data, variables) => {
        // Invalidate the user list and the specific user entry
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.users.all });
        queryClient.invalidateQueries({
          queryKey: adminQueryKeys.users.byId(variables.userId),
        });
      },
    },
  );
}

/**
 * Unban a user.
 *
 * TODO: BACKEND — This endpoint does not exist yet.
 * Route:   POST /api/admin/users/:id/unban
 * Auth:    Requires admin role (AdminOnly middleware)
 * Returns: 204 No Content
 *
 * See BACKEND_NOTES.md §2c for implementation details.
 */
export function useUnbanUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, { userId: number }>({
    mutationFn: async ({ userId }) => {
      // TODO: BACKEND — change path to /admin/users/:id/unban once the route exists.
      await apiClient.post(`/admin/users/${userId}/unban`);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users.all });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.users.byId(variables.userId),
      });
    },
  });
}
