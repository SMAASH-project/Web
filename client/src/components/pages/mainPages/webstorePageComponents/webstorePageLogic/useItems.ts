import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { exampleItems } from "@/types/ExampleItems";

const PAGE_SIZE = 12;
const LOAD_DELAY_MS = 400;

export function useItems() {
  const allItems = exampleItems;
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRarity, setSelectedRarity] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(allItems.map((item) => item.category)));
    return ["All", ...cats.sort()];
  }, [allItems]);

  const rarities: string[] = [
    "All",
    "Common",
    "Uncommon",
    "Rare",
    "Epic",
    "Legendary",
  ];

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesRarity =
        selectedRarity === "All" || item.rarity === selectedRarity;
      return matchesCategory && matchesRarity;
    });
  }, [allItems, selectedCategory, selectedRarity]);

  const hasMore = useMemo(() => {
    if (searchQuery) return false;
    return page * PAGE_SIZE < filteredItems.length;
  }, [searchQuery, page, filteredItems.length]);

  const visibleItems = useMemo(() => {
    let items = filteredItems;
    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      return items;
    }
    return items.slice(0, page * PAGE_SIZE);
  }, [filteredItems, page, searchQuery]);

  const loadMore = useCallback(() => {
    if (searchQuery || isLoading) return;

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

  useEffect(() => {
    return () => {
      if (loadTimerRef.current) {
        clearTimeout(loadTimerRef.current);
      }
    };
  }, []);

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
  }, [loadMore, hasMore, isLoading, visibleItems.length]);

  function handleSearch(query: string) {
    setSearchQuery(query);
    setPage(1);
  }

  function handleCategoryChange(category: string) {
    setSelectedCategory(category);
    setPage(1);
  }

  function handleRarityChange(rarity: string) {
    setSelectedRarity(rarity);
    setPage(1);
  }

  return {
    allItems,
    visibleItems,
    containerRef,
    sentinelRef,
    hasMore,
    isLoading,
    categories,
    rarities,
    selectedCategory,
    selectedRarity,
    handleSearch,
    handleCategoryChange,
    handleRarityChange,
  };
}
