import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { releases, type Release } from "@/types/PageTypes";

export function useReleases(selectedOs: string) {
  const [allReleases, setAllReleases] = useState<Release[]>(releases);
  const containerRef = useRef<HTMLDivElement>(null);
  const [releasesToShow, setReleasesToShow] = useState(4);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReleases = useMemo(() => {
    return allReleases.filter((release) =>
      release.supports.includes(selectedOs),
    );
  }, [allReleases, selectedOs]);

  const visibleReleases = useMemo(() => {
    if (searchQuery) {
      return filteredReleases.filter((release) =>
        release.version.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return filteredReleases.slice(0, releasesToShow);
  }, [filteredReleases, releasesToShow, searchQuery]);

  const handleScroll = useCallback(() => {
    if (containerRef.current && !searchQuery) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        setReleasesToShow((prev) => prev + 4);
      }
    }
  }, [searchQuery]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

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
    handleCreate,
    handleRemove,
    handleSearch,
  };
}
