/**
 * Debug panel hooks — stats, game data, and admin tools.
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

export interface DebugCharacterDTO {
  id: number;
  name: string;
  img_uri: string;
}

export interface DebugLevelDTO {
  id: number;
  name: string;
  img_uri: string;
}

export interface DebugItemDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  rarity: string;
  categories: string[];
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const debugQueryKeys = {
  topItems: ["debug", "stats", "topItems"] as const,
  topPlayers: ["debug", "stats", "topPlayers"] as const,
  topLevels: ["debug", "stats", "topLevels"] as const,
  leaderboard: ["debug", "stats", "leaderboard"] as const,
  characters: ["debug", "game", "characters"] as const,
  levels: ["debug", "game", "levels"] as const,
  items: ["debug", "game", "items"] as const,
};

// ─── Stats (also used by LeaderboardPage) ─────────────────────────────────────

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
      const { data } = await apiClient.get<TopPlayerDTO[]>("/stats/top/players");
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
      const { data } = await apiClient.get<BestPlayerDTO[]>("/stats/leaderboard");
      return data ?? [];
    },
    staleTime: 60 * 1000,
  });
}

// ─── Game data (admin-only endpoints) ─────────────────────────────────────────

export function useDebugCharactersQuery() {
  return useQuery<DebugCharacterDTO[], AxiosError>({
    queryKey: debugQueryKeys.characters,
    queryFn: async () => {
      const { data } = await apiClient.get<DebugCharacterDTO[]>("/characters");
      return data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useDebugLevelsQuery() {
  return useQuery<DebugLevelDTO[], AxiosError>({
    queryKey: debugQueryKeys.levels,
    queryFn: async () => {
      const { data } = await apiClient.get<DebugLevelDTO[]>("/levels");
      return data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useDebugItemsQuery() {
  return useQuery<DebugItemDTO[], AxiosError>({
    queryKey: debugQueryKeys.items,
    queryFn: async () => {
      const { data } = await apiClient.get<DebugItemDTO[]>("/items", {
        params: { page: 1, page_size: 100 },
      });
      return data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}
