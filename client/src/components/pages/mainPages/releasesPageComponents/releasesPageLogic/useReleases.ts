import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { queryKeys } from "@/lib/queryKeys";
import type { Release } from "@/types/PageTypes";

// ─── Configuration ────────────────────────────────────────────────────────────

const GITHUB_REPO = "SMAASH-project/SMAASH";
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases`;

/**
 * Unauthenticated GitHub API — 60 requests/hour per IP.
 * staleTime of 10 minutes means React Query only refetches when data is older
 * than 10 minutes, keeping well within the rate limit in normal usage.
 * If the app is ever made private, move this fetch to a backend proxy endpoint
 * so the GitHub token never ships in the client bundle.
 */
const GITHUB_STALE_TIME = 0; // always treat as stale so refetches go through
const GITHUB_GC_TIME = 30 * 60 * 1000; // 30 minutes
const GITHUB_REFETCH_INTERVAL = 5 * 60 * 1000; // poll every 5 minutes

const PAGE_SIZE = 8;
const LOAD_DELAY_MS = 400;

// ─── Asset naming convention ──────────────────────────────────────────────────
//
// Platform detection is based purely on file extension of each GitHub release
// asset. For this to work reliably, upload assets with these extensions:
//
//   Android : .apk   (e.g.  smaash-v1.2.3-android.apk)
//             .aab   (e.g.  smaash-v1.2.3-android.aab)
//   iOS     : .ipa   (e.g.  smaash-v1.2.3-ios.ipa)
//
// Recommended full naming convention:
//   {appname}-v{version}-android.apk
//   {appname}-v{version}-ios.ipa
//
// If you later adopt a different convention, update PLATFORM_MATCHERS below.
//
const PLATFORM_MATCHERS: { os: string; test: (name: string) => boolean }[] = [
  {
    os: "Android",
    // Matches any asset whose filename ends in .apk or .aab (case-insensitive)
    test: (name) => /\.(apk|aab)$/i.test(name),
  },
  {
    os: "iOS",
    // Matches any asset whose filename ends in .ipa (case-insensitive)
    test: (name) => /\.ipa$/i.test(name),
  },
];

// ─── GitHub API types ─────────────────────────────────────────────────────────

interface GitHubAsset {
  id: number;
  name: string;
  browser_download_url: string;
  size: number;
  content_type: string;
}

interface GitHubRelease {
  id: number;
  tag_name: string; // e.g. "v1.2.3"
  name: string; // e.g. "Release v1.2.3"
  published_at: string; // ISO 8601
  prerelease: boolean;
  draft: boolean;
  assets: GitHubAsset[];
}

// ─── Mapping ──────────────────────────────────────────────────────────────────

/**
 * Strips a leading "v" from a tag name so "v1.2.3" becomes "1.2.3".
 * If the tag doesn't start with "v", it is returned as-is.
 */
function tagToVersion(tag: string): string {
  return tag.startsWith("v") ? tag.slice(1) : tag;
}

/**
 * Maps a single GitHub release to our internal Release type.
 *
 * supports[]   — derived from which assets match PLATFORM_MATCHERS.
 * downloadUrls — maps each matched platform name to its browser_download_url.
 *
 * Drafts and pre-releases are excluded upstream (see the queryFn below).
 */
function githubReleaseToRelease(gh: GitHubRelease): Release {
  const downloadUrls: Partial<Record<string, string>> = {};
  const supports: string[] = [];

  for (const asset of gh.assets) {
    for (const { os, test } of PLATFORM_MATCHERS) {
      if (test(asset.name) && !downloadUrls[os]) {
        // First matching asset per platform wins
        downloadUrls[os] = asset.browser_download_url;
        if (!supports.includes(os)) {
          supports.push(os);
        }
      }
    }
  }

  return {
    id: String(gh.id),
    version: tagToVersion(gh.tag_name),
    supports,
    downloadUrls,
    createdAt: DateTime.fromISO(gh.published_at),
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useReleases(selectedOs: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastOs, setLastOs] = useState(selectedOs);

  // Reset page when OS filter changes
  if (lastOs !== selectedOs) {
    setLastOs(selectedOs);
    setPage(1);
  }

  // ── GitHub fetch ──────────────────────────────────────────────────────────
  const {
    data: allReleases = [],
    isLoading: isFetching,
    error,
  } = useQuery<Release[]>({
    queryKey: queryKeys.githubReleases.all,
    queryFn: async () => {
      // ?per_page=100 fetches up to 100 releases in one call.
      // If you ever ship more than 100 releases, add pagination here.
      const res = await fetch(`${GITHUB_API_URL}?per_page=100`);

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as Record<
          string,
          unknown
        >;
        throw new Error(
          (body?.message as string) ??
            `GitHub API error: ${res.status} ${res.statusText}`,
        );
      }

      const releases: GitHubRelease[] = (await res.json()) as GitHubRelease[];

      return (
        releases
          // Skip drafts and pre-releases — only show stable published releases
          .filter((r) => !r.draft && !r.prerelease)
          // Sort newest first on the raw ISO string before mapping
          // (avoids calling .toMillis() on the Luxon DateTime type)
          .sort((a, b) => b.published_at.localeCompare(a.published_at))
          .map(githubReleaseToRelease)
      );
    },
    staleTime: GITHUB_STALE_TIME,
    gcTime: GITHUB_GC_TIME,
    refetchInterval: GITHUB_REFETCH_INTERVAL,
    refetchOnMount: true,
    retry: 2,
  });

  // ── Filtering ─────────────────────────────────────────────────────────────

  const filteredReleases = useMemo(
    () => allReleases.filter((r) => r.supports.includes(selectedOs)),
    [allReleases, selectedOs],
  );

  const hasMore = useMemo(() => {
    if (searchQuery) return false;
    return page * PAGE_SIZE < filteredReleases.length;
  }, [searchQuery, page, filteredReleases.length]);

  const visibleReleases = useMemo(() => {
    if (searchQuery) {
      return filteredReleases.filter((r) =>
        r.version.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return filteredReleases.slice(0, page * PAGE_SIZE);
  }, [filteredReleases, page, searchQuery]);

  // ── Infinite scroll ───────────────────────────────────────────────────────

  const loadMore = useCallback(() => {
    if (searchQuery || isLoadingMore) return;
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    setIsLoadingMore(true);
    loadTimerRef.current = setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsLoadingMore(false);
      loadTimerRef.current = null;
    }, LOAD_DELAY_MS);
  }, [searchQuery, isLoadingMore]);

  useEffect(() => {
    return () => {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { root: null, rootMargin: "0px 0px 200px 0px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoadingMore, visibleReleases.length]);

  // ── Search ────────────────────────────────────────────────────────────────

  function handleSearch(query: string) {
    setSearchQuery(query);
    setPage(1);
  }

  return {
    visibleReleases,
    containerRef,
    sentinelRef,
    hasMore,
    isLoading: isFetching || isLoadingMore,
    fetchError: error instanceof Error ? error.message : null,
    handleSearch,
  };
}
