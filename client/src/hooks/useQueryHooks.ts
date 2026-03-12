/**
 * React Query hooks for all API operations.
 * Replaces manual useEffect + useState data fetching patterns.
 */

import {
  useMutation,
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { queryKeys } from "@/lib/queryKeys";
import { AxiosError } from "axios";
import type { Release, WebstoreItem, NewsPost } from "@/types/PageTypes";

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

export interface AddProfilePayload {
  display_name: string;
  user_id: number;
}

export interface AddProfileResponse {
  id: number;
  display_name: string;
  coins: number;
  last_login: string;
}

export interface UpdateProfilePayload {
  id: number;
  display_name: string;
  coins: number;
}

export interface ProfileResponse {
  id: number;
  display_name: string;
  coins: number;
  last_login: string;
}

function clampDisplayName(name: string) {
  return name.trim().slice(0, 20);
}

function withUniqueSuffix(base: string) {
  const seed = Math.random().toString(36).slice(2, 6);
  const cleanBase = clampDisplayName(base);
  const maxBaseLength = 20 - (seed.length + 1);
  const safeBase = cleanBase.slice(0, Math.max(1, maxBaseLength));
  return `${safeBase}-${seed}`;
}

interface ProfileRollbackContext {
  snapshots: Array<{
    queryKey: readonly unknown[];
    previousData: ProfileResponse[] | undefined;
  }>;
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

// ─── Profile Queries ────────────────────────────────────────────────────────

export function useProfilesQuery(userId: number | null) {
  return useQuery<ProfileResponse[], AxiosError>({
    queryKey: queryKeys.profiles.byUserId(userId ?? 0),
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const { data } = await apiClient.get<ProfileResponse[]>(
        `/users/${userId}/profiles`,
      );
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

// ─── Profile Mutations ──────────────────────────────────────────────────────

export function useAddProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<AddProfileResponse, AxiosError, AddProfilePayload>({
    mutationFn: async (payload) => {
      const { user_id, ...body } = payload;
      let candidateName = clampDisplayName(body.display_name);

      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const { data } = await apiClient.post<AddProfileResponse>(
            `/users/${user_id}/profiles`,
            { display_name: candidateName },
          );
          return data;
        } catch (error) {
          const axiosError = error as AxiosError;
          const status = axiosError.response?.status;
          const isLastAttempt = attempt === 3;

          if (status !== 409 || isLastAttempt) {
            throw error;
          }

          candidateName = withUniqueSuffix(candidateName);
        }
      }

      throw new Error("Failed to create profile");
    },
    onMutate: async (variables) => {
      // Optimistically add the profile to the cache for instant UI feedback
      const requestedUserId = variables.user_id;
      if (!requestedUserId) {
        return undefined;
      }

      await queryClient.cancelQueries({
        queryKey: queryKeys.profiles.byUserId(requestedUserId),
      });

      const previousProfiles = queryClient.getQueryData(
        queryKeys.profiles.byUserId(requestedUserId),
      );

      // Create a temporary profile with the new data
      const tempProfile: ProfileResponse = {
        id: Date.now(), // Temporary ID
        display_name: variables.display_name,
        coins: 0,
        last_login: new Date().toISOString(),
      };

      queryClient.setQueryData(
        queryKeys.profiles.byUserId(requestedUserId),
        (old: ProfileResponse[] | undefined) => [...(old || []), tempProfile],
      );

      return { previousProfiles, userId: requestedUserId };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      const rollbackContext = context as
        | { previousProfiles: ProfileResponse[]; userId: number }
        | undefined;
      if (rollbackContext?.previousProfiles && rollbackContext.userId) {
        queryClient.setQueryData(
          queryKeys.profiles.byUserId(rollbackContext.userId),
          rollbackContext.previousProfiles,
        );
      }
    },
    onSuccess: async (_data, variables) => {
      // Immediately refetch profiles list after adding
      const requestedUserId = variables.user_id;
      if (requestedUserId) {
        await queryClient.refetchQueries({
          queryKey: queryKeys.profiles.byUserId(requestedUserId),
        });
      }
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError,
    {
      profileId: number;
      payload: UpdateProfilePayload;
      optimistic?: boolean;
      invalidateAfterSuccess?: boolean;
    }
  >({
    mutationFn: async ({ profileId, payload }) => {
      await apiClient.put(`/profiles/${profileId}`, payload);
    },
    onMutate: async ({ profileId, payload, optimistic }) => {
      if (optimistic === false) {
        return;
      }

      queryClient.setQueriesData<ProfileResponse[]>(
        { queryKey: queryKeys.profiles.all },
        (old) => {
          if (!old) return old;
          return old.map((p) =>
            p.id === profileId
              ? { ...p, display_name: payload.display_name }
              : p,
          );
        },
      );
    },
    onSuccess: (_data, variables) => {
      if (variables.invalidateAfterSuccess === false) {
        return;
      }

      // Invalidate all profile queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.profiles.all,
      });
    },
  });
}

export function useDeleteProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, number, ProfileRollbackContext>({
    mutationFn: async (profileId) => {
      await apiClient.delete(`/profiles/${profileId}`);
    },
    onMutate: async (profileId) => {
      // Optimistically remove the profile from cache immediately
      // so the tombstone name never appears in the UI
      const snapshots: ProfileRollbackContext["snapshots"] = [];
      const profileQueries = queryClient
        .getQueryCache()
        .findAll({ queryKey: queryKeys.profiles.all });

      profileQueries.forEach((query) => {
        const previousData = queryClient.getQueryData<ProfileResponse[]>(
          query.queryKey,
        );
        snapshots.push({
          queryKey: query.queryKey,
          previousData,
        });

        queryClient.setQueryData<ProfileResponse[]>(query.queryKey, (old) => {
          if (!old) return old;
          return old.filter((p) => p.id !== profileId);
        });
      });

      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      if (!context?.snapshots) return;

      context.snapshots.forEach(({ queryKey, previousData }) => {
        queryClient.setQueryData(queryKey, previousData);
      });
    },
    onSettled: () => {
      // Invalidate all profile queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.profiles.all,
      });
    },
  });
}

// ─── Releases Queries (with infinite scroll support) ────────────────────────

interface PaginatedReleases {
  releases: Release[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

interface PaginatedItems {
  items: WebstoreItem[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

interface PaginatedNews {
  posts: NewsPost[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

/**
 * Infinite query for releases with pagination.
 * Use with useInfiniteQuery's hasNextPage and fetchNextPage.
 */
export function useReleasesInfiniteQuery(os: string, pageSize: number = 8) {
  return useInfiniteQuery<PaginatedReleases, AxiosError>({
    queryKey: queryKeys.releases.infinite(os),
    queryFn: async ({ pageParam = 1 }) => {
      // This assumes your backend supports pagination
      // Adjust endpoint/params based on your actual API
      const { data } = await apiClient.get<PaginatedReleases>(`/releases`, {
        params: {
          os,
          page: pageParam,
          pageSize,
        },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.page ?? 1) + 1 : undefined,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}

/**
 * Infinite query for webstore items with pagination and filtering.
 * Supports filtering by kind, rarity, combat type, and ownership.
 */
export function useItemsInfiniteQuery(
  filters: {
    kind?: string;
    rarity?: string;
    combatType?: string;
    ownership?: string;
  } = {},
  pageSize: number = 12,
) {
  return useInfiniteQuery<PaginatedItems, AxiosError>({
    queryKey: queryKeys.items.infinite,
    queryFn: async ({ pageParam = 1 }) => {
      // Backend should support pagination + filters
      const { data } = await apiClient.get<PaginatedItems>(`/items`, {
        params: {
          ...filters,
          page: pageParam,
          pageSize,
        },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.page ?? 1) + 1 : undefined,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
}

/**
 * Infinite query for news posts with pagination and category filtering.
 */
export function useNewsInfiniteQuery(
  categories: string[] = [],
  pageSize: number = 10,
) {
  return useInfiniteQuery<PaginatedNews, AxiosError>({
    queryKey: queryKeys.news.byCategory(categories),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await apiClient.get<PaginatedNews>(`/news`, {
        params: {
          categories: categories.join(","),
          page: pageParam,
          pageSize,
        },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.page ?? 1) + 1 : undefined,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
}
