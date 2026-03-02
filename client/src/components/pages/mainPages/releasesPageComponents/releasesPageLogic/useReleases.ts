import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { Release } from "@/types/PageTypes";
import { exampleReleases } from "@/types/ExampleReleases";

export function useReleases(selectedOs: string) {
  const [allReleases, setAllReleases] = useState<Release[]>(exampleReleases);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [releasesToShow, setReleasesToShow] = useState(4);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReleases = useMemo(() => {
    return allReleases.filter((release) =>
      release.supports.includes(selectedOs),
    );
  }, [allReleases, selectedOs]);

  const hasMore = useMemo(() => {
    if (searchQuery) return false;
    return releasesToShow < filteredReleases.length;
  }, [searchQuery, releasesToShow, filteredReleases.length]);

  const visibleReleases = useMemo(() => {
    if (searchQuery) {
      return filteredReleases.filter((release) =>
        release.version.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return filteredReleases.slice(0, releasesToShow);
  }, [filteredReleases, releasesToShow, searchQuery]);

  const loadMore = useCallback(() => {
    if (!searchQuery) {
      setReleasesToShow((prev) => prev + 4);
    }
  }, [searchQuery]);

  // Use IntersectionObserver on a sentinel element at the bottom of the list.
  // Re-create the observer whenever visibleReleases changes so that it
  // re-evaluates whether the sentinel is still in view after new items load.
  // This handles the case where all items fit without scrolling — the sentinel
  // stays visible, and IntersectionObserver only fires on *transitions*, so
  // without re-observing it would only load one extra batch.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        root: container,
        rootMargin: "0px 0px 200px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore, visibleReleases.length]);

  function handleCreate(release: Release) {
    setAllReleases((prev) => [release, ...prev]);
  }

  function handleRemove(id: string) {
    setAllReleases((prev) => prev.filter((r) => r.id !== id));
  }

  function handleSearch(query: string) {
    setSearchQuery(query);
    setReleasesToShow(4);
  }

  return {
    allReleases,
    visibleReleases,
    containerRef,
    sentinelRef,
    hasMore,
    handleCreate,
    handleRemove,
    handleSearch,
  };
}
