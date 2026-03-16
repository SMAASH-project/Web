/**
 * Barrel re-export of all React Query hooks.
 * Import directly from the domain-specific hook files for better tree-shaking,
 * or import from here for convenience — both styles work.
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
  id: number;
  role: string;
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
  profile_picture?: File | null;
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
  avatar_url?: string;
}

function getProfilePictureUrl(profileId: number, versionSeed: number) {
  // return `/api/profiles/${profileId}/pfp?v=${versionSeed}`;
  return `/api/profiles/${profileId}/pfp`;
}

async function uploadProfilePicture(profileId: number, file: File) {
  const formData = new FormData();
  formData.append("profilePicture", file);

  await apiClient.post(`/profiles/${profileId}/pfpupload`, formData);
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

      const versionSeed = Date.now();
      return data.map((profile) => ({
        ...profile,
        avatar_url: getProfilePictureUrl(profile.id, versionSeed),
      }));
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
      const { user_id, profile_picture, ...body } = payload;
      let candidateName = clampDisplayName(body.display_name);

      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const { data } = await apiClient.post<AddProfileResponse>(
            `/users/${user_id}/profiles`,
            { display_name: candidateName },
          );

          if (profile_picture) {
            try {
              await uploadProfilePicture(data.id, profile_picture);
            } catch (uploadError) {
              console.error(
                "Profile created but picture upload failed:",
                uploadError,
              );
            }
          }

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
    onSuccess: async (_data, variables) => {
      const requestedUserId = variables.user_id;
      if (!requestedUserId) {
        return;
      }

      // Always refetch after adding a profile to ensure fresh list
      try {
        await queryClient.refetchQueries({
          queryKey: queryKeys.profiles.byUserId(requestedUserId),
          type: "active",
        });
      } catch (err) {
        console.error("Failed to refetch profiles after add:", err);
      }
    },
  });
}

export function useUploadProfilePictureMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, { profileId: number; file: File }>({
    mutationFn: async ({ profileId, file }) => {
      await uploadProfilePicture(profileId, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.profiles.all,
      });
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

  return useMutation<void, AxiosError, { profileId: number; userId: number }>({
    mutationFn: async ({ profileId }) => {
      await apiClient.delete(`/profiles/${profileId}`);
    },
    onMutate: async ({ profileId, userId }) => {
      // Cancel any in-flight queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.profiles.byUserId(userId),
      });

      // Snapshot previous data
      const previousData = queryClient.getQueryData<ProfileResponse[]>(
        queryKeys.profiles.byUserId(userId),
      );

      // Optimistically remove from cache
      queryClient.setQueryData<ProfileResponse[]>(
        queryKeys.profiles.byUserId(userId),
        (old) => {
          if (!old) return old;
          return old.filter((p) => p.id !== profileId);
        },
      );

      return { previousData, userId };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      const rollbackContext = context as
        | { previousData: ProfileResponse[] | undefined; userId: number }
        | undefined;
      if (rollbackContext?.previousData !== undefined) {
        queryClient.setQueryData(
          queryKeys.profiles.byUserId(rollbackContext.userId),
          rollbackContext.previousData,
        );
      }
    },
    onSuccess: async (_data, variables) => {
      // Refetch after deleting to ensure fresh list
      try {
        await queryClient.refetchQueries({
          queryKey: queryKeys.profiles.byUserId(variables.userId),
          type: "active",
        });
      } catch (err) {
        console.error("Failed to refetch profiles after delete:", err);
      }
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
export * from "./useAuthHooks";
export * from "./useProfileHooks";
export * from "./useContentHooks";
