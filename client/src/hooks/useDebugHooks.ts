/**
 * Debug panel hooks — stats endpoints + admin coin editing.
 * Stats queries are used by both LeaderboardPage (public) and DebugPage (admin/support).
 * Coin mutation is admin-only (enforced by the backend PUT /profiles/:id route).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { AxiosError } from "axios";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface TopItemDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  rarity: string;
  categories: string[];
  count_of_purchases: number;
}

export interface TopPlayerDTO {
  id: number;
  display_name: string;
  coins: number;
  count_of_matches: number;
}

export interface TopLevelDTO {
  id: number;
  name: string;
  img_uri: string;
  count_of_plays: number;
}

export interface BestPlayerDTO {
  id: number;
  display_name: string;
  coins: number;
  count_of_wins: number;
}

export interface AdminProfileDTO {
  id: number;
  display_name: string;
  coins: number;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const debugQueryKeys = {
  topItems: ["debug", "stats", "topItems"] as const,
  topPlayers: ["debug", "stats", "topPlayers"] as const,
  topLevels: ["debug", "stats", "topLevels"] as const,
  leaderboard: ["debug", "stats", "leaderboard"] as const,
  allProfiles: ["debug", "allProfiles"] as const,
};

// ─── Stats Queries ────────────────────────────────────────────────────────────

export function useTopItemsQuery() {
  return useQuery<TopItemDTO[], AxiosError>({
    queryKey: debugQueryKeys.topItems,
    queryFn: async () => {
      const { data } = await apiClient.get<TopItemDTO[]>("/stats/top/items");
      return data ?? [];
    },
    staleTime: 60 * 1000,
  });
}

export function useTopPlayersQuery() {
  return useQuery<TopPlayerDTO[], AxiosError>({
    queryKey: debugQueryKeys.topPlayers,
    queryFn: async () => {
      const { data } =
        await apiClient.get<TopPlayerDTO[]>("/stats/top/players");
      return data ?? [];
    },
    staleTime: 60 * 1000,
  });
}

export function useTopLevelsQuery() {
  return useQuery<TopLevelDTO[], AxiosError>({
    queryKey: debugQueryKeys.topLevels,
    queryFn: async () => {
      const { data } = await apiClient.get<TopLevelDTO[]>("/stats/top/levels");
      return data ?? [];
    },
    staleTime: 60 * 1000,
  });
}

export function useLeaderboardQuery() {
  return useQuery<BestPlayerDTO[], AxiosError>({
    queryKey: debugQueryKeys.leaderboard,
    queryFn: async () => {
      const { data } =
        await apiClient.get<BestPlayerDTO[]>("/stats/leaderboard");
      return data ?? [];
    },
    staleTime: 60 * 1000,
  });
}

// ─── Admin: all profiles ──────────────────────────────────────────────────────

export function useAllProfilesQuery() {
  return useQuery<AdminProfileDTO[], AxiosError>({
    queryKey: debugQueryKeys.allProfiles,
    queryFn: async () => {
      const { data } = await apiClient.get<AdminProfileDTO[]>("/profiles", {
        params: { page: 1, page_size: 100 },
      });
      return data ?? [];
    },
    staleTime: 30 * 1000,
  });
}

// ─── Admin: update coins ──────────────────────────────────────────────────────
//
// PUT /profiles/:id  body: { id, display_name, coins }
// display_name is required by the backend DTO even when only coins change.

export function useUpdateCoinsMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError,
    { id: number; display_name: string; coins: number }
  >({
    mutationFn: async ({ id, display_name, coins }) => {
      await apiClient.put(`/profiles/${id}`, { id, display_name, coins });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: debugQueryKeys.allProfiles });
    },
  });
}
