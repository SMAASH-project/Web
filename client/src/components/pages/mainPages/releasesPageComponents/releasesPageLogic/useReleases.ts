import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { Release } from "@/types/PageTypes";
import { exampleReleases } from "@/types/ExampleReleases";

const PAGE_SIZE = 8;
const LOAD_DELAY_MS = 400;

export function useReleases(selectedOs: string) {
  const [allReleases, setAllReleases] = useState<Release[]>(exampleReleases);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastOs, setLastOs] = useState(selectedOs);

  // Reset page when OS changes (idiomatic React pattern — setState during render)
  if (lastOs !== selectedOs) {
    setLastOs(selectedOs);
    setPage(1);
  }

  const filteredReleases = useMemo(() => {
    return allReleases.filter((release) =>
      release.supports.includes(selectedOs),
    );
  }, [allReleases, selectedOs]);

  const hasMore = useMemo(() => {
    if (searchQuery) return false;
    return page * PAGE_SIZE < filteredReleases.length;
  }, [searchQuery, page, filteredReleases.length]);

  const visibleReleases = useMemo(() => {
    if (searchQuery) {
      return filteredReleases.filter((release) =>
        release.version.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return filteredReleases.slice(0, page * PAGE_SIZE);
  }, [filteredReleases, page, searchQuery]);

  // Debounced loadMore — delays the next page load so fast scrolling
  // doesn't instantly dump all items at once.
  const loadMore = useCallback(() => {
    if (searchQuery || isLoading) return;

    // Cancel any pending load
    if (loadTimerRef.current) {
      clearTimeout(loadTimerRef.current);
    }

    setIsLoading(true);

    loadTimerRef.current = setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsLoading(false);
      loadTimerRef.current = null;
    }, LOAD_DELAY_MS);
  }, [searchQuery, isLoading]);

  // Clean up pending timer on unmount
  useEffect(() => {
    return () => {
      if (loadTimerRef.current) {
        clearTimeout(loadTimerRef.current);
      }
    };
  }, []);

  // Use IntersectionObserver on a sentinel element at the bottom of the list.
  // Re-create the observer whenever visibleReleases changes so that it
  // re-evaluates whether the sentinel is still in view after new items load.
  // This handles the case where all items fit without scrolling — the sentinel
  // stays visible, and IntersectionObserver only fires on *transitions*, so
  // without re-observing it would only load one extra batch.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "0px 0px 200px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading, visibleReleases.length]);

  function handleCreate(release: Release) {
    setAllReleases((prev) => [release, ...prev]);
  }

  function handleRemove(id: string) {
    setAllReleases((prev) => prev.filter((r) => r.id !== id));
  }

  function handleSearch(query: string) {
    setSearchQuery(query);
    setPage(1);
  }

  return {
    allReleases,
    visibleReleases,
    containerRef,
    sentinelRef,
    hasMore,
    isLoading,
    handleCreate,
    handleRemove,
    handleSearch,
  };
}
