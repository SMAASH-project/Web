import { useInfiniteQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { queryKeys } from "@/lib/queryKeys";
import { AxiosError } from "axios";
import type { Release, WebstoreItem, NewsPost } from "@/types/PageTypes";

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

// ─── Releases Queries (with infinite scroll support) ────────────────────────

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
