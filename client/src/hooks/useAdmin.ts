/**
 * Admin-specific React Query hooks.
 *
 * All hooks in this file are wired to the API client.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { AxiosError } from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Matches the backend UserReadDTO:
 *   { id, email, role, is_banned, banned_until, last_login }
 *
 * NOTE: `username` is not returned by the backend yet — components fall back
 * to `email` when it is absent.
 */
export interface AdminUserDTO {
  id: number;
  email: string;
  /** Not yet returned by the backend; components fall back to email. */
  username: string;
  role: string;
  is_banned: boolean;
  /** Formatted datetime string of when the ban expires; empty string = not banned. */
  banned_until: string;
  last_login: string;
}

/** Frontend-internal representation of a ban request before conversion. */
export interface BanPayload {
  /** "permanent" uses a very large period; "temporary" derives minutes from ban_until. */
  ban_type: "permanent" | "temporary";
  /** ISO 8601 datetime string. Required when ban_type is "temporary". */
  ban_until?: string;
  /** Optional reason — not yet stored by the backend. */
  reason?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Minutes used for a "permanent" ban (≈ 50 years).
 * The backend stores a concrete BannedUntil timestamp, so we approximate
 * permanence with this large value.
 */
const PERMANENT_BAN_MINUTES = 1000 * 365 * 24 * 60; // 26 280 000

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Converts a frontend BanPayload into the minutes period the backend expects.
 *
 * POST /api/users/:id/ban  body: { id, period }  (period in minutes, uint)
 */
function banPayloadToMinutes(payload: BanPayload): number {
  if (payload.ban_type === "permanent") {
    return PERMANENT_BAN_MINUTES;
  }
  const endMs = new Date(payload.ban_until!).getTime();
  const minutes = Math.round((endMs - Date.now()) / 60_000);
  // Ensure at least 1 minute so the backend uint binding does not reject 0.
  return Math.max(1, minutes);
}

// ─── Ban-duration display helper (commented — backend will return minutes) ────
//
// When the ban endpoint eventually returns the remaining ban time in minutes,
// use this function to convert it to a human-readable label for the frontend.
//
// function minutesToBanDuration(minutes: number): string {
//   if (minutes >= PERMANENT_BAN_MINUTES) return "Permanent";
//   const days = Math.floor(minutes / (60 * 24));
//   const hours = Math.floor((minutes % (60 * 24)) / 60);
//   const mins = minutes % 60;
//   const parts: string[] = [];
//   if (days > 0) parts.push(`${days}d`);
//   if (hours > 0) parts.push(`${hours}h`);
//   if (mins > 0) parts.push(`${mins}m`);
//   return parts.length > 0 ? parts.join(" ") : "< 1 minute";
// }

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const adminQueryKeys = {
  users: {
    all: ["admin", "users"] as const,
    search: (q: string) => ["admin", "users", "search", q] as const,
  },
} as const;

// ─── Queries ──────────────────────────────────────────────────────────────────

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
    queryKey: searchQuery ? adminQueryKeys.users.search(searchQuery) : adminQueryKeys.users.all,
    queryFn: async () => {
      // TODO: BACKEND — add ?search= query param support on the server.
      // When available, change to: `/users?search=${encodeURIComponent(searchQuery ?? "")}`
      const { data } = await apiClient.get<AdminUserDTO[]>("/users");
      return data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Ban a user (permanent or timed).
 *
 * Route:   POST /api/users/:id/ban
 * Auth:    Requires admin role
 * Body:    { id: number, period: number }  — period is in minutes (uint)
 * Returns: 204 No Content
 */
export function useBanUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, { userId: number; payload: BanPayload }>({
    mutationFn: async ({ userId, payload }) => {
      const period = banPayloadToMinutes(payload);
      await apiClient.post(`/users/${userId}/ban`, { id: userId, period });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users.all });
      // Re-fetch the full user list so ban status updates immediately
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.users.search(""),
      });
      void variables;
    },
  });
}

/**
 * Unban a user.
 *
 * Route:   POST /api/users/:id/unban
 * Auth:    Requires admin role
 * Body:    (none)
 * Returns: 204 No Content
 */
export function useUnbanUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, { userId: number }>({
    mutationFn: async ({ userId }) => {
      await apiClient.post(`/users/${userId}/unban`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users.all });
    },
  });
}

/**
 * Promote a user to a higher role.
 *
 * Route:   POST /api/users/:id/promote
 * Auth:    Requires admin role
 * Body:    { id: number, target_role: "admin" | "support" }
 * Returns: 204 No Content
 */
export function usePromoteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, { userId: number; targetRole: "admin" | "support" }>({
    mutationFn: async ({ userId, targetRole }) => {
      await apiClient.post(`/users/${userId}/promote`, {
        id: userId,
        target_role: targetRole,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users.all });
    },
  });
}

/**
 * Demote a user back to the base "user" role.
 *
 * Route:   POST /api/users/:id/demote
 * Auth:    Requires admin role
 * Body:    (none)
 * Returns: 204 No Content
 */
export function useDemoteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, { userId: number }>({
    mutationFn: async ({ userId }) => {
      await apiClient.post(`/users/${userId}/demote`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users.all });
    },
  });
}
