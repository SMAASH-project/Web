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

export interface AdminProfileDTO {
  id: number;
  display_name: string;
  user_id: number;
  coins: number;
  pfp_uri: string;
}

export interface PurchaseDTO {
  id: number;
  player_profile_id: number;
  character_id: number;
  count: number;
}

export interface RoleDTO {
  id: number;
  name: string;
}

export interface CategoryDTO {
  id: number;
  name: string;
}

export interface RarityDTO {
  id: number;
  name: string;
}

export interface PostDTO {
  id: number;
  created_at: string;
  updated_at: string;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const debugQueryKeys = {
  topItems: ["debug", "stats", "topItems"] as const,
  topPlayers: ["debug", "stats", "topPlayers"] as const,
  topLevels: ["debug", "stats", "topLevels"] as const,
  leaderboard: ["debug", "stats", "leaderboard"] as const,
  characters: ["debug", "game", "characters"] as const,
  levels: ["debug", "game", "levels"] as const,
  // db panel
  profiles: ["debug", "db", "profiles"] as const,
  purchases: ["debug", "db", "purchases"] as const,
  roles: ["debug", "db", "roles"] as const,
  categories: ["debug", "db", "categories"] as const,
  rarities: ["debug", "db", "rarities"] as const,
  posts: ["debug", "db", "posts"] as const,
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

// ─── Game data ────────────────────────────────────────────────────────────────

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

// ─── Game data mutations ───────────────────────────────────────────────────────

/**
 * Create a new character.
 *
 * Route:   POST /api/characters
 * Auth:    Requires admin role
 * Body:    { name: string }
 * Returns: 201 Created
 */
export function useCreateCharacterMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, { name: string }>({
    mutationFn: async (body) => {
      await apiClient.post("/characters", body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.characters }),
  });
}

/**
 * Update an existing character's name.
 *
 * Route:   PUT /api/characters/:id
 * Auth:    Requires admin role
 * Body:    { name: string }
 * Returns: 204 No Content
 */
export function useUpdateCharacterMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, { id: number; name: string }>({
    mutationFn: async ({ id, name }) => {
      await apiClient.put(`/characters/${id}`, { name });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.characters }),
  });
}

/**
 * Delete a character by ID.
 *
 * Route:   DELETE /api/characters/:id
 * Auth:    Requires admin role
 * Returns: 204 No Content
 */
export function useDeleteCharacterMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, number>({
    mutationFn: async (id) => {
      await apiClient.delete(`/characters/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.characters }),
  });
}

/**
 * Create a new level.
 *
 * Route:   POST /api/levels
 * Auth:    Requires admin role
 * Body:    { name: string }
 * Returns: 201 Created
 */
export function useCreateLevelMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, { name: string }>({
    mutationFn: async (body) => {
      await apiClient.post("/levels", body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.levels }),
  });
}

/**
 * Update an existing level's name.
 *
 * Route:   PUT /api/levels/:id
 * Auth:    Requires admin role
 * Body:    { name: string }
 * Returns: 204 No Content
 */
export function useUpdateLevelMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, { id: number; name: string }>({
    mutationFn: async ({ id, name }) => {
      await apiClient.put(`/levels/${id}`, { name });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.levels }),
  });
}

/**
 * Delete a level by ID.
 *
 * Route:   DELETE /api/levels/:id
 * Auth:    Requires admin role
 * Returns: 204 No Content
 */
export function useDeleteLevelMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, number>({
    mutationFn: async (id) => {
      await apiClient.delete(`/levels/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.levels }),
  });
}

// ─── DB panel queries ─────────────────────────────────────────────────────────

/**
 * Fetch all player profiles (admin only, up to 200 results).
 *
 * Endpoint: GET /api/profiles?page=1&page_size=200
 * Auth:     Requires admin role
 */
export function useAdminProfilesQuery() {
  return useQuery<AdminProfileDTO[], AxiosError>({
    queryKey: debugQueryKeys.profiles,
    queryFn: async () => {
      const { data } = await apiClient.get<AdminProfileDTO[]>("/profiles", {
        params: { page: 1, page_size: 200 },
      });
      return data ?? [];
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch all purchases (admin only).
 *
 * Endpoint: GET /api/purchases
 * Auth:     Requires admin role
 */
export function useAdminPurchasesQuery() {
  return useQuery<PurchaseDTO[], AxiosError>({
    queryKey: debugQueryKeys.purchases,
    queryFn: async () => {
      const { data } = await apiClient.get<PurchaseDTO[]>("/purchases");
      return data ?? [];
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch all roles.
 *
 * Endpoint: GET /api/roles
 */
export function useRolesQuery() {
  return useQuery<RoleDTO[], AxiosError>({
    queryKey: debugQueryKeys.roles,
    queryFn: async () => {
      const { data } = await apiClient.get<RoleDTO[]>("/roles");
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch all item categories.
 *
 * Endpoint: GET /api/categories
 */
export function useCategoriesQuery() {
  return useQuery<CategoryDTO[], AxiosError>({
    queryKey: debugQueryKeys.categories,
    queryFn: async () => {
      const { data } = await apiClient.get<CategoryDTO[]>("/categories");
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch all item rarities.
 *
 * Endpoint: GET /api/rarities
 */
export function useRaritiesQuery() {
  return useQuery<RarityDTO[], AxiosError>({
    queryKey: debugQueryKeys.rarities,
    queryFn: async () => {
      const { data } = await apiClient.get<RarityDTO[]>("/rarities");
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch all posts (up to 100).
 *
 * Endpoint: GET /api/posts?page=1&page_size=100
 * Note:     No DELETE endpoint exists for posts; the list DTO only exposes id and timestamps.
 */
export function usePostsQuery() {
  return useQuery<PostDTO[], AxiosError>({
    queryKey: debugQueryKeys.posts,
    queryFn: async () => {
      const { data } = await apiClient.get<PostDTO[]>("/posts", {
        params: { page: 1, page_size: 100 },
      });
      return data ?? [];
    },
    staleTime: 30 * 1000,
  });
}

// ─── DB panel mutations ───────────────────────────────────────────────────────

/**
 * Update a player profile's display name and coin balance.
 *
 * Route:   PUT /api/profiles/:id
 * Auth:    Requires admin role
 * Body:    { display_name, coins }
 * Returns: 204 No Content
 */
export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, { id: number; display_name: string; coins: number }>({
    mutationFn: async ({ id, ...body }) => {
      await apiClient.put(`/profiles/${id}`, body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.profiles }),
  });
}

/**
 * Delete a player profile by ID (hard delete, cascades to purchases).
 *
 * Route:   DELETE /api/profiles/:id
 * Auth:    Requires admin role
 * Returns: 204 No Content
 */
export function useDeleteProfileMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, number>({
    mutationFn: async (id) => {
      await apiClient.delete(`/profiles/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.profiles }),
  });
}

/**
 * Create a purchase record (automatically deducts coins from the profile).
 *
 * Route:   POST /api/purchases
 * Auth:    Any authenticated user (admin in debug context)
 * Body:    { player_profile_id, character_id }
 * Returns: 201 Created
 */
export function useCreatePurchaseMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, { player_profile_id: number; character_id: number }>({
    mutationFn: async (body) => {
      await apiClient.post("/purchases", body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.purchases }),
  });
}

/**
 * Update a purchase record (admin only).
 *
 * Route:   PUT /api/purchases/:id
 * Auth:    Requires admin role
 * Body:    { player_profile_id, character_id }
 * Returns: 204 No Content
 */
export function useUpdatePurchaseMutation() {
  const qc = useQueryClient();
  return useMutation<
    void,
    AxiosError,
    { id: number; player_profile_id: number; character_id: number }
  >({
    mutationFn: async ({ id, ...body }) => {
      await apiClient.put(`/purchases/${id}`, body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.purchases }),
  });
}

/**
 * Delete a purchase record by ID (admin only).
 *
 * Route:   DELETE /api/purchases/:id
 * Auth:    Requires admin role
 * Returns: 204 No Content
 */
export function useDeletePurchaseMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, number>({
    mutationFn: async (id) => {
      await apiClient.delete(`/purchases/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.purchases }),
  });
}

/**
 * Create a new role (admin only).
 *
 * Route:   POST /api/roles
 * Auth:    Requires admin role
 * Body:    { name: string }
 * Returns: 201 Created
 */
export function useCreateRoleMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, { name: string }>({
    mutationFn: async (body) => {
      await apiClient.post("/roles", body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.roles }),
  });
}

/**
 * Update a role's name (admin only).
 *
 * Route:   PUT /api/roles/:id
 * Auth:    Requires admin role
 * Body:    { name: string }
 * Returns: 204 No Content
 */
export function useUpdateRoleMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, { id: number; name: string }>({
    mutationFn: async ({ id, name }) => {
      await apiClient.put(`/roles/${id}`, { name });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.roles }),
  });
}

/**
 * Delete a role by ID (admin only).
 *
 * Route:   DELETE /api/roles/:id
 * Auth:    Requires admin role
 * Returns: 204 No Content
 */
export function useDeleteRoleMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, number>({
    mutationFn: async (id) => {
      await apiClient.delete(`/roles/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.roles }),
  });
}

/**
 * Create a new item category (admin only).
 *
 * Route:   POST /api/categories
 * Auth:    Requires admin role
 * Body:    { name: string }
 * Returns: 201 Created
 */
export function useCreateCategoryMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, { name: string }>({
    mutationFn: async (body) => {
      await apiClient.post("/categories", body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.categories }),
  });
}

/**
 * Update a category's name (admin only).
 *
 * Route:   PUT /api/categories/:id
 * Auth:    Requires admin role
 * Body:    { name: string }
 * Returns: 204 No Content
 */
export function useUpdateCategoryMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, { id: number; name: string }>({
    mutationFn: async ({ id, name }) => {
      await apiClient.put(`/categories/${id}`, { name });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.categories }),
  });
}

/**
 * Delete a category by ID (admin only).
 *
 * Route:   DELETE /api/categories/:id
 * Auth:    Requires admin role
 * Returns: 204 No Content
 */
export function useDeleteCategoryMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, number>({
    mutationFn: async (id) => {
      await apiClient.delete(`/categories/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.categories }),
  });
}

/**
 * Create a new item rarity tier (admin only).
 *
 * Route:   POST /api/rarities
 * Auth:    Requires admin role
 * Body:    { name: string }
 * Returns: 201 Created
 */
export function useCreateRarityMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, { name: string }>({
    mutationFn: async (body) => {
      await apiClient.post("/rarities", body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.rarities }),
  });
}

/**
 * Update a rarity tier's name (admin only).
 *
 * Route:   PUT /api/rarities/:id
 * Auth:    Requires admin role
 * Body:    { name: string }
 * Returns: 204 No Content
 */
export function useUpdateRarityMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, { id: number; name: string }>({
    mutationFn: async ({ id, name }) => {
      await apiClient.put(`/rarities/${id}`, { name });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.rarities }),
  });
}

/**
 * Delete a rarity tier by ID (admin only).
 *
 * Route:   DELETE /api/rarities/:id
 * Auth:    Requires admin role
 * Returns: 204 No Content
 */
export function useDeleteRarityMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, number>({
    mutationFn: async (id) => {
      await apiClient.delete(`/rarities/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.rarities }),
  });
}

/**
 * Create a new post (admin only).
 *
 * Route:   POST /api/posts
 * Auth:    Requires admin role
 * Note:    The list DTO only exposes id/timestamps; full post fields are not reflected here.
 * Returns: 201 Created
 */
export function useCreatePostMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, Record<string, unknown>>({
    mutationFn: async (body) => {
      await apiClient.post("/posts", body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.posts }),
  });
}

/**
 * Update a post by ID (admin only).
 *
 * Route:   PUT /api/posts/:id
 * Auth:    Requires admin role
 * Returns: 204 No Content
 */
export function useUpdatePostMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, { id: number } & Record<string, unknown>>({
    mutationFn: async ({ id, ...body }) => {
      await apiClient.put(`/posts/${id}`, body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: debugQueryKeys.posts }),
  });
}

/**
 * Update a user's email (admin only). Password cannot be changed via this endpoint.
 *
 * Route:   PUT /api/users/:id
 * Auth:    Requires admin role
 * Body:    { email: string, role_id?: number }
 * Returns: 204 No Content
 */
export function useUpdateUserMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, { id: number; email: string; role_id?: number }>({
    mutationFn: async ({ id, ...body }) => {
      await apiClient.put(`/users/${id}`, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

/**
 * Delete a user by ID (admin only). Cascades to profiles, purchases, and match records.
 *
 * Route:   DELETE /api/users/:id
 * Auth:    Requires admin role
 * Returns: 204 No Content
 */
export function useDeleteUserMutation() {
  const qc = useQueryClient();
  return useMutation<void, AxiosError, number>({
    mutationFn: async (id) => {
      await apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
